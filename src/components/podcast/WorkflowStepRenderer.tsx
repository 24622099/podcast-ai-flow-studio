
import React from 'react';
import { WorkflowStepType, WorkflowData } from '@/types/podcast';
import { LoadingState } from './LoadingState';
import { NameProjectStep } from './steps/NameProjectStep';
import { InputContentStep } from './steps/InputContentStep';
import { OutlineStep } from './steps/OutlineStep';
import { ScriptStep } from './steps/ScriptStep';
import { MediaStep } from './steps/MediaStep';
import { CompleteStep } from './steps/CompleteStep';

interface WorkflowStepRendererProps {
  currentStep: WorkflowStepType;
  isLoading: boolean;
  loadingMessage: string;
  workflowData: WorkflowData;
  handlers: {
    handleNameChange: (name: string) => void;
    handleNameProject: () => void;
    handleContentChange: (content: string) => void;
    handleGrammarPointChange: (point: string) => void;
    handleInitializeProject: () => void;
    handleOutlineChange: (field: string, value: string) => void;
    handleVocabChange: (value: string) => void;
    handleCreateScript: () => void;
    handleScriptChange: (index: number, key: string, value: string) => void;
    handleConfirmScript: () => void;
    handlePromptChange: (index: number, value: string) => void;
    handleGenerateImages: () => void;
  };
  handleStartOver: () => void;
}

export const WorkflowStepRenderer: React.FC<WorkflowStepRendererProps> = ({
  currentStep,
  isLoading,
  loadingMessage,
  workflowData,
  handlers,
  handleStartOver
}) => {
  if (isLoading) {
    return <LoadingState loadingMessage={loadingMessage} />;
  }

  switch (currentStep) {
    case 'name':
      return (
        <NameProjectStep 
          workflowData={workflowData} 
          handleNameChange={handlers.handleNameChange}
          handleNameProject={handlers.handleNameProject}
        />
      );

    case 'input':
      return (
        <InputContentStep 
          workflowData={workflowData}
          handleContentChange={handlers.handleContentChange}
          handleGrammarPointChange={handlers.handleGrammarPointChange}
          handleInitializeProject={handlers.handleInitializeProject}
          isLoading={isLoading}
        />
      );

    case 'outline':
      return (
        <OutlineStep 
          workflowData={workflowData}
          handleOutlineChange={handlers.handleOutlineChange}
          handleVocabChange={handlers.handleVocabChange}
          handleCreateScript={handlers.handleCreateScript}
          isLoading={isLoading}
        />
      );

    case 'script':
      return (
        <ScriptStep 
          workflowData={workflowData}
          handleScriptChange={handlers.handleScriptChange}
          handleConfirmScript={handlers.handleConfirmScript}
          isLoading={isLoading}
        />
      );

    case 'media':
      return (
        <MediaStep 
          workflowData={workflowData}
          handlePromptChange={handlers.handlePromptChange}
          handleGenerateImages={handlers.handleGenerateImages}
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
