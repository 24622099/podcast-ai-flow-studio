
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';

interface InputContentStepProps {
  workflowData: WorkflowData;
  handleContentChange: (content: string) => void;
  handleGrammarPointChange: (point: string) => void;
  handleInitializeProject: () => void;
  isLoading: boolean;
}

export const InputContentStep: React.FC<InputContentStepProps> = ({
  workflowData,
  handleContentChange,
  handleGrammarPointChange,
  handleInitializeProject,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="initialContent" className="text-sm font-medium">
          Initial Content
        </label>
        <Textarea
          id="initialContent"
          value={workflowData.initialContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter your initial content, ideas, or topics..."
          className="min-h-[200px]"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="grammarPoint" className="text-sm font-medium">
          Grammar Point (Optional)
        </label>
        <Input
          id="grammarPoint"
          value={workflowData.grammarPoint}
          onChange={(e) => handleGrammarPointChange(e.target.value)}
          placeholder="Enter any specific grammar points to focus on..."
        />
      </div>
      <Button 
        onClick={handleInitializeProject} 
        className="w-full" 
        size="lg" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Outline...
          </>
        ) : (
          'Create Outline'
        )}
      </Button>
    </div>
  );
};
