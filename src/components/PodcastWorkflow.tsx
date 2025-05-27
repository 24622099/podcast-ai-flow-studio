
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { WorkflowSteps, workflowSteps } from './podcast/WorkflowSteps';
import { ProjectDetails } from './podcast/ProjectDetails';
import { WorkflowStepRenderer } from './podcast/WorkflowStepRenderer';

import { useWorkflowData } from '@/hooks/useWorkflowData';
import { useWorkflowHandlers } from '@/hooks/useWorkflowHandlers';

const PodcastWorkflow: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  const {
    workflowData,
    setWorkflowData,
    currentStep,
    setCurrentStep,
    resetWorkflowData
  } = useWorkflowData();

  const handlers = useWorkflowHandlers(
    workflowData,
    setWorkflowData,
    setCurrentStep,
    setIsLoading,
    setLoadingMessage
  );

  const handleStartOver = () => {
    resetWorkflowData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Podcast Workflow Management
          </h1>
          <p className="text-gray-600">
            Create engaging podcast content with AI-powered assistance
          </p>
        </div>

        {/* Progress Bar and Steps */}
        <WorkflowSteps 
          currentStep={currentStep} 
          steps={workflowSteps}
        />

        {/* Project Information (visible after step 1) */}
        {workflowData.projectDetails && currentStep !== 'name' && (
          <ProjectDetails
            workflowData={workflowData}
            showProjectDetails={showProjectDetails}
            setShowProjectDetails={setShowProjectDetails}
          />
        )}

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(
                workflowSteps.find(step => step.key === currentStep)?.icon || 'div', 
                { className: "h-5 w-5" }
              )}
              {workflowSteps.find(step => step.key === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowStepRenderer
              currentStep={currentStep}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              workflowData={workflowData}
              handlers={handlers}
              handleStartOver={handleStartOver}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PodcastWorkflow;
