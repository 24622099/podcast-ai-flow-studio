
import { useState, useEffect } from 'react';
import { WorkflowData, WorkflowStepType } from '@/types/podcast';

const initialWorkflowData: WorkflowData = {
  projectName: '',
  initialContent: '',
  grammarPoint: '',
  outline: {
    openingHook: '',
    part1_Problem: '',
    part2_Cause: '',
    part3_Solution: '',
    suggestedVocab: []
  },
  script: [],
  imagePrompts: []
};

export const useWorkflowData = () => {
  const [workflowData, setWorkflowData] = useState<WorkflowData>(initialWorkflowData);
  const [currentStep, setCurrentStep] = useState<WorkflowStepType>('name');

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('podcastWorkflowData', JSON.stringify(workflowData));
  }, [workflowData]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('podcastWorkflowData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWorkflowData(parsed);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const resetWorkflowData = () => {
    setWorkflowData(initialWorkflowData);
    setCurrentStep('name');
    localStorage.removeItem('podcastWorkflowData');
  };

  return {
    workflowData,
    setWorkflowData,
    currentStep,
    setCurrentStep,
    resetWorkflowData
  };
};
