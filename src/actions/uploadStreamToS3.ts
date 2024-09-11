"use server"

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PassThrough } from "stream";

export const uploadStreamToS3 = async (stream: PassThrough, keyFilePath: string) => {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS_ACCESS_KEY_ID not set");
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_SECRET_ACCESS_KEY not set");
  }
  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION not set");
  }
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  })

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: keyFilePath,
    Body: stream,
  }
  const upload = new Upload({
    client: s3Client,
    params: uploadParams,
  })
  
  try {    
    await upload.done()
    console.log("Uploaded to: " + keyFilePath)

    const getObjectParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: keyFilePath,
    };
    const getObjectCommand = new GetObjectCommand(getObjectParams)

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand); // no expiration on link

    return signedUrl
  } catch(error) {
    throw new Error("Error uploading to S3: " + error)
  }
}