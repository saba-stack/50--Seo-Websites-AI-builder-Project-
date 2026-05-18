import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../utils/appError";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY
        }
      : undefined
});

export class StorageService {
  async uploadHtml(cityId: string, html: string) {
    if (!env.AWS_S3_BUCKET) throw new AppError("S3 bucket not configured", 400, "S3_NOT_CONFIGURED");
    const key = `newsletters/${cityId}/${randomUUID()}.html`;
    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: Buffer.from(html, "utf8"),
        ContentType: "text/html"
      })
    );
    return {
      bucket: env.AWS_S3_BUCKET,
      key,
      url: `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
    };
  }
}

export const storageService = new StorageService();
