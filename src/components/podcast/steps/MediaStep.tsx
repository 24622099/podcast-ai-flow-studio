
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';

interface MediaStepProps {
  workflowData: WorkflowData;
  handlePromptChange: (index: number, value: string) => void;
  handleGenerateImages: () => void;
  isLoading: boolean;
}

export const MediaStep: React.FC<MediaStepProps> = ({
  workflowData,
  handlePromptChange,
  handleGenerateImages,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {workflowData.imagePrompts?.map((prompt, index) => (
          <div key={prompt.id} className="space-y-2">
            <label className="text-sm font-medium">
              Image Prompt {index + 1} ({prompt.id})
            </label>
            <Textarea
              value={prompt.prompt}
              onChange={(e) => handlePromptChange(index, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        ))}
      </div>
      <Button 
        onClick={handleGenerateImages} 
        className="w-full" 
        size="lg" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Images...
          </>
        ) : (
          'Start Image Generation'
        )}
      </Button>
    </div>
  );
};
