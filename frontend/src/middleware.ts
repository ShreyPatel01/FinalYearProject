// import { NextResponse } from "next/server";
import { NextResponse, type NextRequest } from "next/server";
import { TokenExpiredCheck } from "./helpers/checkIfTokenExpired";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath =
    path === "/login" || path === "/signup" || path === "/verifyEmail";

  const token = request.cookies.get("token")?.value || "";

  if(token !== "") {
    //Checking if the token has expired
    if (TokenExpiredCheck(token)) {
      const response = NextResponse.redirect(request.nextUrl.origin + "/login");
      //Clearing the token cookie
      response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  if (request.nextUrl.pathname.startsWith("/user") && !token) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/verifyEmail",
    "/user/dashboard",
    "/user/createProject",
    "/user/viewInvitation",
    "/user/verifyEmail",
    "/user/project/:id*",
    "/client/dashboard"
  ],
};
