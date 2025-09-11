import { FlashcardData } from "@/hooks/useFlashcardDeck";

export interface FlashcardPack {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: "basics" | "situations" | "grammar";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  cards: FlashcardData[];
}

// Sample flashcard packs
export const flashcardPacks: FlashcardPack[] = [
  {
    id: "greetings",
    title: "Greetings & Basics",
    description: "Essential phrases for everyday conversations",
    emoji: "👋",
    category: "basics",
    difficulty: "beginner",
    estimatedMinutes: 5,
    cards: [
      {
        id: "1",
        english: "Good morning",
        portuguese: "Bom dia",
        phonetic: "bohm DEE-ah"
      },
      {
        id: "2",
        english: "Thank you",
        portuguese: "Obrigado",
        phonetic: "oh-bree-GAH-doo"
      },
      {
        id: "3",
        english: "Excuse me",
        portuguese: "Com licença",
        phonetic: "kohm lee-SEN-sah"
      },
      {
        id: "4",
        english: "How are you?",
        portuguese: "Como está?",
        phonetic: "KOH-moo ish-TAH"
      },
      {
        id: "5",
        english: "Nice to meet you",
        portuguese: "Prazer em conhecê-lo",
        phonetic: "prah-ZAIR aym koh-nyeh-SAY-loo"
      }
    ]
  },
  {
    id: "food",
    title: "Food & Dining",
    description: "Restaurant vocabulary and food items",
    emoji: "🍽️",
    category: "situations",
    difficulty: "beginner",
    estimatedMinutes: 8,
    cards: [
      {
        id: "6",
        english: "I would like to order",
        portuguese: "Gostaria de pedir",
        phonetic: "gosh-tah-REE-ah deh peh-DEER"
      },
      {
        id: "7", 
        english: "The check, please",
        portuguese: "A conta, por favor",
        phonetic: "ah KOHN-tah poor fah-VOHR"
      },
      {
        id: "8",
        english: "This is delicious",
        portuguese: "Isto está delicioso",
        phonetic: "EESH-too ish-TAH deh-lee-see-OH-zoo"
      },
      {
        id: "9",
        english: "I'm vegetarian",
        portuguese: "Sou vegetariano",
        phonetic: "soh veh-zheh-tah-ree-AH-noo"
      },
      {
        id: "10",
        english: "What do you recommend?",
        portuguese: "O que recomenda?",
        phonetic: "oo keh heh-koh-MEN-dah"
      }
    ]
  },
  {
    id: "transportation",
    title: "Transportation",
    description: "Getting around the city",
    emoji: "🚕",
    category: "situations", 
    difficulty: "intermediate",
    estimatedMinutes: 10,
    cards: [
      {
        id: "11",
        english: "Where is the bathroom?",
        portuguese: "Onde fica a casa de banho?",
        phonetic: "OHN-deh FEE-kah ah KAH-zah deh BAHN-yoo"
      },
      {
        id: "12",
        english: "How much does it cost?",
        portuguese: "Quanto custa?",
        phonetic: "KWAN-too KOOSH-tah"
      },
      {
        id: "13",
        english: "Take me to the airport",
        portuguese: "Leve-me ao aeroporto",
        phonetic: "LEH-veh-meh ah-oo ah-eh-roh-POHR-too"
      },
      {
        id: "14",
        english: "Stop here, please",
        portuguese: "Pare aqui, por favor",
        phonetic: "PAH-reh ah-KEE poor fah-VOHR"
      },
      {
        id: "15",
        english: "How long does it take?",
        portuguese: "Quanto tempo demora?",
        phonetic: "KWAN-too TEM-poo deh-MOH-rah"
      }
    ]
  },
  {
    id: "medical",
    title: "Medical & Health",
    description: "Essential phrases for emergencies and health",
    emoji: "👨‍⚕️",
    category: "situations",
    difficulty: "intermediate", 
    estimatedMinutes: 12,
    cards: [
      {
        id: "16",
        english: "I need a doctor",
        portuguese: "Preciso de um médico",
        phonetic: "preh-SEE-zoo deh oom MEH-dee-koo"
      },
      {
        id: "17",
        english: "It hurts here",
        portuguese: "Dói aqui",
        phonetic: "doy ah-KEE"
      },
      {
        id: "18",
        english: "I'm allergic to...",
        portuguese: "Sou alérgico a...",
        phonetic: "soh ah-LEHR-zhee-koo ah"
      },
      {
        id: "19",
        english: "Where is the pharmacy?",
        portuguese: "Onde fica a farmácia?",
        phonetic: "OHN-deh FEE-kah ah far-MAH-see-ah"
      },
      {
        id: "20",
        english: "Call an ambulance",
        portuguese: "Chame uma ambulância",
        phonetic: "SHAH-meh OO-mah am-boo-LAHN-see-ah"
      }
    ]
  }
];

export function getPackById(id: string): FlashcardPack | undefined {
  return flashcardPacks.find(pack => pack.id === id);
}