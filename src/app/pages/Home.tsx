import { RequestInfo } from "rwsdk/worker";
import { FlashcardAppClient } from "@/components/FlashcardAppClient";
import { EmptyPackState } from "@/components/EmptyPackState";
import { HeaderWithAuth } from "@/components/HeaderWithAuth";
import { getFlashcardPacksMetadata, getFlashcardPackById, fetchPackCards } from "@/app/pages/flashcard-functions";

export async function Home({ ctx, request }: RequestInfo) {
  // Fetch all pack metadata
  const packs = await getFlashcardPacksMetadata();

  // Get pack slug from URL query parameter or use first pack as default
  const url = new URL(request.url);
  const packSlugFromUrl = url.searchParams.get("pack");
  const initialPackSlug = packSlugFromUrl || (packs.length > 0 ? packs[0].slug : "");
  // Find the pack ID from the slug for fetching cards
  const initialPack = packs.find(p => p.slug === initialPackSlug);
  const initialCards = initialPack ? await getFlashcardPackById(initialPack.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex flex-col">
      {/* Header */}
      <HeaderWithAuth />

      {/* Client-side app content */}
      <div className="flex-1 max-w-md mx-auto w-full pb-safe">
        {packs.length > 0 ? (
          <FlashcardAppClient
            packs={packs}
            initialCards={initialCards || []}
            initialPackSlug={initialPackSlug}
            onPackSelect={fetchPackCards}
            currentUserId={ctx.user?.id}
          />
        ) : (
          <EmptyPackState />
        )}
      </div>
    </div>
  );
}
