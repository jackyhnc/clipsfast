"use client";

import { UploadButton } from "@/utils/uploadthing";

interface UploadCompleteResponse {
  url: string
}

interface Props {
  onUploadComplete: (res: UploadCompleteResponse[]) => void
}

export default function ImageUpload({ onUploadComplete }: Props) {
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
    />
    
  )
}
