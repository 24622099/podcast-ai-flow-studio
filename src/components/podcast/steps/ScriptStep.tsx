
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
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Array.isArray(workflowData.script) && workflowData.script.length > 0 ? (
          workflowData.script.map((scriptPart, index) => {
            // Each object should have only one key-value pair
            const key = Object.keys(scriptPart)[0];
            const value = scriptPart[key];
            
            return (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {key}
                </label>
                <Textarea
                  value={value}
                  onChange={(e) => handleScriptChange(index, key, e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No script content available. Please generate a script first.
          </div>
        )}
      </div>
      <Button 
        onClick={handleConfirmScript} 
        className="w-full" 
        size="lg" 
        disabled={isLoading || !workflowData.script || workflowData.script.length === 0}
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
