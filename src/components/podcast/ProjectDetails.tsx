
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkflowData } from '@/types/podcast';

interface ProjectDetailsProps {
  workflowData: WorkflowData;
  showProjectDetails: boolean;
  setShowProjectDetails: (show: boolean) => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  workflowData, 
  showProjectDetails, 
  setShowProjectDetails 
}) => {
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
