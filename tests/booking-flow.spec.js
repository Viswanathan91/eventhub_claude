// tests/booking-flow.spec.js
// E2E tests: TC-007 (single ticket), TC-008 (3 tickets), TC-011 (cancel from detail)

import { test, expect } from '@playwright/test';

const USER_EMAIL = 'rahulshetty1@gmail.com';
const USER_PASSWORD = 'Magiclife1!';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function login(page) {
  await page.goto('/login');
  await page.getByPlaceholder('you@email.com').fill(USER_EMAIL);
  await page.getByLabel('Password').fill(USER_PASSWORD); // FIX: Priority 3 label over Priority 4 ID
  await page.locator('#login-btn').click();
  // logout-btn appears in the navbar only when user is authenticated.
  // Hosted server can be slow on cold start — allow 15s.
  await expect(page.getByTestId('logout-btn')).toBeVisible({ timeout: 15000 });
}

async function clearBookings(page) {
  await page.goto('/bookings');
  await page.waitForLoadState('networkidle');
  const bookingCards = page.getByTestId('booking-card');
  const count = await bookingCards.count();
  if (count > 0) {
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Clear all bookings' }).click();
    await expect(page.getByText('No bookings yet')).toBeVisible({ timeout: 5000 });
  }
}

// Books the first available event and returns the booking reference string.
// Used by tests that need an existing booking as setup (e.g. TC-011 cancel flow).
async function bookFirstEvent(page, { name = 'Test User', email = 'test@example.com' } = {}) {
  await page.goto('/events');
  await page.getByTestId('event-card').first().getByTestId('book-now-btn').click();
  await expect(page).toHaveURL(/\/events\/\d+/);
  await page.getByLabel('Full Name').fill(name);
  await page.getByTestId('customer-email').fill(email); // FIX: data-testid over #id
  await page.getByPlaceholder('+91 98765 43210').fill('9876543210');
  await page.locator('.confirm-booking-btn').click();
  await expect(page.getByText('Booking Confirmed!')).toBeVisible(); // FIX: guard assertion
  await expect(page.locator('.booking-ref')).toBeVisible();
  const bookingRef = (await page.locator('.booking-ref').textContent()).trim();
  console.log(`Booked event. Ref: ${bookingRef}`);
  return bookingRef;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe('Booking Flow', () => {
  test.afterEach(async ({ page }) => {
    await clearBookings(page);
  });

  // TC-007 ─────────────────────────────────────────────────────────────────────
  test('TC-007: book a single ticket — full flow with booking ref format validation', async ({ page }) => {
    // -- Step 1: Login --
    await login(page);

    // -- Step 2: Navigate to events and capture first event title --
    await page.goto('/events');
    const firstCard = page.getByTestId('event-card').first();
    const eventTitle = (await firstCard.locator('h3').textContent()).trim();
    console.log(`Booking event: "${eventTitle}"`);

    // -- Step 3: Open event detail page --
    await firstCard.getByTestId('book-now-btn').click();
    await expect(page).toHaveURL(/\/events\/\d+/);

    // -- Step 4: Default quantity is 1 --
    await expect(page.locator('#ticket-count')).toHaveText('1');

    // -- Step 5: Capture price per ticket from booking panel --
    // TODO: request data-testid="price-per-ticket" from dev — CSS classes are fragile
    const priceText = (await page.locator('span.text-2xl.font-bold.text-indigo-700').textContent()).trim();
    const pricePerTicket = parseFloat(priceText.replace(/[$,]/g, ''));
    console.log(`Price per ticket: ${priceText}`);

    // -- Step 6: Fill booking form --
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByTestId('customer-email').fill('testuser@example.com'); // FIX: data-testid over #id
    await page.getByPlaceholder('+91 98765 43210').fill('9876543210');

    // -- Step 7: Submit booking --
    await page.locator('.confirm-booking-btn').click();

    // -- Step 8: Booking confirmation card is shown --
    await expect(page.getByText('Booking Confirmed!')).toBeVisible();
    await expect(page.locator('.booking-ref')).toBeVisible();
    const bookingRef = (await page.locator('.booking-ref').textContent()).trim();
    console.log(`Booking ref: ${bookingRef}`);

    // -- Step 9: Booking ref format must be {CHAR}-{6_ALPHANUMERIC} --
    expect(bookingRef).toMatch(/^[A-Z0-9]-[A-Z0-9]{6}$/);

    // -- Step 10: Ref first character matches event title first character --
    expect(bookingRef[0]).toBe(eventTitle[0].toUpperCase());

    // -- Step 11: Confirmation card shows Tickets = 1 (single ticket) --
    // FIX: added for consistency with TC-008's qty=3 assertion
    // TODO: request data-testid="confirmation-row-tickets" from dev to avoid CSS chain
    const ticketsRow = page.locator('span.text-gray-500', { hasText: 'Tickets' }).locator('..');
    await expect(ticketsRow.locator('span.font-medium')).toHaveText('1');

    // -- Step 12: Total in confirmation = price × 1 (single ticket) --
    // TODO: request data-testid="confirmation-row-total" from dev to avoid CSS chain
    const totalRow = page.locator('span.text-gray-500', { hasText: 'Total' }).locator('..');
    const totalText = (await totalRow.locator('span.font-medium').textContent()).trim();
    const actualTotal = parseFloat(totalText.replace(/[$,]/g, ''));
    expect(actualTotal).toBe(pricePerTicket);

    // -- Step 13: "View My Bookings" link is present on confirmation --
    await expect(page.getByRole('link', { name: 'View My Bookings' })).toBeVisible();
  });

  // TC-008 ─────────────────────────────────────────────────────────────────────
  test('TC-008: book 3 tickets — quantity and total price validated on confirmation', async ({ page }) => {
    // -- Step 1: Login --
    await login(page);

    // -- Step 2: Open first event detail page --
    await page.goto('/events');
    await page.getByTestId('event-card').first().getByTestId('book-now-btn').click();
    await expect(page).toHaveURL(/\/events\/\d+/);

    // -- Step 3: Increase quantity to 3 using + button --
    // FIX: getByRole (Priority 2) over locator('button', { hasText }) combo
    const incrementBtn = page.getByRole('button', { name: '+' });
    await incrementBtn.click(); // 1 → 2
    await incrementBtn.click(); // 2 → 3
    await expect(page.locator('#ticket-count')).toHaveText('3');

    // -- Step 4: Capture expected total from the price summary box --
    // The total value is in span.text-indigo-700 inside the summary box.
    // TODO: request data-testid="price-summary" from dev to avoid CSS class selector
    const priceSummaryBox = page.locator('.bg-indigo-50.rounded-xl').first();
    const expectedTotal = (await priceSummaryBox.locator('span.text-indigo-700').textContent()).trim();
    console.log(`Expected total (price × 3): ${expectedTotal}`);

    // -- Step 5: Fill booking form --
    await page.getByLabel('Full Name').fill('Multi Ticket User');
    await page.getByTestId('customer-email').fill('multi@example.com'); // FIX: data-testid over #id
    await page.getByPlaceholder('+91 98765 43210').fill('9876543210');

    // -- Step 6: Submit booking --
    await page.locator('.confirm-booking-btn').click();

    // -- Step 7: Booking confirmation card is shown --
    await expect(page.getByText('Booking Confirmed!')).toBeVisible();
    await expect(page.locator('.booking-ref')).toBeVisible();
    const bookingRef = (await page.locator('.booking-ref').textContent()).trim();
    console.log(`3-ticket booking ref: ${bookingRef}`);

    // -- Step 8: Confirmation card shows Tickets = 3 --
    // TODO: request data-testid="confirmation-row-tickets" from dev to avoid CSS chain
    const ticketsRow = page.locator('span.text-gray-500', { hasText: 'Tickets' }).locator('..');
    await expect(ticketsRow.locator('span.font-medium')).toHaveText('3');

    // -- Step 9: Confirmation card Total = expected total (price × 3) --
    // TODO: request data-testid="confirmation-row-total" from dev to avoid CSS chain
    const totalRow = page.locator('span.text-gray-500', { hasText: 'Total' }).locator('..');
    await expect(totalRow.locator('span.font-medium')).toHaveText(expectedTotal);
  });

  // TC-011 ─────────────────────────────────────────────────────────────────────
  test('TC-011: cancel a booking from detail page — toast shown and booking removed from list', async ({ page }) => {
    // -- Step 1: Login and create a booking to cancel --
    // FIX: setup extracted to bookFirstEvent() helper — removes duplication from TC-011
    await login(page);
    const bookingRef = await bookFirstEvent(page, {
      name: 'Cancel Test User',
      email: 'cancel@example.com',
    });
    console.log(`Created booking to cancel: ${bookingRef}`);

    // -- Step 2: Navigate to My Bookings via confirmation link --
    await page.getByRole('link', { name: 'View My Bookings' }).click();
    await expect(page).toHaveURL(/\/bookings$/);

    // -- Step 3: Find the booking card and navigate to its detail page --
    const bookingCard = page.getByTestId('booking-card').filter({ hasText: bookingRef });
    await expect(bookingCard).toBeVisible();
    await bookingCard.getByRole('link', { name: 'View Details' }).click();
    await expect(page).toHaveURL(/\/bookings\/\d+/);

    // -- Step 4: Click Cancel Booking on the detail page --
    await page.getByRole('button', { name: 'Cancel Booking' }).click();

    // -- Step 5: ConfirmDialog opens — click "Yes, cancel it" --
    await expect(page.getByTestId('confirm-dialog-yes')).toBeVisible();
    await page.getByTestId('confirm-dialog-yes').click();

    // -- Step 6: Success toast is shown --
    await expect(page.getByText('Booking cancelled successfully')).toBeVisible();

    // -- Step 7: Automatically redirected back to /bookings --
    await expect(page).toHaveURL(/\/bookings$/);

    // -- Step 8: Cancelled booking no longer appears in the list --
    await expect(
      page.getByTestId('booking-card').filter({ hasText: bookingRef })
    ).not.toBeVisible();
  });
});
