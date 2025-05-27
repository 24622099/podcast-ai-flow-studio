
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Book } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '../LoadingState';

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
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleSendToRunPromt = async () => {
    console.log('=== SENDING TO RUNPROMT ENDPOINT ===');
    console.log('URL: https://n8n.chichung.studio/webhook-test/RunPromt');
    
    setIsLocalLoading(true);
    
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

      // Check if the response is already in the correct array format
      if (Array.isArray(data)) {
        console.log('Response is already an array, using directly:', data);
        (window as any).newScriptData = data;
      } else {
        // If response is an object, convert it to the expected array format
        console.log('Response is an object, converting to array format');
        const scriptData = [];
        
        if (data["Open Hook"]) {
          scriptData.push({ "Open Hook": data["Open Hook"] });
        }
        if (data["Part 1"]) {
          scriptData.push({ "Part 1": data["Part 1"] });
        }
        if (data["Part 2"]) {
          scriptData.push({ "Part 2": data["Part 2"] });
        }
        if (data["Part 3"]) {
          scriptData.push({ "Part 3": data["Part 3"] });
        }
        if (data["Vocab"]) {
          scriptData.push({ "Vocab": data["Vocab"] });
        }
        if (data["Grammar"]) {
          scriptData.push({ "Grammar": data["Grammar"] });
        }
        if (data["Summary"]) {
          scriptData.push({ "Summary": data["Summary"] });
        }

        console.log('Converted script data with all 7 parts:', scriptData);
        (window as any).newScriptData = scriptData;
      }

      console.log('Final stored script data:', (window as any).newScriptData);

      toast({
        title: "Success",
        description: "Script generated successfully with all 7 parts!",
      });

      // Call the original handleCreateScript function to advance to next step
      handleCreateScript();

    } catch (error) {
      console.error('=== RUNPROMT ERROR ===');
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send data to RunPromt endpoint',
        variant: "destructive",
      });
    } finally {
      setIsLocalLoading(false);
    }
  };

  // Show loading interface when processing
  if (isLoading || isLocalLoading) {
    return <LoadingState loadingMessage="Processing Your Outline" />;
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
        disabled={isLoading || isLocalLoading}
      >
        {isLoading || isLocalLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Script...
          </>
        ) : (
          'Generate Script'
        )}
      </Button>
    </div>
  );
};
