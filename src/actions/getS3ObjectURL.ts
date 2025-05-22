"use server"

import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const getS3ObjectURL = async (keyFilePath: string) => {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error("AWS_ACCESS_KEY_ID not set");
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS_SECRET_ACCESS_KEY not set");
  }
  if (!process.env.AWS_REGION) {
    throw new Error("AWS_REGION not set");
  }
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME not set");
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
  });

  try {
    // First check if the object exists
    const headObjectParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: keyFilePath,
    };
    
    try {
      await s3Client.send(new HeadObjectCommand(headObjectParams));
    } catch (error) {
      // If we get a 404 or similar error, the object doesn't exist
      return null;
    }

    // If we get here, the object exists, so generate the signed URL
    const getObjectParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: keyFilePath,
    };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }); // 1 hour expiration
    return signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }
}