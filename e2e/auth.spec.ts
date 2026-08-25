import { test, expect } from "@playwright/test";

test.describe("Public access", () => {
	test("should display the homepage without auth", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL("/");
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
