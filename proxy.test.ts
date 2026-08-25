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

	it("should allow access to search without auth", () => {
		const request = new NextRequest(new URL("http://localhost:3000/"));
		const response = proxy(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	it("should redirect unauthenticated users from /library to /?login=true", () => {
		const request = new NextRequest(new URL("http://localhost:3000/library"));
		const response = proxy(request);

		expect(response.status).toBe(307);
		const location = response.headers.get("location")!;
		expect(location).toContain("/?login=true");
		expect(location).toContain("callbackUrl=%2Flibrary");
	});

	it("should redirect unauthenticated users from /settings to /?login=true", () => {
		const request = new NextRequest(new URL("http://localhost:3000/settings"));
		const response = proxy(request);

		expect(response.status).toBe(307);
		const location = response.headers.get("location")!;
		expect(location).toContain("/?login=true");
		expect(location).toContain("callbackUrl=%2Fsettings");
	});

	it("should redirect unauthenticated users from nested protected routes", () => {
		const request = new NextRequest(new URL("http://localhost:3000/library/manga/123"));
		const response = proxy(request);

		expect(response.status).toBe(307);
		const location = response.headers.get("location")!;
		expect(location).toContain("/?login=true");
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
