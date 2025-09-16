import { RequestInfo } from "rwsdk/worker";
import { FlashcardAppClient } from "@/components/FlashcardAppClient";
import { EmptyPackState } from "@/components/EmptyPackState";
import { getFlashcardPacksMetadata, getFlashcardPackById, fetchPackCards } from "@/app/pages/flashcard-functions";

export async function Home({ ctx }: RequestInfo) {
  // Fetch all pack metadata
  const packs = await getFlashcardPacksMetadata();
  
  // Get the first pack as default, or fallback to empty
  const initialPackId = packs.length > 0 ? packs[0].id : "";
  const initialCards = initialPackId ? await getFlashcardPackById(initialPackId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 pt-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Conversa
          </h1>
          <p className="text-gray-600 mb-2">
            Learn Portuguese (Portugal) with flashcards
          </p>
          
          {ctx.user?.username && (
            <p className="text-sm text-gray-500 mb-4">
              Welcome back, {ctx.user.username}!
            </p>
          )}
        </div>
      </div>

      {/* Client-side app content */}
      {packs.length > 0 ? (
        <FlashcardAppClient
          packs={packs}
          initialCards={initialCards || []}
          initialPackId={initialPackId}
          onPackSelect={fetchPackCards}
        />
      ) : (
        <EmptyPackState />
      )}
    </div>
  );
}
