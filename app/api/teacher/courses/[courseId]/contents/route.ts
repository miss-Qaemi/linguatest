import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import { log } from "console";

// GET: دریافت لیست محتواها
export const GET = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      // 🟢 دریافت courseId
      const params = await context.params;
      const courseId = params.courseId;

      console.log({params});
      console.log({courseId})
      
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
      });
    
      console.log("After: ")
      console.log(course)

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const contents = await prisma.courseContent.findMany({
        where: { courseId: courseId },
        orderBy: { order: "asc" },
      });

      console.log(contents)

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
      // 🟢 دریافت courseId
      const params = await context.params;
      const courseId = params.courseId;
      
      console.log("Creating content for course:", courseId);
      
      // بررسی وجود کورس و مالکیت
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: user.id },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const body = await req.json();
      console.log("Content data:", body);
      
      const { title, type, url, text, order, isFree } = body;

      // ✅ فقط عنوان رو چک کن، نه description
      if (!title?.trim()) {
        return NextResponse.json(
          { error: "Title is required" },
          { status: 400 }
        );
      }

      // اعتبارسنجی براساس نوع محتوا
      if (type === "VIDEO" || type === "FILE") {
        if (!url?.trim()) {
          return NextResponse.json(
            { error: "URL is required for video/file content" },
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
          url: url || null,
          text: text || null,
          order: order ?? 0,
          isFree: !!isFree,
        },
      });

      console.log("Content created:", content.id);
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