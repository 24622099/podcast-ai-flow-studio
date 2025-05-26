
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WorkflowData } from '@/types/podcast';

interface NameProjectStepProps {
  workflowData: WorkflowData;
  handleNameChange: (name: string) => void;
  handleNameProject: () => void;
}

export const NameProjectStep: React.FC<NameProjectStepProps> = ({ 
  workflowData, 
  handleNameChange,
  handleNameProject 
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="projectName" className="text-sm font-medium">
          Project Name
        </label>
        <Input
          id="projectName"
          value={workflowData.projectName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Enter your podcast project name..."
          className="text-lg"
        />
      </div>
      <Button onClick={handleNameProject} className="w-full" size="lg">
        Continue
      </Button>
    </div>
  );
};
