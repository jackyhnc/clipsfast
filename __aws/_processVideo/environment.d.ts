declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_S3_BUCKET_NAME: string;
      OPENAI_API_KEY: string;
    }
  }
}

export {};

