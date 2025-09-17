import {s3} from "../config/s3"
/**
 * Upload a file to AWS S3 and get its URL
 * @param fileBuffer - The file in memory (Buffer)
 * @param fileName - Original file name
 * @param folder - Folder in S3 bucket (default 'uploads')
 * @param contentType - File MIME type (default 'application/octet-stream')
 * @returns Uploaded file URL
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  folder = 'uploads',
  contentType = 'application/octet-stream'
): Promise<string> => {
  const params = {
    Bucket: 'dineqr-image-storage',        // Your bucket name
    Key: `${folder}/${Date.now()}-${fileName}`, // File path in bucket
    Body: fileBuffer,                   // File content
    ContentType: contentType,           // MIME type
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location; // URL of uploaded file
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('File upload failed');
  }
};
