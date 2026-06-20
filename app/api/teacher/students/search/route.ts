// app/api/teacher/students/search/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAuth } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(["TEACHER"]); // فقط استاد

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: [
          { email: { contains: q } },
          { id: q },
          { name: { contains: q } },
        ],
      },
      select: { id: true, name: true, email: true },
      take: 10,
    });

    return NextResponse.json({ students });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}