import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original filename
 * @param {string} mimeType - File MIME type
 * @param {number} eventId - Event ID for organizing files
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadToS3(fileBuffer, fileName, mimeType, eventId) {
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString("hex");
  const fileExtension = fileName.split(".").pop();
  const key = `events/${eventId}/${timestamp}-${randomString}.${fileExtension}`;

  // Use Access Point ARN if available, otherwise use bucket name
  const bucketOrArn = process.env.S3_ACCESS_POINT_ARN || process.env.AWS_S3_BUCKET;

  const command = new PutObjectCommand({
    Bucket: bucketOrArn,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Return the public URL
  // For Access Points, construct URL differently
  const region = process.env.AWS_REGION;
  if (process.env.S3_ACCESS_POINT_ARN) {
    // Extract access point name from ARN
    const accessPointName = process.env.S3_ACCESS_POINT_ARN.split('/').pop();
    const accountId = process.env.S3_ACCESS_POINT_ARN.split(':')[4];
    return `https://${accessPointName}-${accountId}.s3-accesspoint.${region}.amazonaws.com/${key}`;
  } else {
    const bucket = process.env.AWS_S3_BUCKET;
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}

/**
 * Delete a file from S3
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteFromS3(imageUrl) {
  try {
    // Extract the key from the URL
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    // Use Access Point ARN if available, otherwise use bucket name
    const bucketOrArn = process.env.S3_ACCESS_POINT_ARN || process.env.AWS_S3_BUCKET;

    const command = new DeleteObjectCommand({
      Bucket: bucketOrArn,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}
