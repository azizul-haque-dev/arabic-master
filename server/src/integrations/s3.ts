/**
 * AWS S3 / Cloudflare R2 Storage Integration
 * Handles file uploads and deletions to S3-compatible storage
 */

import { env } from "@/config/env.js";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

/**
 * Check if S3 is configured
 */
function isConfigured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY,
  );
}

let client: S3Client | null = null;

/**
 * Get or initialize the S3 client (lazy initialization)
 * @throws If S3 is not configured
 */
function getClient(): S3Client {
  if (!isConfigured()) {
    throw new Error("S3 is not configured");
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID as string}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
      },
    });
  }

  return client;
}

export interface UploadFileResult {
  key: string;
  publicUrl: string;
}

/**
 * Upload a file to S3/R2
 * @param file Multer file object
 * @param folder S3 folder prefix (default: "audio")
 * @returns Upload result with key and public URL
 */
export async function uploadFile(
  file: Express.Multer.File,
  folder = "audio",
): Promise<UploadFileResult> {
  const key = `${folder}/${crypto.randomUUID()}${path.extname(file.originalname)}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME as string,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const publicUrl = `${env.R2_PUBLIC_URL as string}/${key}`;

  return { key, publicUrl };
}

/**
 * Delete a file from S3/R2
 * @param fileUrl Full public URL of the file to delete
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!env.R2_PUBLIC_URL || !fileUrl.startsWith(env.R2_PUBLIC_URL as string)) {
    return;
  }

  const key = fileUrl.replace(env.R2_PUBLIC_URL as string, "").replace(/^\//, "");

  if (!key) {
    return;
  }

  await getClient().send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME as string,
      Key: key,
    }),
  );
}
