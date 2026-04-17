/**
 * Surface AWS SDK v3 errors in API responses (AccessDenied, etc.).
 */
export function formatAwsLikeError(err: unknown): { message: string; hint?: string; httpStatus: number } {
  if (err instanceof Error) {
    const name =
      "name" in err && typeof (err as Error & { name?: string }).name === "string"
        ? (err as Error & { name: string }).name
        : err.constructor?.name ?? "Error";
    const msg = err.message || String(err);
    return finalizeAwsMessage(name, msg);
  }
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const name =
      typeof o.name === "string"
        ? o.name
        : typeof o.Code === "string"
          ? o.Code
          : "Error";
    const msg =
      typeof o.message === "string"
        ? o.message
        : typeof o.Message === "string"
          ? o.Message
          : JSON.stringify(err);
    return finalizeAwsMessage(name, msg);
  }
  return { message: String(err), httpStatus: 500 };
}

function finalizeAwsMessage(name: string, msg: string): { message: string; hint?: string; httpStatus: number } {
  const hint = hintForAws(name, msg);
  const accessDenied = name === "AccessDenied" || msg.toLowerCase().includes("access denied");
  const redirect =
    name === "PermanentRedirect" ||
    msg.toLowerCase().includes("specified endpoint") ||
    msg.toLowerCase().includes("send all future requests");
  return {
    message: `${name}: ${msg}`,
    hint,
    httpStatus: accessDenied ? 403 : redirect ? 400 : 500,
  };
}

function hintForAws(name: string, message: string): string | undefined {
  const m = message.toLowerCase();
  const redirect =
    name === "PermanentRedirect" ||
    m.includes("permanentredirect") ||
    m.includes("specified endpoint") ||
    m.includes("send all future requests");
  if (redirect) {
    return (
      "Region mismatch: set AWS_REGION (or AWS_S3_REGION) to the bucket’s region. In S3 → your bucket → Properties, " +
      "check “AWS Region” (e.g. US East Ohio = us-east-2). Put that value in .env.local and restart the dev server."
    );
  }
  const access = name === "AccessDenied" || m.includes("access denied");
  if (access) {
    return (
      "Check IAM: the user for these keys needs s3:PutObject (and s3:DeleteObject for deletes) on " +
      "arn:aws:s3:::YOUR_BUCKET_NAME/*. Ensure AWS_REGION matches the bucket region, " +
      "AWS_S3_BUCKET matches the bucket name exactly, and the access key belongs to that IAM user."
    );
  }
  if (name === "NoSuchBucket" || m.includes("no such bucket")) {
    return "Verify AWS_S3_BUCKET matches the bucket name and AWS_REGION matches where the bucket was created.";
  }
  if (m.includes("kms") || name === "KMSNotFoundException") {
    return "Bucket may require KMS encryption — ensure the IAM user can use the bucket’s KMS key, or adjust bucket default encryption.";
  }
  return undefined;
}
