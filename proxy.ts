// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // محافظت از صفحات داشبورد (ریدایرکت بر اساس نقش)
    if (pathname.startsWith("/dashboard/teacher")) {
      if (token?.role !== "TEACHER") {
        return NextResponse.redirect(new URL("/dashboard/student", req.url));
      }
    }
    if (pathname.startsWith("/dashboard/student")) {
      if (token?.role !== "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      }
    }

    // محافظت از API‌ها (برگرداندن خطای 401 یا 403)
    if (pathname.startsWith("/api/teacher")) {
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (token.role !== "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (pathname.startsWith("/api/student")) {
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (token.role !== "STUDENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // فقط مسیرهای صفحه را محافظت کن، APIها را به middleware بسپار
        if (pathname.startsWith("/dashboard")) {
          return !!token; // برای صفحات داشبورد حتماً لاگین لازم است
        }
        // برای بقیه مسیرها (از جمله APIها) اجازه عبور بده
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/teacher/:path*",
    "/api/student/:path*",
  ],
};