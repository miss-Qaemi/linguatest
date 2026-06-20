import { NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/webm",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: Request) {
  try {
    // احراز هویت استاد
    const user = await requireAuth(["TEACHER"]);

    const formData = await req.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 50MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ایجاد پوشه اگر وجود نداشته باشد
    const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
    await mkdir(uploadDir, { recursive: true });

    // ایجاد نام یکتا برای فایل
    const ext = path.extname(file.name) || ".mp3";
    const filename = `audio_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // ذخیره فایل
    await writeFile(filePath, buffer);

    // برگرداندن مسیر فایل
    return NextResponse.json({ 
      url: `/uploads/audio/${filename}` 
    });

  } catch (err) {
    console.error("Upload audio error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}