import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { z } from 'zod';
import { PrismaClient } from "@generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";

// OpenAI API response types
interface OpenAIChoice {
  message: {
    content: string;
    role: string;
  };
  finish_reason: string;
  index: number;
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Zod schema for individual flashcard
const FlashcardSchema = z.object({
  portuguese: z.string().min(1),
  english: z.string().min(1),
  phonetic: z.string().min(1), // Phonetic guide for American English speakers
});

// Zod schema for the complete flashcard pack
const FlashcardPackSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  emoji: z.string().min(1).max(10), // Should be a single emoji or small group
  category: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number().min(1).max(120),
  cards: z.array(FlashcardSchema).min(10).max(100), // Aim for ~50 but allow flexibility
});

// Workflow event parameters
type FlashcardPackGenerationParams = {
  userPrompt: string;
  userId?: string; // Optional - defaults to "all"
};

// Environment bindings
type Env = {
  DB: D1Database;
  AI: Ai;
  FLASHCARD_PACK_GENERATOR: Workflow;
  AI_GATEWAY_TOKEN: string;
  AI_GATEWAY_ID: string;
  OPENAI_API_KEY: string;
};

export class FlashcardPackGenerator extends WorkflowEntrypoint<Env, FlashcardPackGenerationParams> {
  async run(event: WorkflowEvent<FlashcardPackGenerationParams>, step: WorkflowStep) {
    console.log("🚀 FlashcardPackGenerator workflow started");
    console.log("📥 Input params:", { userPrompt: event.payload.userPrompt, userId: event.payload.userId });
    
    const { userPrompt, userId = "all" } = event.payload;

    // Step 1: Enhance the user prompt for better LLM understanding
    console.log("⚡ Starting Step 1: Enhance user prompt");
    const enhancedPrompt = await step.do("enhance user prompt", async () => {
      console.log("🔄 Building prompt enhancement request for:", userPrompt);
      const promptEnhancementRequest = {
        messages: [
          {
            role: "system",
            content: `You are a prompt enhancement specialist for Portuguese language learning flashcard generation. 
Your job is to take a user's request for flashcards and transform it into a clear, detailed prompt that will help an AI generate high-quality Portuguese flashcards.

Consider these aspects when enhancing:
- Clarify the specific learning goal or situation
- Specify the appropriate difficulty level if not mentioned
- Suggest the most suitable category (basics, situations, grammar)
- Add context about formality level needed
- Estimate appropriate number of cards for the topic

Return only the enhanced prompt, nothing else.`
          },
          {
            role: "user", 
            content: `Please enhance this flashcard request: "${userPrompt}"`
          }
        ]
      };

      console.log("🤖 Calling OpenAI via AI Gateway for prompt enhancement...");
      const gateway = this.env.AI.gateway(this.env.AI_GATEWAY_ID);
      const openaiUrl = await gateway.getUrl("openai");
      
      const response = await fetch(`${openaiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-aig-authorization': `Bearer ${this.env.AI_GATEWAY_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: promptEnhancementRequest.messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.error("❌ OpenAI API error:", response.status, response.statusText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OpenAIResponse;
      
      console.log("📋 AI response received:", { 
        hasResponse: !!data.choices?.[0]?.message?.content, 
        responseLength: data.choices?.[0]?.message?.content?.length || 0 
      });
      
      if (!data.choices?.[0]?.message?.content) {
        console.error("❌ No response from OpenAI for prompt enhancement");
        throw new Error("Failed to enhance prompt - no response from OpenAI");
      }

      const enhanced = data.choices[0].message.content.trim();
      console.log("✅ Enhanced prompt:", enhanced);
      return enhanced;
    });

    console.log("⚡ Starting Step 2: Generate flashcard pack");
    console.log("📝 Using enhanced prompt for generation:", enhancedPrompt);
    
    // Step 2: Generate the flashcard pack using the enhanced prompt
    const generatedPack = await step.do("generate flashcard pack", 
      {
        retries: {
          limit: 3,
          delay: "10 seconds",
          backoff: "exponential"
        },
        timeout: "5 minutes"
      },
      async () => {
        const generateFlashcardPack = async (isRetry = false, validationErrors: string = '') => {
          console.log(isRetry ? "🔄 Retrying flashcard generation with validation feedback" : "🔄 Building system prompt for flashcard generation");
          
          let systemPrompt = `You are an expert Portuguese language teacher creating flashcards for learners.

IMPORTANT GUIDELINES:
- Use casual and informal Portuguese unless the scenario requires formality
- Focus on phrases common to Lisbon, Portugal (European Portuguese)
- Write phonetic guides based on a Lisbon accent for American English speakers
- Aim for roughly 50 flashcards per pack unless the topic clearly needs more or fewer
- Include practical, commonly-used phrases
- DO NOT add any additional keys to the JSON output beyond the 3 required fields
- Each card should have exactly one english phrase and one portuguese phrase
- If the user asks for verb conjugations, DO NOT create cards with the infinitive form (e.g. "dormir" => "to sleep"). Instead create cards with the conjugated forms (e.g. "eu dormo" => "I sleep", "vamos dormir" => "Let's sleep", "ele dorme" => "He sleeps", etc.)

EXAMPLE CARDS:
{
  "portuguese": "Eu falo",
  "english": "I speak",
  "phonetic": "EEW fah-loh",
}
{
  "english": "May I pet your dog?",
  "portuguese": "Posso fazer uma festinha?",
  "phonetic": "Poh-soh fah-zeh-rah oo-mah fee-stee-nyah?",
}
{
  "english": "I'm sorry, I don't speak Portuguese.",
  "portuguese": "Desculpe, não falo português.",
  "phonetic": "Dess-koo-lpeh, now fah-loh portuh-gwess?",
}


OUTPUT FORMAT: You must return ONLY a valid JSON object (no additional text) matching this exact structure:
{
  "title": "Pack Title (max 100 chars)",
  "description": "Clear description of what learners will get (max 500 chars)", 
  "emoji": "📚", 
  "category": "basics|situations|grammar",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedMinutes": number_between_1_and_120,
  "cards": [
    {
      "portuguese": "Portuguese phrase",
      "english": "English translation", 
      "phonetic": "Phonetic guide for Americans"
    }
  ]
}`;

          // Add validation error feedback for retry
          if (isRetry && validationErrors) {
            systemPrompt += `

CRITICAL: Your previous response had validation errors. Please fix these specific issues:
${validationErrors}

Make sure to follow the exact structure and requirements specified above.`;
          }

          systemPrompt += `

The user's enhanced request: ${enhancedPrompt}`;

          console.log("🤖 Calling OpenAI via AI Gateway for flashcard pack generation...");
          console.log("📏 System prompt length:", systemPrompt.length);
          if (isRetry) console.log("🔧 Including validation feedback:", validationErrors);
          
          const gateway = this.env.AI.gateway(this.env.AI_GATEWAY_ID);
          const openaiUrl = await gateway.getUrl("openai");
          
          const response = await fetch(`${openaiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'cf-aig-authorization': `Bearer ${this.env.AI_GATEWAY_TOKEN}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: enhancedPrompt
                }
              ],
              temperature: isRetry ? 0.05 : 0.1, // Lower temperature for retry
              response_format: { type: "json_object" },
            }),
          });

          if (!response.ok) {
            console.error("❌ OpenAI API error:", response.status, response.statusText);
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json() as OpenAIResponse;

          console.log("📋 AI generation response received:", { 
            hasResponse: !!data.choices?.[0]?.message?.content, 
            responseLength: data.choices?.[0]?.message?.content?.length || 0 
          });
          
          if (!data.choices?.[0]?.message?.content) {
            console.error("❌ No response from OpenAI for flashcard generation");
            throw new Error("Failed to generate flashcard pack - no response from OpenAI");
          }

          console.log("📄 Raw AI response:", data.choices[0].message.content);

          // Try to parse the JSON response
          console.log("🔧 Attempting to parse JSON response");
          let parsedResponse: any;
          try {
            const responseContent = data.choices[0].message.content;
            // Clean up the response - sometimes LLMs add extra text before/after JSON
            const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error("❌ No JSON object found in AI response");
              console.error("🔍 Full response:", responseContent);
              throw new Error("No JSON object found in AI response");
            }
            
            console.log("✅ JSON pattern found, length:", jsonMatch[0].length);
            parsedResponse = JSON.parse(jsonMatch[0]);
            console.log("🎯 Parsed response structure:", {
              title: parsedResponse.title,
              cardCount: parsedResponse.cards?.length,
              category: parsedResponse.category,
              difficulty: parsedResponse.difficulty
            });
          } catch (parseError) {
            console.error("❌ JSON parse error:", parseError);
            console.error("🔍 Raw response that failed to parse:", data.choices[0].message.content);
            throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
          }

          // Validate the parsed response with Zod
          console.log("🔍 Validating parsed response with Zod schema");
          const validationResult = FlashcardPackSchema.safeParse(parsedResponse);
          if (!validationResult.success) {
            const errorMessage = validationResult.error.issues
              .map((err: any) => `${err.path.join('.')}: ${err.message}`)
              .join(', ');
            
            console.error("❌ Zod validation failed");
            console.error("🔍 Validation errors:", validationResult.error.issues);
            
            throw new Error(`Generated pack failed validation: ${errorMessage}`);
          }

          console.log("✅ Zod validation passed!");
          
          // Add unique IDs to each card for client-side usage
          const cardsWithIds = validationResult.data.cards.map((card, index) => ({
            id: `${Date.now()}-${index}`,
            ...card
          }));

          const finalData = {
            ...validationResult.data,
            cards: cardsWithIds
          };

          console.log("📊 Final pack data:", {
            title: finalData.title,
            cardCount: finalData.cards.length,
            category: finalData.category,
            difficulty: finalData.difficulty,
            estimatedMinutes: finalData.estimatedMinutes
          });

          return finalData;
        };

        // First attempt
        try {
          return await generateFlashcardPack();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          // Check if this is a validation error that we can retry
          if (errorMessage.includes('Generated pack failed validation:')) {
            console.log("🔄 Validation failed, attempting retry with error feedback");
            
            // Extract validation errors for feedback
            const validationErrors = errorMessage.replace('Generated pack failed validation: ', '');
            
            try {
              // Retry once with validation feedback
              return await generateFlashcardPack(true, validationErrors);
            } catch (retryError) {
              console.error("❌ Retry also failed:", retryError);
              // Throw the original error since retry didn't help
              throw error;
            }
          }
          
          // For non-validation errors, just throw immediately
          throw error;
        }
      }
    );

    console.log("⚡ Starting Step 3: Save to database");
    
    // Step 3: Save to database
    const savedPack = await step.do("save to database", async () => {
      console.log("🔄 Preparing pack data for database insertion");
      try {
        // Initialize Prisma client with the workflow's D1 binding
        console.log("🔧 Initializing Prisma client for workflow context");
        const db = new PrismaClient({
          // @ts-ignore
          adapter: new PrismaD1(this.env.DB),
        });
        
        // Initialize the connection
        await db.$queryRaw`SELECT 1`;
        console.log("✅ Database connection initialized");

        const packData = {
          title: generatedPack.title,
          description: generatedPack.description,
          emoji: generatedPack.emoji,
          category: generatedPack.category,
          difficulty: generatedPack.difficulty,
          estimatedMinutes: generatedPack.estimatedMinutes,
          cards: JSON.stringify(generatedPack.cards),
          userId: userId,
        };

        console.log("📤 Inserting pack data into database:", {
          title: packData.title,
          cardCount: generatedPack.cards.length,
          userId: packData.userId,
          category: packData.category,
          difficulty: packData.difficulty
        });

        const result = await db.flashcardPack.create({
          data: packData,
        });

        console.log("✅ Pack saved successfully with ID:", result.id);
        
        // Close the connection
        await db.$disconnect();
        
        return result;
      } catch (dbError) {
        console.error("❌ Database insertion failed:", dbError);
        throw new Error(`Failed to save flashcard pack to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    });

    // Return the final result
    console.log("🎉 Workflow completed successfully!");
    const finalResult = {
      success: true,
      packId: savedPack.id,
      title: savedPack.title,
      cardCount: generatedPack.cards.length,
      estimatedMinutes: savedPack.estimatedMinutes,
    };
    
    console.log("📋 Final result:", finalResult);
    return finalResult;
  }
}