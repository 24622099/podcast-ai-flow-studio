import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import { WorkflowSteps, workflowSteps } from './podcast/WorkflowSteps';
import { ProjectDetails } from './podcast/ProjectDetails';
import { LoadingState } from './podcast/LoadingState';
import { NameProjectStep } from './podcast/steps/NameProjectStep';
import { InputContentStep } from './podcast/steps/InputContentStep';
import { OutlineStep } from './podcast/steps/OutlineStep';
import { ScriptStep } from './podcast/steps/ScriptStep';
import { MediaStep } from './podcast/steps/MediaStep';
import { CompleteStep } from './podcast/steps/CompleteStep';

import { WorkflowStepType, WorkflowData, WebhookResponse, ScriptPartObject } from '@/types/podcast';

// We'll handle API calls directly in this component since they're specific to the workflow process
const handleApiCall = async (url: string, payload: any, successMessage: string) => {
  const { toast } = useToast();
  
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

    // Special handling for specific endpoints
    // For RunPromt endpoint, we want to keep the array structure intact
    if (url.includes('RunPromt')) {
      console.log('Preserving array structure for RunPromt endpoint', data);
      // If data is not an array but contains data property that is an array, extract it
      if (!Array.isArray(data) && data.data && Array.isArray(data.data)) {
        console.log('Extracting data array from response object');
        data = data.data;
      }
    } 
    // For other endpoints, handle arrays by taking the first item if needed
    else if (Array.isArray(data) && data.length > 0) {
      console.log('Processing non-RunPromt endpoint, taking first item from array');
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

const PodcastWorkflow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStepType>('name');
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
    script: [],
    imagePrompts: []
  });

  const { toast } = useToast();

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

  // Handlers for the name project step
  const handleNameChange = (name: string) => {
    setWorkflowData(prev => ({ ...prev, projectName: name }));
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

  // Handlers for the input content step
  const handleContentChange = (content: string) => {
    setWorkflowData(prev => ({ ...prev, initialContent: content }));
  };

  const handleGrammarPointChange = (point: string) => {
    setWorkflowData(prev => ({ ...prev, grammarPoint: point }));
  };

  const handleInitializeProject = async () => {
    console.log('=== CREATE OUTLINE BUTTON CLICKED ===');
    console.log('Current workflowData:', workflowData);
    console.log('Project name:', workflowData.projectName);
    console.log('Initial content:', workflowData.initialContent);
    console.log('Grammar point:', workflowData.grammarPoint);

    if (!workflowData.initialContent.trim()) {
      console.log('ERROR: No initial content provided');
      toast({
        title: "Error",
        description: "Please enter initial content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Initializing project and creating outline...');

    const payload = {
      action: "initializeProjectAndCreateOutline",
      payload: {
        projectName: workflowData.projectName,
        initialContent: workflowData.initialContent,
        grammarPoint: workflowData.grammarPoint
      }
    };

    console.log('=== SENDING TO WEBHOOK ===');
    console.log('URL: https://n8n.chichung.studio/webhook-test/NewProject_1');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://n8n.chichung.studio/webhook-test/NewProject_1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('=== WEBHOOK RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.log('Response not ok, throwing error');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();
      console.log('Response data:', data);

      // Handle the response
      if (data) {
        const webhookResponse = data as unknown as WebhookResponse;
        console.log('Processed webhook response:', webhookResponse);
        
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
        
        console.log('=== SUCCESS - MOVING TO OUTLINE STEP ===');
        setCurrentStep('outline');
        
        toast({
          title: "Success",
          description: "Project initialized and outline created!",
        });
      }
    } catch (error) {
      console.error('=== WEBHOOK ERROR ===');
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to communicate with server',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      console.log('=== WEBHOOK CALL COMPLETED ===');
    }
  };

  // Handlers for the outline step
  const handleOutlineChange = (field: string, value: string) => {
    setWorkflowData(prev => ({
      ...prev,
      outline: { ...prev.outline!, [field]: value }
    }));
  };

  const handleVocabChange = (value: string) => {
    setWorkflowData(prev => ({
      ...prev,
      outline: { 
        ...prev.outline!, 
        suggestedVocab: value.split(',').map(v => v.trim()).filter(Boolean)
      }
    }));
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

      console.log('Sending payload to RunPromt endpoint:', payload);
      
      const response = await handleApiCall(
        'https://n8n.chichung.studio/webhook-test/RunPromt',
        payload,
        'Script has been generated!'
      );

      console.log('Script generation response received:', response);

      // Handle the response, which should be an array of script parts
      if (Array.isArray(response)) {
        console.log('Script data is an array of length:', response.length);
        
        // Ensure each object in the array has the expected format
        const validScriptData = response.every(item => {
          const keys = Object.keys(item);
          return keys.length === 1 && typeof item[keys[0]] === 'string';
        });

        if (validScriptData) {
          console.log('Script data format is valid');
          setWorkflowData(prev => ({
            ...prev,
            script: response
          }));
          setCurrentStep('script');
        } else {
          console.error('Invalid script data format:', response);
          toast({
            title: "Warning",
            description: "Received script data in an unexpected format. Please try again.",
            variant: "destructive",
          });
        }
      } else if (response && typeof response === 'object') {
        // Try to extract script data from response if it's not directly an array
        console.log('Response is not an array, checking for script data in the object');
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Found script data array in response.data:', response.data);
          setWorkflowData(prev => ({
            ...prev,
            script: response.data
          }));
          setCurrentStep('script');
        } else {
          console.error('Could not find array data in response:', response);
          toast({
            title: "Warning",
            description: "Received unexpected response format. Expected an array of script sections.",
            variant: "destructive",
          });
        }
      } else {
        console.error('Expected array response for script but got:', response);
        toast({
          title: "Warning",
          description: "Received unexpected response format from server. Expected an array of script sections.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to create script:', error);
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Handlers for the script step
  const handleScriptChange = (index: number, key: string, value: string) => {
    const newScript = [...(workflowData.script || [])];
    newScript[index] = { [key]: value };
    setWorkflowData(prev => ({
      ...prev,
      script: newScript
    }));
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

  // Handlers for the media step
  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...(workflowData.imagePrompts || [])];
    newPrompts[index] = { ...newPrompts[index], prompt: value };
    setWorkflowData(prev => ({ 
      ...prev, 
      imagePrompts: newPrompts 
    }));
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

      await handleApiCall(
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

  // Handler for starting over
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
      script: [],
      imagePrompts: []
    });
    setCurrentStep('name');
    localStorage.removeItem('podcastWorkflowData');
  };

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
