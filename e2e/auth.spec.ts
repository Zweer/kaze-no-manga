import { test, expect } from "@playwright/test";

test.describe("Public access", () => {
	test("should display the homepage without auth", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveURL("/");
		await expect(page.getByRole("heading", { name: "Kaze" })).toBeVisible();
	});

	test("should show search placeholder on homepage", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("Search manga...")).toBeVisible();
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

	test("should show login dialog when redirected", async ({ page }) => {
		await page.goto("/?login=true&callbackUrl=/library");
		await expect(page.getByText("Sign in with Google")).toBeVisible();
		await expect(page.getByText("Sign in with Passkey")).toBeVisible();
	});
});

test.describe("Navigation", () => {
	test("should navigate between pages via mobile nav", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		await expect(page.getByText("Search manga...")).toBeVisible();
		await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
	});

	test("should show desktop nav on wide viewport", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");

		await expect(page.getByRole("link", { name: "Search" })).toBeVisible();
		await expect(page.getByRole("link", { name: "Kaze 風の漫画" })).toBeVisible();
	});
});
