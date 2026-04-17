/** Server-only. IAM user keys — never expose to the client. */
export type S3Env = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

/**
 * Prefer `AWS_S3_REGION` when your default `AWS_REGION` is something else but the bucket lives elsewhere.
 * Example: bucket in Ohio → `AWS_S3_REGION=us-east-2`
 */
export function getS3Env(): S3Env | null {
  const region = (process.env.AWS_S3_REGION ?? process.env.AWS_REGION)?.trim();
  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim();
  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;
  return { region, bucket, accessKeyId, secretAccessKey, ...(sessionToken ? { sessionToken } : {}) };
}

/** Virtual-hosted–style URL for a public object. */
export function publicObjectUrl(bucket: string, region: string, key: string): string {
  const encodedKey = key.split("/").map((p) => encodeURIComponent(p)).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}
