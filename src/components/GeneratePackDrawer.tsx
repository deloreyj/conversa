"use client";

import { useState } from "react";
import { generateFlashcardPack, getWorkflowStatus } from "@/app/pages/generate-pack/functions";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface GeneratePackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPackGenerated?: (packId: string) => void;
}

export function GeneratePackDrawer({ 
  isOpen, 
  onClose,
  onPackGenerated 
}: GeneratePackDrawerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [workflowId, setWorkflowId] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setResult(null);
    setStatusResult(null);
    
    const formData = new FormData(event.currentTarget);
    const result = await generateFlashcardPack(formData);
    
    setResult(result);
    if (result.success) {
      setWorkflowId(result.workflowId);
    }
    setIsGenerating(false);
  }

  async function checkStatus() {
    if (!workflowId) return;
    
    const status = await getWorkflowStatus(workflowId);
    setStatusResult(status);
    
    // If completed successfully, close drawer and notify parent
    if (status.success && status.status?.status === 'complete' && status.status?.output?.packId) {
      onPackGenerated?.(status.status.output.packId);
      handleClose();
    }
  }

  function handleClose() {
    setResult(null);
    setStatusResult(null);
    setWorkflowId("");
    onClose();
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="bg-foreground">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Generate Custom Pack</DrawerTitle>
            <DrawerDescription>
              Describe what you want to learn and AI will create a personalized Portuguese flashcard pack
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userPrompt" className="block text-sm font-medium mb-2 text-gray-700">
                  What do you want to learn?
                </label>
                <textarea
                  id="userPrompt"
                  name="userPrompt"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Examples:
• Common verbs and their conjugations
• Doctor visit phrases
• Christmas vocabulary and expressions
• Restaurant ordering phrases"
                  required
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !!result}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                  isGenerating
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : result
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Generating Pack...
                  </span>
                ) : result ? (
                  "Pack Request Submitted"
                ) : (
                  "🤖 Generate Flashcard Pack"
                )}
              </button>
            </form>

            {result && (
              <div className={cn(
                "mt-4 p-4 rounded-lg",
                result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              )}>
                <h3 className={cn(
                  "font-medium mb-2",
                  result.success ? "text-green-800" : "text-red-800"
                )}>
                  {result.success ? "✅ Success!" : "❌ Error"}
                </h3>
                
                {result.success ? (
                  <div className="text-green-700 text-sm">
                    <p className="mb-3">{result.message}</p>
                    <div className="space-y-1 text-xs bg-green-100 p-2 rounded">
                      <p><strong>Status:</strong> {result.status?.status || "Starting..."}</p>
                      <p><strong>ID:</strong> {result.workflowId}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-700 text-sm">
                    <p>{result.error}</p>
                    {result.details && (
                      <p className="text-xs mt-1 opacity-75">{result.details}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {workflowId && (
              <div className="mt-4 space-y-3">
                <button
                  onClick={checkStatus}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🔄 Check Progress
                </button>

                {statusResult && (
                  <div className="p-3 bg-gray-50 border rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">Progress Update</h4>
                    {statusResult.success ? (
                      <div className="text-sm">
                        <p className="mb-1">
                          <strong>Status:</strong> <span className="capitalize">{statusResult.status?.status || "Unknown"}</span>
                        </p>
                        {statusResult.status?.status === 'complete' && statusResult.status?.output && (
                          <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                            <p><strong>Pack generated!</strong></p>
                            <p>Cards: {statusResult.status.output.cardCount}</p>
                            <p>Title: {statusResult.status.output.title}</p>
                          </div>
                        )}
                        {statusResult.status?.status === 'running' && (
                          <p className="text-blue-600 text-xs">⏳ AI is creating your flashcards...</p>
                        )}
                        {statusResult.status?.error && (
                          <p className="text-red-600 text-xs">❌ Error: {statusResult.status.error}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-600 text-sm">{statusResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <button 
                onClick={handleClose}
                className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {result?.success ? "Continue Checking Later" : "Cancel"}
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}