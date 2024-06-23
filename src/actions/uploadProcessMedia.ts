"use server"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from 'uuid'; 

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },

})

export const uploadProcessMedia = async (videoURL: string) => {
    
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${videoURL}/${uuidv4()}`,
        Body: videoURL,
    }
    const uploadVideoURLToS3 = new PutObjectCommand(uploadParams)
    s3.send(uploadVideoURLToS3)

}
    //make this shit a server fucntion that takes uploads into s3 bucket, in s3 during uploads, trigger step function => lanmbda process video
