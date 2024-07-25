import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
})

export const uploadStreamToS3 = async (stream, keyFilePath) => {
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
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }); // Expires in 1 hour
    
    return signedUrl
  } catch(error) {
    console.error(error)
  }
}