"use server";

import { env } from "cloudflare:workers";

// Available speakers for Portuguese pronunciation
export const PORTUGUESE_SPEAKERS = {
  luna: "luna",      // Female voice
  asteria: "asteria", // Female voice 
  athena: "athena",   // Female voice
  hera: "hera",       // Female voice
  stella: "stella",   // Female voice
  angus: "angus",     // Male voice
  arcas: "arcas",     // Male voice
  orion: "orion",     // Male voice
  orpheus: "orpheus", // Male voice
  zeus: "zeus",       // Male voice
  perseus: "perseus", // Male voice
  helios: "helios"    // Male voice
} as const;

export type Speaker = keyof typeof PORTUGUESE_SPEAKERS;

export async function generateSpeech(text: string, speaker: Speaker = "luna") {
  try {
    console.log("Generating speech for text:", text, "with speaker:", speaker);
    
    // Check if AI binding is available
    // @ts-ignore - AI binding might not be available in all environments
    if (!env.AI) {
      console.error("AI binding not available");
      return {
        success: false,
        error: "AI service is not available. Please run 'npm run dev:wrangler' for text-to-speech support."
      };
    }
    
    const response = await env.AI.run(
      "@cf/deepgram/aura-1" as any,
      {
        text,
      },
      {
        returnRawResponse: true
      }
    );

    console.log("AI response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI response error:", errorText);
      throw new Error(`TTS generation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio buffer size:", audioBuffer.byteLength);
    
    if (audioBuffer.byteLength === 0) {
      throw new Error("Received empty audio buffer");
    }
    
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    
    return {
      success: true,
      audio: base64Audio,
      contentType: "audio/mpeg"
    };
  } catch (error) {
    console.error("Error generating speech:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate speech"
    };
  }
}