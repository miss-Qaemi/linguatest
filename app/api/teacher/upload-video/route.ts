import { NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    // احراز هویت استاد
    const user = await requireAuth(["TEACHER"]);

    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    // check the file existence
    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    // بررسی نوع فایل
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/avi",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use MP4, MOV, or WebM." },
        { status: 400 }
      );
    }

    // بررسی حجم فایل (200MB)
    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 200MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ایجاد پوشه اگر وجود نداشته باشد
    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadDir, { recursive: true });

    // ایجاد نام یکتا برای فایل
    const ext = path.extname(file.name) || ".mp4";
    const filename = `video_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // ذخیره فایل
    await writeFile(filePath, buffer);

    // برگرداندن مسیر فایل
    return NextResponse.json({
      videoUrl: `/uploads/videos/${filename}`,
    });

  } catch (error) {
    console.error("Upload video error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}