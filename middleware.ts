import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("admin_authenticated")?.value === "true"

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  // Redirect to admin if already logged in
  if (request.nextUrl.pathname === "/admin/login" && isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
