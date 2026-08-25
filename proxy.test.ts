import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";

describe("Proxy", () => {
	it("should allow access to public routes", () => {
		const request = new NextRequest(new URL("http://localhost:3000/"));
		const response = proxy(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	it("should allow access to /login without auth", () => {
		const request = new NextRequest(new URL("http://localhost:3000/login"));
		const response = proxy(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	it("should redirect unauthenticated users from /library to /login", () => {
		const request = new NextRequest(new URL("http://localhost:3000/library"));
		const response = proxy(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain("/login");
		expect(response.headers.get("location")).toContain("callbackUrl=%2Flibrary");
	});

	it("should redirect unauthenticated users from /settings to /login", () => {
		const request = new NextRequest(new URL("http://localhost:3000/settings"));
		const response = proxy(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain("/login");
	});

	it("should redirect unauthenticated users from nested protected routes", () => {
		const request = new NextRequest(new URL("http://localhost:3000/library/manga/123"));
		const response = proxy(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain("/login");
	});

	it("should allow authenticated users to access protected routes", () => {
		const request = new NextRequest(new URL("http://localhost:3000/library"), {
			headers: {
				cookie: "better-auth.session_token=valid-token-123",
			},
		});
		const response = proxy(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	it("should have correct matcher config", () => {
		expect(config.matcher).toEqual(["/((?!api|_next/static|_next/image|favicon.ico).*)"]);
	});
});
