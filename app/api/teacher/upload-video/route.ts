import { NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const user = await requireAuth(["TEACHER"]);

    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

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

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 500MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ ذخیره خارج از public در پوشه uploads
    const uploadsDir = path.join(process.cwd(), "uploads", "videos");
    
    await mkdir(uploadsDir, { recursive: true });

    // نام یکتا
    const ext = path.extname(file.name) || ".mp4";
    const filename = `video_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // ذخیره فایل
    await writeFile(filePath, buffer);

    // ✅ URL برای دانشجو (از API)
    const videoUrl = `/api/videos/${filename}`;

    console.log("✅ Video saved:", filePath);
    console.log("✅ Video URL:", videoUrl);

    return NextResponse.json({
      videoUrl: videoUrl,
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
