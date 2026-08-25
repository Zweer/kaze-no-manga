import { expect, test } from "@playwright/test";

test.describe("Search", () => {
	test("should show empty state with watermark when no query", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByPlaceholder("Search manga...")).toBeVisible();
		await expect(page.getByText("Search for your next journey")).toBeVisible();
	});

	test("should show results when searching", async ({ page }) => {
		await page.goto("/");
		await page.getByPlaceholder("Search manga...").fill("solo");
		await expect(page.getByText("Solo Leveling")).toBeVisible();
	});

	test("should show no results message for unknown query", async ({ page }) => {
		await page.goto("/");
		await page.getByPlaceholder("Search manga...").fill("xyznonexistent");
		await expect(page.getByText("No results found")).toBeVisible();
	});

	test("should navigate to manga detail from search results", async ({ page }) => {
		await page.goto("/");
		await page.getByPlaceholder("Search manga...").fill("tower");
		const card = page.getByRole("link", { name: /Tower of God/ });
		await expect(card).toBeVisible();
		await card.click();
		await expect(page).toHaveURL(/\/manga\/omegascans\/tower-of-god/);
	});
});

test.describe("Manga Detail", () => {
	test("should display manga info and chapters", async ({ page }) => {
		await page.goto("/manga/omegascans/solo-leveling");
		await expect(page.getByRole("heading", { name: "Solo Leveling" })).toBeVisible();
		await expect(page.getByText("Action")).toBeVisible();
		await expect(page.getByText("Chapters (20)")).toBeVisible();
		await expect(page.getByText("Add to Library")).toBeVisible();
	});

	test("should navigate to reader from chapter list", async ({ page }) => {
		await page.goto("/manga/omegascans/solo-leveling");
		await page
			.getByRole("link", { name: /Chapter 1\b/ })
			.first()
			.click();
		await expect(page).toHaveURL(/\/read\/omegascans\/solo-leveling\//);
	});
});

test.describe("Reader", () => {
	test("should display chapter pages", async ({ page }) => {
		await page.goto("/read/omegascans/solo-leveling/1");
		await expect(page.getByText("Chapter 1")).toBeVisible();
		await expect(page.getByText("Page 1")).toBeVisible();
	});

	test("should have prev/next chapter navigation", async ({ page }) => {
		await page.goto("/read/omegascans/solo-leveling/5");
		await expect(page.getByText("Prev")).toBeVisible();
		await expect(page.getByText("Next")).toBeVisible();
	});

	test("should navigate back to manga detail", async ({ page }) => {
		await page.goto("/read/omegascans/solo-leveling/1");
		await page.getByRole("button", { name: "Back" }).click();
		await expect(page).toHaveURL(/\/manga\/omegascans\/solo-leveling/);
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
		await expect(page.getByRole("link", { name: "Kaze 風の漫画" })).toBeVisible();
	});
});
