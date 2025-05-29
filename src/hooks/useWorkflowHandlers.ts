
import { useToast } from '@/hooks/use-toast';
import { WorkflowData, WebhookResponse } from '@/types/podcast';
import { createApiHandler } from '@/utils/workflowApi';

export const useWorkflowHandlers = (
  workflowData: WorkflowData,
  setWorkflowData: React.Dispatch<React.SetStateAction<WorkflowData>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<any>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  const { toast } = useToast();
  const handleApiCall = createApiHandler();

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

    try {
      const response = await fetch('https://n8n.chichung.studio/webhook/NewProject_1', {
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
      console.log('Response data:', data);

      if (data) {
        const webhookResponse = data as unknown as WebhookResponse;
        
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
        
        toast({
          title: "Success",
          description: "Project initialized and outline created!",
        });
      }
    } catch (error) {
      console.error('=== WEBHOOK ERROR ===');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to communicate with server',
        variant: "destructive",
      });
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
    // Check if we have new script data from the webhook
    const newScriptData = (window as any).newScriptData;
    
    if (newScriptData) {
      console.log('Using new script data from webhook:', newScriptData);
      
      // Update workflow data with the new script
      setWorkflowData(prev => ({
        ...prev,
        script: newScriptData
      }));
      
      // Clear the temporary data
      delete (window as any).newScriptData;
      
      // Advance to script step
      setCurrentStep('script');
      
      return;
    }

    // Fallback to original API call if no new data
    setIsLoading(true);
    setLoadingMessage('Generating detailed script...');

    try {
      const payload = {
        action: "createScript",
        payload: {
          driveFolderId: workflowData.driveFolderId,
          editedOutline: workflowData.outline,
          grammarPoint: workflowData.grammarPoint,
          projectDetails: workflowData.projectDetails
        }
      };

      const response = await handleApiCall(
        'https://n8n.chichung.studio/webhook/RunPromt',
        payload,
        'Script has been generated!'
      );

      if (Array.isArray(response)) {
        const validScriptData = response.every(item => {
          const keys = Object.keys(item);
          return keys.length === 1 && typeof item[keys[0]] === 'string';
        });

        if (validScriptData) {
          setWorkflowData(prev => ({
            ...prev,
            script: response
          }));
          setCurrentStep('script');
        }
      }
    } catch (error) {
      console.error('Failed to create script:', error);
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

  return {
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
    handleGenerateImages
  };
};
