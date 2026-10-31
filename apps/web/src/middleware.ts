import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

// Public routes
const publicRoutes = [
  "/",
  "/signin",
  "/signup",
  "/forgot-password",
  "/verify-code",
  "/reset-password",
  "/api/webhooks/clerk",
];

export default clerkMiddleware(async (auth, req) => {
  // Check if the request matches any public route
  const url = req.nextUrl;
  const pathname = url.pathname;
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }


  const { sessionClaims } = await auth();
  const userRole =
    (sessionClaims?.metadata as { userType: "student" | "teacher" })
      ?.userType || "student";

  // Redirect logic for student routes
  if (isStudentRoute(req)) {
    if (userRole !== "student") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Redirect logic for teacher routes
  if (isTeacherRoute(req)) {
    if (userRole !== "teacher") {
      const url = new URL("/teacher/courses", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
