
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { WorkflowData, ScriptPartObject } from '@/types/podcast';

interface ScriptStepProps {
  workflowData: WorkflowData;
  handleScriptChange: (index: number, key: string, value: string) => void;
  handleConfirmScript: () => void;
  isLoading: boolean;
}

export const ScriptStep: React.FC<ScriptStepProps> = ({
  workflowData,
  handleScriptChange,
  handleConfirmScript,
  isLoading
}) => {
  console.log('ScriptStep rendering with script data:', workflowData.script);
  
  // Define the expected 7 parts in order
  const expectedParts = [
    'Open Hook',
    'Part 1', 
    'Part 2',
    'Part 3',
    'Vocab',
    'Grammar',
    'Summary'
  ];

  // Create script parts array ensuring all 7 parts are present
  const scriptParts = expectedParts.map((partName, index) => {
    // Find existing data for this part
    const existingPart = workflowData.script?.find(part => Object.keys(part)[0] === partName);
    if (existingPart) {
      return existingPart;
    }
    // Create empty part if not found
    return { [partName]: '' };
  });

  console.log('Processed script parts for display:', scriptParts);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {scriptParts.map((scriptPart, index) => {
          const key = Object.keys(scriptPart)[0];
          const value = scriptPart[key];
          
          console.log(`Rendering script part ${index}:`, { key, value: value?.substring(0, 50) + '...' });
          
          return (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">
                {key}
              </label>
              <Textarea
                value={value || ''}
                onChange={(e) => handleScriptChange(index, key, e.target.value)}
                className="min-h-[100px]"
                placeholder={`Enter content for ${key}...`}
              />
            </div>
          );
        })}
      </div>
      
      <div className="text-sm text-gray-500">
        Total script parts: {scriptParts.length}/7
      </div>
      
      <Button 
        onClick={handleConfirmScript} 
        className="w-full" 
        size="lg" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing Media...
          </>
        ) : (
          'Confirm Script & Prepare Media'
        )}
      </Button>
    </div>
  );
};
