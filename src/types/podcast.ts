
export interface WebhookResponse {
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

export interface ScriptPartObject {
  [key: string]: string;
}

export interface WorkflowData {
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
  script?: ScriptPartObject[];
  imagePrompts?: Array<{
    id: string;
    prompt: string;
  }>;
}

export type WorkflowStep = 'name' | 'input' | 'outline' | 'script' | 'media' | 'complete';

export interface WorkflowStep {
  key: WorkflowStep;
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}
