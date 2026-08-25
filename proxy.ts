import { type NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/library", "/settings"];

export function proxy(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;

	const isProtected = protectedPaths.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);

	if (!isProtected) {
		return NextResponse.next();
	}

	const sessionToken = request.cookies.get("better-auth.session_token")?.value;

	if (!sessionToken) {
		const homeUrl = new URL("/", request.url);
		homeUrl.searchParams.set("login", "true");
		homeUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(homeUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
