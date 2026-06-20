// app/lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}

export async function requireAuth(allowedRoles?: Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}

export function withAuth(handler: Function, allowedRoles?: Role[]) {
  return async (req: Request, context: any) => {
    try {
      const user = await requireAuth(allowedRoles);
      return await handler(req, context, user);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
  };
}