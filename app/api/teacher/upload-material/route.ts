import { NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    // احراز هویت استاد
    const user = await requireAuth(["TEACHER"]);

    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type." },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 50MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ایجاد نام امن برای فایل
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    
    // ایجاد پوشه اگر وجود نداشته باشد
    const uploadDir = path.join(process.cwd(), "public", "uploads", "materials");
    await mkdir(uploadDir, { recursive: true });
    
    // ذخیره فایل
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json(
      { 
        fileUrl: `/uploads/materials/${filename}`, 
        name: file.name 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}