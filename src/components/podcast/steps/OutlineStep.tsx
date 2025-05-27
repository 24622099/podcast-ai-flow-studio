
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Book } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleSendToRunPromt = async () => {
    console.log('=== SENDING TO RUNPROMT ENDPOINT ===');
    console.log('URL: https://n8n.chichung.studio/webhook-test/RunPromt');
    
    const payload = {
      action: "createScript",
      payload: {
        driveFolderId: workflowData.driveFolderId,
        editedOutline: workflowData.outline,
        grammarPoint: workflowData.grammarPoint,
        projectDetails: workflowData.projectDetails
      }
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://n8n.chichung.studio/webhook-test/RunPromt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('=== RUNPROMT RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      toast({
        title: "Success",
        description: "Data sent to RunPromt endpoint successfully!",
      });

    } catch (error) {
      console.error('=== RUNPROMT ERROR ===');
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send data to RunPromt endpoint',
        variant: "destructive",
      });
    }
  };

  // Show loading interface when processing
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative w-32 h-32">
          {/* Rotating outer circle */}
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
          
          {/* Central book icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Book className="h-16 w-16 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-medium text-gray-800">Processing Your Outline</h3>
          <p className="text-gray-500">
            Sending data to n8n and waiting for response...
          </p>
        </div>
      </div>
    );
  }

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
        onClick={handleSendToRunPromt} 
        className="w-full" 
        size="lg" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending to RunPromt...
          </>
        ) : (
          'Send to RunPromt Endpoint'
        )}
      </Button>
    </div>
  );
};
