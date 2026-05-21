// lib/upload.ts

export async function uploadToR2(file: File, folder = 'general'): Promise<string> {
  // Step 1: Get presigned URL from API
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder,
    }),
  });

  if (!res.ok) throw new Error('Failed to get upload URL');

  const { presignedUrl, publicUrl , key } = await res.json();

  // Step 2: Upload to R2
  const uploadRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) throw new Error('Upload failed');

  return key;
}

export function getR2Url(key: string): string {
  if (!key) return '';
  // If it's already a full URL, return as is
  if (key.startsWith('http')) return key;
  // Otherwise combine with base URL
  return `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}