import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle, Pen, Book, Camera, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WebhookResponse {
  "Project Name": string;
  "Keyword ID": string;
  "Keyword URL": string;
  "Date Created": string;
  "Project ID": string;
  "Folder ID": string;
  "Folder URL": string;
  "Video ID": string;
  "Video URL": string;
  "Image ID": string;
  "Image URL": string;
  "ScriptDoc ID": string;
  "ScriptDoc URL": string;
  "Opening Hook": string;
  "Part 1": string;
  "Part 2": string;
  "Part 3": string;
  "Vocab 1": string;
  "Vocab 2": string;
  "Vocab 3": string;
  "Vocab 4": string;
  "Vocab 5": string;
  "Grammar Topic": string;
}

interface WorkflowData {
  projectName: string;
  initialContent: string;
  grammarPoint: string;
  driveFolderId?: string;
  mainLogFileId?: string;
  projectDetails?: {
    projectName: string;
    keywordId: string;
    keywordUrl: string;
    dateCreated: string;
    projectId: string;
    folderId: string;
    folderUrl: string;
    videoId: string;
    videoUrl: string;
    imageId: string;
    imageUrl: string;
    scriptDocId: string;
    scriptDocUrl: string;
  };
  outline?: {
    openingHook: string;
    part1_Problem: string;
    part2_Cause: string;
    part3_Solution: string;
    suggestedVocab: string[];
  };
  script?: {
    segment_hook: string;
    segment_part1_problem: string;
    segment_part2_cause: string;
    segment_part3_solution: string;
    segment_vocab_explanation: string;
    segment_grammar_explanation: string;
    segment_summary: string;
  };
  imagePrompts?: Array<{
    id: string;
    prompt: string;
  }>;
}

type WorkflowStep = 'name' | 'input' | 'outline' | 'script' | 'media' | 'complete';

const PodcastWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
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
    script: {
      segment_hook: '',
      segment_part1_problem: '',
      segment_part2_cause: '',
      segment_part3_solution: '',
      segment_vocab_explanation: '',
      segment_grammar_explanation: '',
      segment_summary: ''
    },
    imagePrompts: []
  });

  const { toast } = useToast();

  const steps = [
    { key: 'name', title: 'Name Project', icon: FileText },
    { key: 'input', title: 'Input Content', icon: Pen },
    { key: 'outline', title: 'Create Outline', icon: Book },
    { key: 'script', title: 'Create Script', icon: Book },
    { key: 'media', title: 'Prepare Media', icon: Camera },
    { key: 'complete', title: 'Complete', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

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

  const handleApiCall = async (url: string, payload: any, successMessage: string) => {
    try {
      console.log(`Making API call to: ${url}`, payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();
      console.log('API Response:', data);

      // Handle array response by taking the first item
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }

      if (data.status === 'error') {
        throw new Error(data.message || 'Unknown error occurred');
      }

      toast({
        title: "Success",
        description: data.message || successMessage,
      });

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to communicate with server',
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleNameProject = () => {
    if (!workflowData.projectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep('input');
  };

  const handleInitializeProject = async () => {
    if (!workflowData.initialContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter initial content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Initializing project and creating outline...');

    try {
      const payload = {
        action: "initializeProjectAndCreateOutline",
        payload: {
          projectName: workflowData.projectName,
          initialContent: workflowData.initialContent,
          grammarPoint: workflowData.grammarPoint
        }
      };

      const response = await handleApiCall(
        'https://n8n.chichung.studio/webhook-test/NewProject_1',
        payload,
        'Project initialized and outline created!'
      );

      // Handle the new response format
      if (response) {
        const webhookResponse = response as unknown as WebhookResponse;
        
        setWorkflowData(prev => ({
          ...prev,
          driveFolderId: webhookResponse["Folder ID"] || prev.driveFolderId,
          mainLogFileId: webhookResponse["Keyword ID"] || prev.mainLogFileId,
          projectDetails: {
            projectName: webhookResponse["Project Name"],
            keywordId: webhookResponse["Keyword ID"],
            keywordUrl: webhookResponse["Keyword URL"],
            dateCreated: webhookResponse["Date Created"],
            projectId: webhookResponse["Project ID"],
            folderId: webhookResponse["Folder ID"],
            folderUrl: webhookResponse["Folder URL"],
            videoId: webhookResponse["Video ID"],
            videoUrl: webhookResponse["Video URL"],
            imageId: webhookResponse["Image ID"],
            imageUrl: webhookResponse["Image URL"],
            scriptDocId: webhookResponse["ScriptDoc ID"],
            scriptDocUrl: webhookResponse["ScriptDoc URL"],
          },
          outline: {
            openingHook: webhookResponse["Opening Hook"] || '',
            part1_Problem: webhookResponse["Part 1"] || '',
            part2_Cause: webhookResponse["Part 2"] || '',
            part3_Solution: webhookResponse["Part 3"] || '',
            suggestedVocab: [
              webhookResponse["Vocab 1"],
              webhookResponse["Vocab 2"],
              webhookResponse["Vocab 3"],
              webhookResponse["Vocab 4"],
              webhookResponse["Vocab 5"]
            ].filter(Boolean)
          }
        }));
        setCurrentStep('outline');
      }
    } catch (error) {
      // Error already handled in handleApiCall
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCreateScript = async () => {
    setIsLoading(true);
    setLoadingMessage('Generating detailed script...');

    try {
      // Include all project details in the payload
      const payload = {
        action: "createScript",
        payload: {
          driveFolderId: workflowData.driveFolderId,
          editedOutline: workflowData.outline,
          grammarPoint: workflowData.grammarPoint,
          // Include all project details
          "Project Name": workflowData.projectDetails?.projectName,
          "Keyword ID": workflowData.projectDetails?.keywordId,
          "Keyword URL": workflowData.projectDetails?.keywordUrl,
          "Date Created": workflowData.projectDetails?.dateCreated,
          "Project ID": workflowData.projectDetails?.projectId,
          "Folder ID": workflowData.projectDetails?.folderId,
          "Folder URL": workflowData.projectDetails?.folderUrl,
          "Video ID": workflowData.projectDetails?.videoId,
          "Video URL": workflowData.projectDetails?.videoUrl,
          "Image ID": workflowData.projectDetails?.imageId,
          "Image URL": workflowData.projectDetails?.imageUrl,
          "ScriptDoc ID": workflowData.projectDetails?.scriptDocId,
          "ScriptDoc URL": workflowData.projectDetails?.scriptDocUrl,
        }
      };

      const response = await handleApiCall(
        'https://n8n.chichung.studio/webhook-test/RunPromt',
        payload,
        'Script has been generated!'
      );

      if (response.data && response.data.script) {
        setWorkflowData(prev => ({
          ...prev,
          script: response.data.script
        }));
        setCurrentStep('script');
      }
    } catch (error) {
      // Error already handled in handleApiCall
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleConfirmScript = async () => {
    setIsLoading(true);
    setLoadingMessage('Preparing media prompts...');

    try {
      const payload = {
        action: "prepareMediaCreation",
        payload: {
          driveFolderId: workflowData.driveFolderId,
          confirmedScript: workflowData.script
        }
      };

      const response = await handleApiCall(
        'https://n8n.chichung.studio/webhook-test/PrepareMedia',
        payload,
        'Media prompts are ready!'
      );

      if (response.data && response.data.imagePrompts) {
        setWorkflowData(prev => ({
          ...prev,
          imagePrompts: response.data.imagePrompts
        }));
        setCurrentStep('media');
      }
    } catch (error) {
      // Error already handled in handleApiCall
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateImages = async () => {
    setIsLoading(true);
    setLoadingMessage('Generating images... This process may take a few minutes.');

    try {
      const payload = {
        action: "generateImages",
        payload: {
          driveFolderId: workflowData.driveFolderId,
          editedPrompts: workflowData.imagePrompts
        }
      };

      const response = await handleApiCall(
        'https://n8n.chichung.studio/webhook-test/GenerateImages',
        payload,
        'Project completed! All images have been generated.'
      );

      setCurrentStep('complete');
    } catch (error) {
      // Error already handled in handleApiCall
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStartOver = () => {
    setWorkflowData({
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
      script: {
        segment_hook: '',
        segment_part1_problem: '',
        segment_part2_cause: '',
        segment_part3_solution: '',
        segment_vocab_explanation: '',
        segment_grammar_explanation: '',
        segment_summary: ''
      },
      imagePrompts: []
    });
    setCurrentStep('name');
    localStorage.removeItem('podcastWorkflowData');
  };

  const renderLoadingContent = () => {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <div className="relative w-32 h-32">
          {/* Spinning outer circle */}
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
          
          {/* Central icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Pen className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-medium text-gray-800">{loadingMessage}</h3>
          <p className="text-gray-500">
            Please wait while we process your content...
          </p>
        </div>

        {/* Loading placeholder skeletons */}
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
        </div>
      </div>
    );
  };

  const renderProjectDetailsSection = () => {
    if (!workflowData.projectDetails) return null;

    const details = [
      { label: "Project Name", value: workflowData.projectDetails.projectName },
      { label: "Project ID", value: workflowData.projectDetails.projectId },
      { label: "Date Created", value: workflowData.projectDetails.dateCreated },
      { label: "Folder ID", value: workflowData.projectDetails.folderId },
      { label: "Keyword ID", value: workflowData.projectDetails.keywordId },
      { label: "Video ID", value: workflowData.projectDetails.videoId },
      { label: "Image ID", value: workflowData.projectDetails.imageId },
      { label: "ScriptDoc ID", value: workflowData.projectDetails.scriptDocId }
    ];

    const links = [
      { label: "Folder URL", value: workflowData.projectDetails.folderUrl },
      { label: "Keyword URL", value: workflowData.projectDetails.keywordUrl },
      { label: "Video URL", value: workflowData.projectDetails.videoUrl },
      { label: "Image URL", value: workflowData.projectDetails.imageUrl },
      { label: "ScriptDoc URL", value: workflowData.projectDetails.scriptDocUrl }
    ];

    return (
      <Collapsible
        className="mt-4 mb-6 border rounded-lg p-2"
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 rounded-md">
          Project Information
          {showProjectDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pt-2 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {details.map((item) => (
              <div key={item.label} className="text-xs">
                <span className="font-medium text-gray-700">{item.label}:</span>{" "}
                <span className="text-gray-600">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2">
            <h4 className="font-medium text-sm mb-1">Project Links</h4>
            <div className="space-y-1">
              {links.map((link) => (
                <div key={link.label} className="text-xs">
                  <span className="font-medium text-gray-700">{link.label}:</span>{" "}
                  <a
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {link.value}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'name':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="projectName"
                value={workflowData.projectName}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Enter your podcast project name..."
                className="text-lg"
              />
            </div>
            <Button onClick={handleNameProject} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="initialContent" className="text-sm font-medium">
                Initial Content
              </label>
              <Textarea
                id="initialContent"
                value={workflowData.initialContent}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, initialContent: e.target.value }))}
                placeholder="Enter your initial content, ideas, or topics..."
                className="min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="grammarPoint" className="text-sm font-medium">
                Grammar Point (Optional)
              </label>
              <Input
                id="grammarPoint"
                value={workflowData.grammarPoint}
                onChange={(e) => setWorkflowData(prev => ({ ...prev, grammarPoint: e.target.value }))}
                placeholder="Enter any specific grammar points to focus on..."
              />
            </div>
            <Button 
              onClick={handleInitializeProject} 
              className="w-full" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Outline...
                </>
              ) : (
                'Create Outline'
              )}
            </Button>
          </div>
        );

      case 'outline':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Opening Hook</label>
                <Textarea
                  value={workflowData.outline?.openingHook || ''}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    outline: { ...prev.outline!, openingHook: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Part 1 - Problem</label>
                <Textarea
                  value={workflowData.outline?.part1_Problem || ''}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    outline: { ...prev.outline!, part1_Problem: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Part 2 - Cause</label>
                <Textarea
                  value={workflowData.outline?.part2_Cause || ''}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    outline: { ...prev.outline!, part2_Cause: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Part 3 - Solution</label>
                <Textarea
                  value={workflowData.outline?.part3_Solution || ''}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    outline: { ...prev.outline!, part3_Solution: e.target.value }
                  }))}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Suggested Vocabulary</label>
                <Textarea
                  value={workflowData.outline?.suggestedVocab?.join(', ') || ''}
                  onChange={(e) => setWorkflowData(prev => ({
                    ...prev,
                    outline: { 
                      ...prev.outline!, 
                      suggestedVocab: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                    }
                  }))}
                  placeholder="Enter vocabulary words separated by commas..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateScript} 
              className="w-full" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Script...
                </>
              ) : (
                'Create Script from this Outline'
              )}
            </Button>
          </div>
        );

      case 'script':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              {Object.entries(workflowData.script || {}).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <Textarea
                    value={value}
                    onChange={(e) => setWorkflowData(prev => ({
                      ...prev,
                      script: { ...prev.script!, [key]: e.target.value }
                    }))}
                    className="min-h-[100px]"
                  />
                </div>
              ))}
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

      case 'media':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              {workflowData.imagePrompts?.map((prompt, index) => (
                <div key={prompt.id} className="space-y-2">
                  <label className="text-sm font-medium">
                    Image Prompt {index + 1} ({prompt.id})
                  </label>
                  <Textarea
                    value={prompt.prompt}
                    onChange={(e) => {
                      const newPrompts = [...(workflowData.imagePrompts || [])];
                      newPrompts[index] = { ...prompt, prompt: e.target.value };
                      setWorkflowData(prev => ({ ...prev, imagePrompts: newPrompts }));
                    }}
                    className="min-h-[100px]"
                  />
                </div>
              ))}
            </div>
            <Button 
              onClick={handleGenerateImages} 
              className="w-full" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Images...
                </>
              ) : (
                'Start Image Generation'
              )}
            </Button>
          </div>
        );

      case 'complete':
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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {getCurrentStepIndex() + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
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

        {/* Project Information (visible after step 1) */}
        {workflowData.projectDetails && currentStep !== 'name' && renderProjectDetailsSection()}

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[getCurrentStepIndex()].icon, { className: "h-5 w-5" })}
              {steps[getCurrentStepIndex()].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? renderLoadingContent() : renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PodcastWorkflow;
