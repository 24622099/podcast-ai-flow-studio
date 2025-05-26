
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { WorkflowSteps, workflowSteps } from './podcast/WorkflowSteps';
import { ProjectDetails } from './podcast/ProjectDetails';
import { LoadingState } from './podcast/LoadingState';
import { NameProjectStep } from './podcast/steps/NameProjectStep';
import { InputContentStep } from './podcast/steps/InputContentStep';
import { OutlineStep } from './podcast/steps/OutlineStep';
import { ScriptStep } from './podcast/steps/ScriptStep';
import { MediaStep } from './podcast/steps/MediaStep';
import { CompleteStep } from './podcast/steps/CompleteStep';

import { PodcastWorkflowProvider, usePodcastWorkflow } from '@/contexts/PodcastWorkflowContext';

// Main workflow component wrapper
const PodcastWorkflow: React.FC = () => {
  return (
    <PodcastWorkflowProvider>
      <PodcastWorkflowContent />
    </PodcastWorkflowProvider>
  );
};

// Inner component that uses the context
const PodcastWorkflowContent: React.FC = () => {
  const { 
    currentStep, 
    isLoading, 
    loadingMessage,
    showProjectDetails,
    setShowProjectDetails,
    workflowData,
    handleNameChange,
    handleNameProject,
    handleContentChange,
    handleGrammarPointChange,
    handleInitializeProject,
    handleOutlineChange,
    handleVocabChange,
    handleCreateScript,
    handleScriptChange,
    handleConfirmScript,
    handlePromptChange,
    handleGenerateImages,
    handleStartOver
  } = usePodcastWorkflow();

  // Render the current step component based on the workflow state
  const renderStepContent = () => {
    if (isLoading) {
      return <LoadingState loadingMessage={loadingMessage} />;
    }

    switch (currentStep) {
      case 'name':
        return (
          <NameProjectStep 
            workflowData={workflowData} 
            handleNameChange={handleNameChange}
            handleNameProject={handleNameProject}
          />
        );

      case 'input':
        return (
          <InputContentStep 
            workflowData={workflowData}
            handleContentChange={handleContentChange}
            handleGrammarPointChange={handleGrammarPointChange}
            handleInitializeProject={handleInitializeProject}
            isLoading={isLoading}
          />
        );

      case 'outline':
        return (
          <OutlineStep 
            workflowData={workflowData}
            handleOutlineChange={handleOutlineChange}
            handleVocabChange={handleVocabChange}
            handleCreateScript={handleCreateScript}
            isLoading={isLoading}
          />
        );

      case 'script':
        return (
          <ScriptStep 
            workflowData={workflowData}
            handleScriptChange={handleScriptChange}
            handleConfirmScript={handleConfirmScript}
            isLoading={isLoading}
          />
        );

      case 'media':
        return (
          <MediaStep 
            workflowData={workflowData}
            handlePromptChange={handlePromptChange}
            handleGenerateImages={handleGenerateImages}
            isLoading={isLoading}
          />
        );

      case 'complete':
        return (
          <CompleteStep 
            workflowData={workflowData}
            handleStartOver={handleStartOver}
          />
        );

      default:
        return null;
    }
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
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PodcastWorkflow;
