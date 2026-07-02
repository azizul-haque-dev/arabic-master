// Handles audio/image uploads for ArabicText entries. Files are pushed
// to S3 and only the public URL is stored in Postgres.
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { env } from "../config/env.js";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export async function uploadToS3(
  file: Express.Multer.File,
  folder: string,
): Promise<string> {
  const key = `${folder}/${crypto.randomUUID()}${path.extname(file.originalname)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
  const key = fileUrl.split(".amazonaws.com/")[1];
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
  );
}
