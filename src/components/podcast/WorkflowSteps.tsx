
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { FileText, Pen, Book, Camera, CheckCircle } from 'lucide-react';
import { WorkflowStep } from '@/types/podcast';

interface WorkflowStepsProps {
  currentStep: string;
  steps: Array<{
    key: string;
    title: string;
    icon: React.ElementType;
  }>;
}

export const workflowSteps = [
  { key: 'name', title: 'Name Project', icon: FileText },
  { key: 'input', title: 'Input Content', icon: Pen },
  { key: 'outline', title: 'Create Outline', icon: Book },
  { key: 'script', title: 'Create Script', icon: Book },
  { key: 'media', title: 'Prepare Media', icon: Camera },
  { key: 'complete', title: 'Complete', icon: CheckCircle }
];

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ currentStep, steps }) => {
  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = getCurrentStepIndex() > index;
            
            return (
              <div
                key={step.key}
                className={`flex flex-col items-center space-y-2 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'border-blue-600 bg-blue-100'
                      : isCompleted
                      ? 'border-green-600 bg-green-100'
                      : 'border-gray-300 bg-gray-100'
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-center max-w-[80px]">
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
