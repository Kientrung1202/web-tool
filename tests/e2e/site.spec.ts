import { expect, test } from "@playwright/test";

test("English directory shows active and coming soon tools", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: "Free PDF Tools" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Merge PDF Files/i })).toBeVisible();
  await expect(page.getByText("Coming soon").first()).toBeVisible();
});

test("Vietnamese merge route renders Vietnamese copy", async ({ page }) => {
  await page.goto("/vi/merge-pdf");
  await expect(page.getByRole("heading", { name: "Ghép file PDF" })).toBeVisible();
});

test("Privacy page explains browser processing", async ({ page }) => {
  await page.goto("/en/privacy");
  await expect(page.getByText(/processed locally in your browser/i)).toBeVisible();
});

test("merge page keeps the simple no-preview file flow", async ({ page }) => {
  await page.goto("/en/merge-pdf");
  await expect(page.getByText("Files stay in your browser")).toBeVisible();
  await expect(page.getByText(/Choose PDF files/i)).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("coming soon tool page is disabled", async ({ page }) => {
  await page.goto("/en/compress-pdf");
  await expect(page.getByText("Coming soon")).toBeVisible();
  await expect(page.getByRole("button", { name: /choose/i })).toHaveCount(0);
});
