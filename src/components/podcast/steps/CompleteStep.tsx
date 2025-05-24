
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';

interface CompleteStepProps {
  workflowData: WorkflowData;
  handleStartOver: () => void;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  workflowData,
  handleStartOver
}) => {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h3 className="text-xl font-semibold">Project Completed!</h3>
        <p className="text-muted-foreground">
          Your podcast project "{workflowData.projectName}" has been successfully created. 
          All images have been generated and saved to your Google Drive folder.
        </p>
      </div>
      <Button onClick={handleStartOver} className="w-full" size="lg">
        Create New Project
      </Button>
    </div>
  );
};
