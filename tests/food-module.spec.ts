import { test, expect } from "@playwright/test";

const TEST_FOOD_SLUG = "classic-burger";
const APP_URL = "http://localhost:3000";

test.describe("Food Details Module - Authenticated Review CRUD", () => {
  // Clear the global storageState so we start unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  // Use a unique email for every test run to avoid conflicts
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "Password123!";

  test.beforeEach(async ({ page }) => {
    // 1. Sign up a new test user
    await page.goto(`${APP_URL}/auth/signup`);
    await page.getByPlaceholder("Mojahed Mohammed").fill("Automated Tester");
    await page.getByPlaceholder("mojahed@example.com").fill(testEmail);
    await page.getByPlaceholder("••••••••").first().fill(testPassword);
    await page.getByPlaceholder("••••••••").nth(1).fill(testPassword);
    await page.locator('form button[type="submit"]').click();

    // 2. Wait for redirect to signin page, then sign in
    await page.waitForURL(/.*\/auth\/signin.*/);
    await page.getByPlaceholder("mojahed@example.com").fill(testEmail);
    await page.getByPlaceholder("••••••••").fill(testPassword);
    await page.locator('form button[type="submit"]').click();

    // 3. Wait for redirect to homepage (or similar), then navigate to the test food page
    await page.waitForURL(APP_URL + "/");
    await page.goto(`${APP_URL}/food/${TEST_FOOD_SLUG}`);
  });

  test("Full Review Lifecycle: Create, Update, Complex Reactions, and Delete", async ({
    page,
  }) => {
    const testComment = `Amazing food! Automated test: ${Date.now()}`;
    const updatedComment = `Actually, it was spectacular! Automated test: ${Date.now()}`;

    // ==========================================
    // 1. CREATE REVIEW
    // ==========================================
    await test.step("Create a new review", async () => {
      await page.getByRole("button", { name: /Write a Review/i }).click();
      const starButtons = page.locator("form button:has(svg.lucide-star)");
      await starButtons.nth(4).click();
      await page
        .getByPlaceholder(/Share detail of your experience/i)
        .fill(testComment);
      await page.getByRole("button", { name: /Submit Review/i }).click();

      const newReview = page.getByText(testComment);
      await expect(newReview).toBeVisible({ timeout: 5000 });
    });

    // ==========================================
    // 2. EDIT REVIEW
    // ==========================================
    await test.step("Edit the existing review", async () => {
      const reviewCard = page.locator(".space-y-4 > div", {
        hasText: testComment,
      });
      await reviewCard.locator("button:has(svg.lucide-square-pen)").click();

      const textbox = page.getByPlaceholder(/Share detail of your experience/i);
      await textbox.fill(updatedComment);
      await page.getByRole("button", { name: /Submit Review/i }).click();

      await expect(page.getByText(updatedComment)).toBeVisible();
    });

    // ==========================================
    // 3. COMPLEX REACTION TOGGLING
    // ==========================================
    await test.step("Deep test of Reaction States (Toggle Up, Down, Off)", async () => {
      const reviewCard = page.locator(".space-y-4 > div", {
        hasText: updatedComment,
      });
      const likeButton = reviewCard.locator("button:has(svg.lucide-thumbs-up)");
      const dislikeButton = reviewCard.locator(
        "button:has(svg.lucide-thumbs-down)",
      );

      // Get base line metrics
      const initialLikes = parseInt((await likeButton.innerText()) || "0", 10);
      const initialDislikes = parseInt(
        (await dislikeButton.innerText()) || "0",
        10,
      );

      // ACTION A: Toggle UP (Like)
      await likeButton.click();
      // Validation A: Likes should increment by 1. Dislikes should stay the same.
      await expect(likeButton).toHaveText((initialLikes + 1).toString());
      await expect(dislikeButton).toHaveText(initialDislikes.toString());
      // Validate UI styling (e.g. background color active)
      await expect(likeButton).toHaveClass(/bg-primary\/10/);

      // ACTION B: Toggle DOWN (Switch to Dislike)
      await dislikeButton.click();
      // Validation B: Likes should drop back down. Dislikes should increment by 1.
      await expect(likeButton).toHaveText(initialLikes.toString());
      await expect(dislikeButton).toHaveText((initialDislikes + 1).toString());
      // Validate UI styling shift
      await expect(likeButton).not.toHaveClass(/bg-primary\/10/);
      await expect(dislikeButton).toHaveClass(/bg-destructive\/10/);

      // ACTION C: Toggle OFF (Click Dislike again to clear)
      await dislikeButton.click();
      // Validation C: Both metrics should return exactly to their baseline!
      await expect(likeButton).toHaveText(initialLikes.toString());
      await expect(dislikeButton).toHaveText(initialDislikes.toString());
      // Validate UI styling cleared
      await expect(dislikeButton).not.toHaveClass(/bg-destructive\/10/);
    });

    // ==========================================
    // 4. DELETE REVIEW
    // ==========================================
    await test.step("Delete the review", async () => {
      const reviewCard = page.locator(".space-y-4 > div", {
        hasText: updatedComment,
      });
      await reviewCard.locator("button:has(svg.lucide-trash-2)").click();
      await expect(
        page.getByText(/Review deleted successfully/i),
      ).toBeVisible();
      await expect(reviewCard).not.toBeVisible();
    });
  });
});
