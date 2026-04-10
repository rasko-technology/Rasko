import { NextResponse, type NextRequest } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { requireStore } from "@/app/lib/auth";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
  },
});

// POST /api/upload — upload file(s) to S3 via server
export async function POST(request: NextRequest) {
  const membership = await requireStore();
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const folder = formData.get("folder")?.toString() || "jobcards";

  if (files.length === 0 || files.length > 10) {
    return NextResponse.json({ error: "Provide 1-10 files" }, { status: 400 });
  }

  const results: { url: string; key: string; name: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      continue;
    }
    if (file.size > MAX_SIZE) {
      continue;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const key = `${folder}/${membership.store_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET || "rasko-service-images",
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    results.push({ url, key, name: file.name });
  }

  return NextResponse.json({ images: results });
}

// DELETE /api/upload — delete a file from S3
export async function DELETE(request: NextRequest) {
  const membership = await requireStore();
  const { key } = await request.json();

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  // Ensure the key belongs to the caller's store
  const storePrefix = `/${membership.store_id}/`;
  if (!key.includes(storePrefix)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET || "rasko-service-images",
      Key: key,
    }),
  );

  return NextResponse.json({ success: true });
}
