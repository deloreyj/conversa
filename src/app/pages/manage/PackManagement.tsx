import { RequestInfo } from "rwsdk/worker";
import { getFlashcardPackWithCards } from "./functions";
import { PackManagementClient } from "@/components/PackManagementClient";

interface PackManagementProps {
  slug: string;
}

export async function PackManagement({ slug, ctx }: PackManagementProps & RequestInfo) {
  const pack = await getFlashcardPackWithCards(slug);

  if (!pack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Pack Not Found</h1>
          <p className="text-gray-600">The flashcard pack you're looking for doesn't exist or you don't have permission to edit it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PackManagementClient pack={pack} />
      </div>
    </div>
  );
}