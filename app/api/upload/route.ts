// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { NextRequest, NextResponse } from 'next/server';

// const r2 = new S3Client({
//   region: 'auto',
//   endpoint: `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL}`,
//   credentials: {
//     accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
//   },
// });

// export async function POST(req: NextRequest) {
//   try {
//     const { fileName, fileType, folder = 'attractions' } = await req.json();

//     if (!fileName || !fileType) {
//       return NextResponse.json({ error: 'fileName and fileType required' }, { status: 400 });
//     }

//     const ext = fileName.split('.').pop();
//     const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

//     const command = new PutObjectCommand({
//       Bucket:      process.env.CLOUDFLARE_R2_BUCKET_NAME!,
//       Key:         key,
//       ContentType: fileType,
//     });

//     // Presigned URL valid for 5 minutes
//     const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

//     // Public URL to store in DB
//     const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

//     return NextResponse.json({ presignedUrl, publicUrl, key });
//   } catch (err) {
//     console.error('Presign error:', err);
//     return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
//   }
// }



import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

const r2 = new S3Client({
  region: 'auto',
  // ✅ Correct endpoint — must be account-level, NOT the bucket URL
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, folder = 'general' } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType required' }, { status: 400 });
    }

    const ext = fileName.split('.').pop();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket:      process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key:         key,
      ContentType: fileType,
    });

    // Presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    // Public URL to store in DB
    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ presignedUrl, publicUrl, key });
  } catch (err) {
    console.error('Presign error:', err);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}