import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { mockLibrary } from "@/lib/mock";

export function GET(request: NextRequest): NextResponse {
	const status = request.nextUrl.searchParams.get("status");

	if (status) {
		const filtered = mockLibrary.filter((entry) => entry.status === status);
		return NextResponse.json(filtered);
	}

	return NextResponse.json(mockLibrary);
}
