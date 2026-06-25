import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  req: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    // ✅ محافظت: فقط فایل‌های ویدئویی
    if (!filename.match(/\.(mp4|webm|avi|mov)$/i)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // مسیر فایل
    const filePath = path.join(process.cwd(), "uploads", "videos", filename);

    // چک کن فایل موجود هست یا نه
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // خواندن فایل
    const buffer = await readFile(filePath);
    const fileStats = await stat(filePath);

    // تعریف نوع content
    const contentType = filename.endsWith(".webm")
      ? "video/webm"
      : filename.endsWith(".mov")
      ? "video/quicktime"
      : filename.endsWith(".avi")
      ? "video/x-msvideo"
      : "video/mp4";

    // ✅ Stream کردن ویدئو (بهتر برای فایل‌های بزرگ)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStats.size.toString(),
        "Cache-Control": "public, max-age=86400", // 1 روز کش
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("❌ Video fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load video" },
      { status: 500 }
    );
  }
}
