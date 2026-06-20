import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { examId } = await req.json();

    // حذف نتیجه ذخیره شده
    await prisma.savedResult.deleteMany({
      where: {
        userId: user.id,
        examId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "نتیجه با موفقیت از داشبورد حذف شد" 
    });

  } catch (error) {
    console.error("Error unsaving result:", error);
    return NextResponse.json(
      { error: "Failed to unsave result" },
      { status: 500 }
    );
  }
}