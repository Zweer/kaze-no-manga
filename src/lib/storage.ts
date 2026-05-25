import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.R2_BUCKET_NAME!;
const publicUrl = process.env.R2_PUBLIC_URL!;

/** Build the R2 key for a chapter page */
export function pageKey(mangaId: string, chapterId: string, pageIndex: number): string {
  return `chapters/${mangaId}/${chapterId}/${String(pageIndex).padStart(3, '0')}.webp`;
}

/** Get the public URL for a stored page */
export function pagePublicUrl(mangaId: string, chapterId: string, pageIndex: number): string {
  return `${publicUrl}/${pageKey(mangaId, chapterId, pageIndex)}`;
}

/** Upload a single image buffer to R2 */
export async function uploadPage(
  mangaId: string,
  chapterId: string,
  pageIndex: number,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const key = pageKey(mangaId, chapterId, pageIndex);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${publicUrl}/${key}`;
}

/** Download an image from a source URL, returning the buffer and content type */
export async function downloadImage(
  imageUrl: string,
  referer: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(imageUrl, {
    headers: { Referer: referer, Accept: 'image/*' },
  });
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('Content-Type') || 'image/jpeg';
  return { buffer, contentType };
}
