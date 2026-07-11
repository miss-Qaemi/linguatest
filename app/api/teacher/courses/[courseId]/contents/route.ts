import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import path from "path";
import fs from "fs";

// Helper: extract filename from a full path
function extractFilename(fullPath: string | null): string | null {
  if (!fullPath) return null;
  const filename = path.basename(fullPath);
  if (!filename) return null;
  // Optional: validate that the file exists (you can enable if you want)
  // const storagePath = process.env.VIDEO_STORAGE_PATH || path.join(process.cwd(), "videos");
  // const fullFilePath = path.join(storagePath, filename);
  // if (!fs.existsSync(fullFilePath)) throw new Error(`File not found: ${filename}`);
  return filename;
}

// GET: دریافت لیست محتواها
export const GET = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      const params = await context.params;
      const courseId = params.courseId;

      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const contents = await prisma.courseContent.findMany({
        where: { courseId: courseId },
        orderBy: { order: "asc" },
      });

      return NextResponse.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      return NextResponse.json(
        { error: "Failed to fetch contents" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);

// POST: ایجاد محتوای جدید
export const POST = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      const params = await context.params;
      const courseId = params.courseId;

      // بررسی وجود کورس و مالکیت
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const body = await req.json();
      const { title, type, url, text, order, isFree } = body;

      if (!title?.trim()) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }

      let storedUrl: string | null = null;
      if (type === "VIDEO" || type === "FILE") {
        if (!url?.trim()) {
          return NextResponse.json(
            { error: "URL is required for video/file content" },
            { status: 400 }
          );
        }
        // ✅ Extract filename from the full path
        try {
          storedUrl = extractFilename(url);
          if (!storedUrl) {
            return NextResponse.json(
              { error: "Invalid file path" },
              { status: 400 }
            );
          }
        } catch (err: any) {
          return NextResponse.json(
            { error: err.message || "Invalid file path" },
            { status: 400 }
          );
        }
      }

      if (type === "TEXT") {
        if (!text?.trim()) {
          return NextResponse.json(
            { error: "Text content is required" },
            { status: 400 }
          );
        }
      }

      const content = await prisma.courseContent.create({
        data: {
          courseId: courseId,
          title: title.trim(),
          type,
          url: storedUrl, // ✅ store only the filename
          text: text || null,
          order: order ?? 0,
          isFree: !!isFree,
        },
      });

      return NextResponse.json(content, { status: 201 });
      
    } catch (error) {
      console.error("Error creating content:", error);
      return NextResponse.json(
        { error: "Failed to create content" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);

// DELETE: حذف محتوا (با دریافت contentId از body)
export const DELETE = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      const params = await context.params;
      const courseId = params.courseId;

      // دریافت contentId از body (نه از URL)
      const body = await req.json();
      const { contentId } = body;

      if (!contentId) {
        return NextResponse.json(
          { error: "Content ID is required" },
          { status: 400 }
        );
      }

      // بررسی مالکیت کورس
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
        select: { id: true },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Course not found or access denied" },
          { status: 404 }
        );
      }

      // بررسی وجود محتوا
      const content = await prisma.courseContent.findFirst({
        where: {
          id: contentId,
          courseId: courseId,
        },
        select: { id: true },
      });

      if (!content) {
        return NextResponse.json(
          { error: "Content not found" },
          { status: 404 }
        );
      }

      // حذف محتوا
      await prisma.courseContent.delete({
        where: { id: contentId },
      });

      return NextResponse.json({
        success: true,
        message: "Content deleted successfully",
      });

    } catch (error) {
      console.error("Error deleting content:", error);
      return NextResponse.json(
        { error: "Failed to delete content" },
        { status: 500 }
      );
    }
  },
  ["TEACHER"]
);