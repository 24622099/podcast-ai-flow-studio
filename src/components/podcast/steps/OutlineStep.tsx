
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';

interface OutlineStepProps {
  workflowData: WorkflowData;
  handleOutlineChange: (field: string, value: string) => void;
  handleVocabChange: (value: string) => void;
  handleCreateScript: () => void;
  isLoading: boolean;
}

export const OutlineStep: React.FC<OutlineStepProps> = ({
  workflowData,
  handleOutlineChange,
  handleVocabChange,
  handleCreateScript,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Opening Hook</label>
          <Textarea
            value={workflowData.outline?.openingHook || ''}
            onChange={(e) => handleOutlineChange('openingHook', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Part 1 - Problem</label>
          <Textarea
            value={workflowData.outline?.part1_Problem || ''}
            onChange={(e) => handleOutlineChange('part1_Problem', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Part 2 - Cause</label>
          <Textarea
            value={workflowData.outline?.part2_Cause || ''}
            onChange={(e) => handleOutlineChange('part2_Cause', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Part 3 - Solution</label>
          <Textarea
            value={workflowData.outline?.part3_Solution || ''}
            onChange={(e) => handleOutlineChange('part3_Solution', e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Suggested Vocabulary</label>
          <Textarea
            value={workflowData.outline?.suggestedVocab?.join(', ') || ''}
            onChange={(e) => handleVocabChange(e.target.value)}
            placeholder="Enter vocabulary words separated by commas..."
            className="min-h-[60px]"
          />
        </div>
      </div>
      <Button 
        onClick={handleCreateScript} 
        className="w-full" 
        size="lg" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Script...
          </>
        ) : (
          'Create Script from this Outline'
        )}
      </Button>
    </div>
  );
};
