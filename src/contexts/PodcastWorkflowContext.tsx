
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkflowData, WorkflowStepType, WebhookResponse } from '@/types/podcast';
import { useToast } from '@/hooks/use-toast';
import { handleApiCall } from '@/services/podcastApi';

// Default initial workflow data
const defaultWorkflowData: WorkflowData = {
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

// Context type definition
interface PodcastWorkflowContextType {
  currentStep: WorkflowStepType;
  setCurrentStep: React.Dispatch<React.SetStateAction<WorkflowStepType>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadingMessage: string;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  showProjectDetails: boolean;
  setShowProjectDetails: React.Dispatch<React.SetStateAction<boolean>>;
  workflowData: WorkflowData;
  setWorkflowData: React.Dispatch<React.SetStateAction<WorkflowData>>;
  // Step handlers
  handleNameChange: (name: string) => void;
  handleNameProject: () => void;
  handleContentChange: (content: string) => void;
  handleGrammarPointChange: (point: string) => void;
  handleInitializeProject: () => Promise<void>;
  handleOutlineChange: (field: string, value: string) => void;
  handleVocabChange: (value: string) => void;
  handleCreateScript: () => Promise<void>;
  handleScriptChange: (index: number, key: string, value: string) => void;
  handleConfirmScript: () => Promise<void>;
  handlePromptChange: (index: number, value: string) => void;
  handleGenerateImages: () => Promise<void>;
  handleStartOver: () => void;
}

// Create context with default values
const PodcastWorkflowContext = createContext<PodcastWorkflowContextType | undefined>(undefined);

// Provider component
export const PodcastWorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStepType>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [workflowData, setWorkflowData] = useState<WorkflowData>(defaultWorkflowData);

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
    setWorkflowData(defaultWorkflowData);
    setCurrentStep('name');
    localStorage.removeItem('podcastWorkflowData');
  };

  const value = {
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    showProjectDetails,
    setShowProjectDetails,
    workflowData,
    setWorkflowData,
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
  };

  return (
    <PodcastWorkflowContext.Provider value={value}>
      {children}
    </PodcastWorkflowContext.Provider>
  );
};

// Custom hook for using the context
export const usePodcastWorkflow = () => {
  const context = useContext(PodcastWorkflowContext);
  if (context === undefined) {
    throw new Error('usePodcastWorkflow must be used within a PodcastWorkflowProvider');
  }
  return context;
};
