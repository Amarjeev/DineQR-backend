import AWS, { S3 } from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS with your access keys and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,       // from IAM user
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // from IAM user
  region: 'ap-south-1',                              // replace with your bucket region
});

// Create a typed S3 instance
export const s3: S3 = new AWS.S3();
