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
  // Optional: check if the file exists (you can enable if you want validation)
  // const storagePath = process.env.VIDEO_STORAGE_PATH || path.join(process.cwd(), "videos");
  // const fullFilePath = path.join(storagePath, filename);
  // if (!fs.existsSync(fullFilePath)) throw new Error(`File not found: ${filename}`);
  return filename;
}

export const GET = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const courses = await prisma.course.findMany({
      where: { teacherId: user.id },
      include: { enrollments: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      courses.map((c) => ({
        id: c.id,
        name: c.title,
        description: c.description,
        level: c.level,
        language: c.language,
        price: c.price,
        isPublished: c.isPublished,
        enrolledCount: c.enrollments.length,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}, ["TEACHER"]);

export const POST = withAuth(async (req: Request, context: any, user: any) => {
  try {
    const body = await req.json();

    const { 
      title, 
      description, 
      language, 
      level, 
      price, 
      isPublished, 
      promoVideoUrl,
      thumbnailUrl,
      materials, 
      autoEnroll, 
      manualStudentIds 
    } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // ✅ Extract filename from promoVideoUrl (store only the filename)
    let storedVideoUrl: string | null = null;
    if (promoVideoUrl) {
      try {
        storedVideoUrl = extractFilename(promoVideoUrl);
        if (!storedVideoUrl) {
          return NextResponse.json(
            { error: "Invalid video file path" },
            { status: 400 }
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || "Invalid video file path" },
          { status: 400 }
        );
      }
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        language: language ?? "English",
        level: level ?? "BEGINNER",
        price: Number(price) || 0,
        isPublished: isPublished ?? false,
        promoVideoUrl: storedVideoUrl, // ✅ store the filename only
        thumbnailUrl: thumbnailUrl ?? null,
        materials: materials ? JSON.stringify(materials) : null,
        teacherId: user.id,
        autoEnroll: autoEnroll ?? true,
      },
    });

    // ✅ Auto-create a content entry for the promo video (optional)
    // This is a convenience: the teacher can later add more content manually.
    if (storedVideoUrl) {
      await prisma.courseContent.create({
        data: {
          courseId: course.id,
          title: "ویدئوی معرفی دوره", // Or use a translated title
          type: "VIDEO",
          url: storedVideoUrl, // ✅ store only the filename
          text: null,
          order: 0,
          isFree: true,
        },
      });
    }

    // Enroll students if autoEnroll is false and manualStudentIds provided
    if (!autoEnroll && Array.isArray(manualStudentIds) && manualStudentIds.length > 0) {
      await Promise.all(
        manualStudentIds.map((studentId: string) =>
          prisma.enrollment.upsert({
            where: { 
              studentId_courseId: { studentId, courseId: course.id } 
            },
            update: {},
            create: { 
              studentId, 
              courseId: course.id, 
              teacherId: user.id,
              isPaid: true 
            },
          })
        )
      );
    }

    return NextResponse.json({ 
      id: course.id, 
      message: "Course created successfully" 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}, ["TEACHER"]);