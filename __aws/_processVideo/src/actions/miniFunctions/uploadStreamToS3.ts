import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PassThrough, Readable } from "stream";

import 'dotenv/config'

const {
  AWS_ACCESS_KEY_ID: accessKeyId,
  AWS_SECRET_ACCESS_KEY: secretAccessKey,
  AWS_REGION: region,
  AWS_S3_BUCKET_NAME: s3BucketName,
} = process.env;

if (!accessKeyId || !secretAccessKey || !region || !s3BucketName) {
  throw new Error("Missing environment variables");
}

const s3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: region,
});

const uploadStreamToS3 = async (stream: PassThrough | Readable, keyFilePath: string) => {
  const uploadParams = {
    Bucket: s3BucketName,
    Key: keyFilePath,
    Body: stream,
  };

  const upload = new Upload({
    client: s3Client,
    params: uploadParams,
  });

  try {
    await upload.done();
    const getObjectParams = {
      Bucket: s3BucketName,
      Key: keyFilePath,
    };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });

    return signedUrl;
  } catch (error: any) {
    throw new Error(`Failed to upload stream to S3: ${error.message}`);
  }
};

export default uploadStreamToS3;
