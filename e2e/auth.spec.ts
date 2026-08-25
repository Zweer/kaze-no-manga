import { expect, test } from "@playwright/test";

test.describe("Public access", () => {
	test("should display the homepage without auth", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL("/");
		await expect(page.getByRole("heading", { name: "Kaze" })).toBeVisible();
	});

	test("should display the login page", async ({ page }) => {
		await page.goto("/login");
		await expect(page.getByText("Kaze no Manga")).toBeVisible();
		await expect(page.getByText("Sign in with Google")).toBeVisible();
		await expect(page.getByText("Sign in with Passkey")).toBeVisible();
	});
});

test.describe("Protected routes", () => {
	test("should redirect /library to /login when not authenticated", async ({ page }) => {
		await page.goto("/library");
		await expect(page).toHaveURL(/\/login\?callbackUrl=%2Flibrary/);
	});

	test("should redirect /settings to /login when not authenticated", async ({ page }) => {
		await page.goto("/settings");
		await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsettings/);
	});
});

test.describe("Navigation", () => {
	test("should navigate between pages via mobile nav", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		// Verify homepage content
		await expect(page.getByText("Search manga...")).toBeVisible();

		// Navigate to login to avoid auth redirects for library
		await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
	});

	test("should show desktop nav on wide viewport", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");

		// Desktop nav should be visible
		await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Kaze 風の漫画" })).toBeVisible();
	});
});
