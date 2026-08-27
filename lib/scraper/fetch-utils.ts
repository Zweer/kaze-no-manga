/**
 * Resilient fetch utilities — timeout, retry with backoff, safe JSON parsing.
 */

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1_000;

export async function fetchWithTimeout(
	url: string,
	opts?: RequestInit,
	timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(url, { ...opts, signal: controller.signal });
	} catch (error: unknown) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
		}
		throw error;
	} finally {
		clearTimeout(timer);
	}
}

export interface RetryOptions {
	maxRetries?: number;
	timeoutMs?: number;
	baseDelayMs?: number;
}

export async function fetchWithRetry(
	url: string,
	opts?: RequestInit,
	{
		maxRetries = DEFAULT_MAX_RETRIES,
		timeoutMs = DEFAULT_TIMEOUT_MS,
		baseDelayMs = DEFAULT_BASE_DELAY_MS,
	}: RetryOptions = {},
): Promise<Response> {
	let lastError: unknown;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetchWithTimeout(url, opts, timeoutMs);
			if (response.ok || (response.status >= 400 && response.status < 500)) {
				return response;
			}
			lastError = new Error(`Server error ${response.status} on attempt ${attempt + 1}: ${url}`);
		} catch (error: unknown) {
			lastError = error;
		}

		if (attempt < maxRetries) {
			await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
		}
	}

	throw lastError;
}

export async function safeJson<T>(response: Response): Promise<T> {
	const text = await response.text();
	try {
		return JSON.parse(text) as T;
	} catch {
		const preview = text.slice(0, 200);
		throw new Error(
			`Failed to parse JSON from ${response.url} (status ${response.status}): ${preview}`,
		);
	}
}
