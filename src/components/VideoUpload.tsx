"use client";

import { UploadButton } from "@/utils/uploadthing";

interface UploadCompleteResponse {
  url: string
}

type ButtonCallbackArguments = {
  ready: boolean;
  isUploading: boolean;
  uploadProgress: number;
  fileTypes: string[];
};

type StyleField = string
type ContentField = React.ReactNode | ((args: ButtonCallbackArguments) => React.ReactNode)

type UploadButtonProps = {
  onUploadComplete: (res: UploadCompleteResponse[]) => void
  appearance?: {
    container?: StyleField;
    button?: StyleField;
    allowedContent?: StyleField;
  };
  content?: {
    button?: ContentField;
    allowedContent?: ContentField;
  };
};

export default function VideoUploader({ onUploadComplete, appearance, content }: UploadButtonProps) {
  return (
    <UploadButton
        endpoint="videoUploader"
        onClientUploadComplete={(res: UploadCompleteResponse[]) => {
            console.log("Files: ", res);
            alert("Upload Completed");
            onUploadComplete(res)
        }}
        onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
        }}
        appearance={appearance}
        content={content}
    />
    
  )
}
