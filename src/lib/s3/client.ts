import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getS3Env, publicObjectUrl, type S3Env } from "./config";
import { tryS3ObjectKeyFromUrl } from "./keys";

export function requireS3Env(): S3Env {
  const env = getS3Env();
  if (!env) {
    throw new Error(
      "S3 is not configured. Set AWS_REGION (or AWS_S3_REGION), AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.local"
    );
  }
  return env;
}

function makeClient(env: S3Env) {
  return new S3Client({
    region: env.region,
    /** Follow 301 when region in env was wrong (still set AWS_S3_REGION / AWS_REGION to the bucket region). */
    followRegionRedirects: true,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
      ...(env.sessionToken ? { sessionToken: env.sessionToken } : {}),
    },
  });
}

export async function uploadObjectToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<{ publicUrl: string; bucket: string; region: string }> {
  const env = requireS3Env();
  const client = makeClient(env);
  await client.send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
    })
  );
  return {
    publicUrl: publicObjectUrl(env.bucket, env.region, key),
    bucket: env.bucket,
    region: env.region,
  };
}

/** Best-effort delete when the row URL points at our bucket. */
export async function deleteS3ObjectIfOurs(publicUrl: string): Promise<void> {
  const env = getS3Env();
  if (!env) return;
  const key = tryS3ObjectKeyFromUrl(publicUrl, env.bucket);
  if (!key) return;
  const client = makeClient(env);
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.bucket,
      Key: key,
    })
  );
}
