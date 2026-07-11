import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { withAuth } from "@/app/lib/auth";
import path from "path";

export const GET = withAuth(
  async (req: Request, context: any, user: any) => {
    try {
      const params = await context.params;
      const courseId = params.courseId;

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 }
        );
      }

      // ✅ Include promoVideoUrl in the select
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { 
          id: true, 
          title: true, 
          description: true, 
          isPublished: true,
          price: true,
          promoVideoUrl: true, // ✅ Added
        },
      });

      if (!course || !course.isPublished) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: user.id, courseId: courseId },
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: "شما در این کورس ثبت‌نام نکرده‌اید" },
          { status: 403 }
        );
      }

      // Get course contents
      const contents = await prisma.courseContent.findMany({
        where: { courseId: courseId },
        orderBy: { order: "asc" },
      });

      const isPaid = enrollment.isPaid ?? false;

      // ✅ Build content list with proper video URLs
      const safeContents = contents.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        order: c.order,
        isFree: c.isFree,
        locked: !(c.isFree || isPaid),
        url: (c.isFree || isPaid) && c.url && c.type === "VIDEO" 
          ? `/api/uploads/videos/${path.basename(c.url)}` 
          : (c.isFree || isPaid) && c.url 
            ? c.url 
            : "",
        text: c.isFree || isPaid ? c.text : null,
      }));

      // ✅ If there's a promo video and it's not already in contents, add it as the first item
      let finalContents = safeContents;
      if (course.promoVideoUrl) {
        // Check if promo video is already in contents (by matching the filename)
        const promoFilename = path.basename(course.promoVideoUrl);
        const alreadyExists = safeContents.some(
          (c) => c.type === "VIDEO" && c.url && path.basename(c.url) === promoFilename
        );

        if (!alreadyExists) {
          // ✅ Add promo video as the first content item (free)
          finalContents = [
            {
              id: "promo-video",
              title: "🎬 ویدئوی معرفی دوره",
              type: "VIDEO" as const,
              order: 0,
              isFree: true,
              locked: false,
              url: `/api/uploads/videos/${promoFilename}`,
              text: null,
            },
            ...safeContents,
          ];
        }
      }

      return NextResponse.json({
        course: { 
          id: course.id, 
          title: course.title, 
          description: course.description,
          promoVideoUrl: course.promoVideoUrl, // ✅ Include in response
        },
        contents: finalContents,
        isPaid,
      });
      
    } catch (error) {
      console.error("Error fetching student course:", error);
      return NextResponse.json(
        { error: "Failed to fetch course content" },
        { status: 500 }
      );
    }
  },
  ["STUDENT"]
);