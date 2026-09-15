import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { LOGIN, PUBLIC_ROUTES, ROOT } from "./lib/routes.data";

const SESSION_COOKIE_NAME = "session_token";
const USER_COOKIE_NAME = "user";


const ADMIN_PREFIX = "/admin";
const FORBIDDEN_PATH = "/403";
const ADMIN_ROLES = ["ADMIN", "CONTENT_MANAGER"] as const;


export async function proxy(request: NextRequest) {

    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = request.cookies.get(USER_COOKIE_NAME)?.value;
    const isPublicRoute = (PUBLIC_ROUTES.find(route => request.nextUrl.pathname.startsWith(route))
        || request.nextUrl.pathname === ROOT);

    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL(LOGIN, request.nextUrl), request);
    }


    if (user) {

        try {
            const decodedUser = JSON.parse(user);
            const userRole = decodedUser.role;

            if (userRole) {
                const isAdminRoute = request.nextUrl.pathname.startsWith(ADMIN_PREFIX);
                const isUserRoute = request.nextUrl.pathname.startsWith("/user");

                if (isAdminRoute && !ADMIN_ROLES.includes(userRole as any)) {
                    return NextResponse.redirect(new URL(FORBIDDEN_PATH, request.nextUrl), request);
                }

                if (isUserRoute && !ADMIN_ROLES.includes(userRole as any)) {
                    return NextResponse.redirect(new URL(FORBIDDEN_PATH, request.nextUrl), request);
                }
            }
        } catch (error) {
            console.error("Error parsing user cookie:", error);
        }
    }
}


export const config = {
    matcher: ["/admin/:path*", '/user/:path', "/api/:path*", "/403/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}