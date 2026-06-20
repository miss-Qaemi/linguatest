import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";

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
    console.log("Create course request:", body); // دیباگ

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

    // ایجاد کورس
    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        language: language ?? "English",
        level: level ?? "BEGINNER",
        price: Number(price) || 0,
        isPublished: isPublished ?? false,
        promoVideoUrl: promoVideoUrl ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        materials: materials ? JSON.stringify(materials) : null,
        teacherId: user.id,
        autoEnroll: autoEnroll ?? true,
      },
    });

    console.log("Course created:", course.id); // دیباگ

    // ثبت‌نام دانشجوها (اگر autoEnroll=false و manualStudentIds داده شده)
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

    // ✅ برگردوندن یه پاسخ معتبر با id
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