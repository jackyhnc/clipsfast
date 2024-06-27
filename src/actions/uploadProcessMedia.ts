"use server"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid'; 

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },

})

export const uploadProcessMedia = async (penisissssss: string) => {
    
    /*
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${videoURL}/${uuidv4()}`,
        Body: videoURL,
    }
    const uploadVideoURLToS3 = new PutObjectCommand(uploadParams)
    s3.send(uploadVideoURLToS3)

    */
    const videoURL = "https://www.youtube.com/watch?v=WIHStlB-a_o"

    try {
        const response = await fetch("https://mkpogdgywg.execute-api.us-east-1.amazonaws.com/prod/video", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.AWS_LAMBDA_API_KEY || ""
            },
            body: JSON.stringify({ videoURL })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Unable to fetch AWS API:", error);
    }

    /*
    returns 
    {

    videoURL: "",
    processed: {
    link: "amazon.com/linktos3hostofclip.mp4"
    transcript: ""
    highlights: [
    {
        start: undefined,
        end: undefined,
        title: "",
    }
    ]
    }
    
    }
    */

}
    //make this shit a server fucntion that takes uploads into s3 bucket, in s3 during uploads, trigger step function => lanmbda process video
