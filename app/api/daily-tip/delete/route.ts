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

    const { tipId } = await req.json();

    if (!tipId) {
      return NextResponse.json({ error: "Tip ID is required" }, { status: 400 });
    }

    // حذف نکته ذخیره شده
    const deleted = await prisma.tipSave.deleteMany({
      where: {
        userId: user.id,
        tipId: tipId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Tip not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Tip deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting tip:", error);
    return NextResponse.json(
      { error: "Failed to delete tip" },
      { status: 500 }
    );
  }
}