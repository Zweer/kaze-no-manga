import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, fetchWithRetry, safeJson } from "./fetch-utils";

const mockFetch = vi.fn();

beforeEach(() => {
	vi.stubGlobal("fetch", mockFetch);
	mockFetch.mockClear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

function mockResponse(body: string, ok = true, status = 200, url = "https://test.com") {
	return {
		ok,
		status,
		url,
		text: () => Promise.resolve(body),
	};
}

describe("fetchWithTimeout", () => {
	it("should return response on success", async () => {
		mockFetch.mockResolvedValueOnce(mockResponse("ok"));
		const res = await fetchWithTimeout("https://test.com");
		expect(res.ok).toBe(true);
	});

	it("should throw on timeout", async () => {
		mockFetch.mockImplementationOnce((_url: string, opts: RequestInit) => {
			return new Promise((_resolve, reject) => {
				opts.signal?.addEventListener("abort", () => {
					reject(new DOMException("The operation was aborted.", "AbortError"));
				});
			});
		});
		await expect(fetchWithTimeout("https://test.com", undefined, 50)).rejects.toThrow(
			"timed out",
		);
	}, 10000);
});

describe("fetchWithRetry", () => {
	it("should return on first success", async () => {
		mockFetch.mockResolvedValueOnce(mockResponse("ok"));
		const res = await fetchWithRetry("https://test.com");
		expect(res.ok).toBe(true);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("should not retry on 4xx errors", async () => {
		mockFetch.mockResolvedValue(mockResponse("not found", false, 404));
		const res = await fetchWithRetry("https://test.com", undefined, {
			maxRetries: 3,
			baseDelayMs: 1,
		});
		expect(res.status).toBe(404);
		expect(mockFetch).toHaveBeenCalledTimes(1);
	});

	it("should retry on 5xx errors", async () => {
		mockFetch
			.mockResolvedValueOnce(mockResponse("error", false, 500))
			.mockResolvedValueOnce(mockResponse("ok", true, 200));

		const res = await fetchWithRetry("https://test.com", undefined, {
			maxRetries: 3,
			baseDelayMs: 1,
		});
		expect(res.ok).toBe(true);
		expect(mockFetch).toHaveBeenCalledTimes(2);
	});

	it("should throw after max retries on 5xx", async () => {
		mockFetch.mockResolvedValue(mockResponse("error", false, 500));

		await expect(
			fetchWithRetry("https://test.com", undefined, {
				maxRetries: 2,
				baseDelayMs: 1,
			}),
		).rejects.toThrow("Server error 500");
	});
});

describe("safeJson", () => {
	it("should parse valid JSON", async () => {
		const response = mockResponse('{"name":"test"}') as unknown as Response;
		const data = await safeJson<{ name: string }>(response);
		expect(data.name).toBe("test");
	});

	it("should throw on invalid JSON with preview", async () => {
		const response = mockResponse("<html>Error</html>") as unknown as Response;
		await expect(safeJson(response)).rejects.toThrow("Failed to parse JSON");
	});
});
