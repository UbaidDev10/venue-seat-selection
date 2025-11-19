import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page
    .getByRole("button", { name: "Seat A-1-01, Section A, Row 1" })
    .click();
  await page.getByRole("button", { name: "Select This Seat" }).click();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page
    .getByRole("button", { name: "Seat A-2-02, Section A, Row 2" })
    .click();
  await page.getByRole("switch").click();
  await page.getByRole("switch").click();
  await page.getByRole("textbox", { name: "e.g., A-1-" }).click();
  await page.getByRole("textbox", { name: "e.g., A-1-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "e.g., A-1-" }).fill("A-2-05");
  await page.getByRole("textbox", { name: "e.g., A-1-" }).press("Enter");
  await page
    .getByRole("textbox", { name: "Seat A-2-05, Section A, Row 2" })
    .click();
  await page.getByRole("textbox", { name: "e.g., A-1-" }).press("ArrowLeft");
  await page.getByRole("textbox", { name: "e.g., A-1-" }).press("ArrowRight");
  await page
    .getByRole("button", { name: "Seat A-2-06, Section A, Row 2" })
    .press("ArrowRight");
  await page
    .getByRole("button", { name: "Seat A-2-06, Section A, Row 2" })
    .press("ArrowDown");
  await page.getByRole("button", { name: "Select This Seat" }).click();
});
