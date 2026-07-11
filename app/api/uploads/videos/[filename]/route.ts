import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // ✅ Await params (required in Next.js 15)
    const { filename } = await params;

    const videoPath = process.env.VIDEO_STORAGE_PATH || path.join(process.cwd(), "videos");
    const filePath = path.join(videoPath, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;
    const ext = path.extname(filename).toLowerCase();

    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
    };

    const contentType = contentTypes[ext] || 'video/mp4';

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", fileSize.toString());
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Video serve error:", error);
    return NextResponse.json({ error: "Failed to serve video" }, { status: 500 });
  }
}