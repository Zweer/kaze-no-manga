import { expect, test } from "@playwright/test";

test.describe("Search", () => {
	test("should show empty state with watermark when no query", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByPlaceholder("Search manga...")).toBeVisible();
		await expect(page.getByText("Search for your next journey")).toBeVisible();
	});

	test("should show results when searching", async ({ page }) => {
		await page.goto("/");
		await page.getByPlaceholder("Search manga...").fill("the");
		// Wait for any manga link to appear
		await expect(page.locator("a[href^='/manga/']").first()).toBeVisible({
			timeout: 15000,
		});
	});

	test("should show no results message for unknown query", async ({ page }) => {
		await page.goto("/");
		await page.getByPlaceholder("Search manga...").fill("xyznonexistent99999");
		await expect(page.getByText("No results found")).toBeVisible({ timeout: 15000 });
	});
});

test.describe("Manga Detail", () => {
	test("should navigate from search to manga detail", async ({ page }) => {
		await page.goto("/");
		await page.getByPlaceholder("Search manga...").fill("love");
		const firstResult = page.locator("a[href^='/manga/']").first();
		await expect(firstResult).toBeVisible({ timeout: 15000 });
		await firstResult.click();

		await expect(page).toHaveURL(/\/manga\/omegascans\//);
		await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText("Chapters")).toBeVisible({ timeout: 20000 });
	});

	test("should show error for non-existent manga", async ({ page }) => {
		await page.goto("/manga/omegascans/this-manga-does-not-exist-xyz");
		await expect(page.getByText(/not found|failed/i)).toBeVisible({ timeout: 10000 });
	});
});

test.describe("Reader", () => {
	test("should load chapter images from API", async ({ page }) => {
		await page.goto("/read/omegascans/my-illustrator/chapter-1");
		await expect(page.locator("img").first()).toBeVisible({ timeout: 15000 });
		await expect(page.getByText("pages")).toBeVisible();
	});
});

test.describe("Protected routes", () => {
	test("should redirect /library to homepage with login dialog", async ({ page }) => {
		await page.goto("/library");
		await expect(page).toHaveURL(/\/\?login=true&callbackUrl=%2Flibrary/);
	});

	test("should redirect /settings to homepage with login dialog", async ({ page }) => {
		await page.goto("/settings");
		await expect(page).toHaveURL(/\/\?login=true&callbackUrl=%2Fsettings/);
	});

	test("should show login dialog with sign-in buttons", async ({ page }) => {
		await page.goto("/?login=true&callbackUrl=/library");
		await expect(page.getByText("Sign in with Google")).toBeVisible();
		await expect(page.getByText("Sign in with Passkey")).toBeVisible();
	});
});

test.describe("Navigation", () => {
	test("should show mobile nav on small viewport", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Library" })).toBeVisible();
	});

	test("should show desktop nav on wide viewport", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");
		await expect(page.getByRole("link", { name: "Kaze no Manga" })).toBeVisible();
	});
});
