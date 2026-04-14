# EventHub — Test Strategy: Booking Scenarios

> Scope: Booking feature — all TC-xxx scenarios touching booking creation, viewing, cancellation, refund eligibility, seat management, FIFO pruning, and cross-user security.  
> Input: `docs/test-scenarios.md`  
> Consumed by: `/generate-tests` skill

---

## Distribution Table

| Layer | Count | Focus | Typical Run Time |
|---|---|---|---|
| **Unit** | 7 | Pure functions with no I/O — pricing, ref generation, seat math, refund logic | < 1 s total |
| **API** | 17 | Backend contracts, HTTP codes, business rules verifiable without UI | < 30 s total |
| **Component** | 6 | Single-component rendering and state transitions, no full page load | < 10 s total |
| **E2E** | 14 | Multi-page journeys that require real browser + full-stack | 2–5 min total |
| **Total** | **44** | | |

> Pyramid shape: Unit (wide base) → API → Component → E2E (narrow top). No ice cream cone.

---

## Layer Assignments

### Unit — Pure Functions

These are arithmetic or deterministic string operations embedded in service/component code. No database, no HTTP. Test them in isolation with Jest.

| TC | Title | Function to test | Source location |
|---|---|---|---|
| TC-110 | Total price = price × quantity | `totalPrice = parseFloat(event.price) * data.quantity` | `bookingService.js:99` |
| TC-101† | Booking ref prefix matches event title first char | `randomRef(eventTitle)` — prefix extraction logic | `bookingService.js:11–17` |
| TC-113† | Per-user availableSeats = DB seats − userBooked | `Math.max(0, event.availableSeats - (booked[id] \|\| 0))` | `eventService.js:13` |
| TC-111† | maxQty caps at min(10, availableSeats) | `Math.min(10, event.availableSeats)` | `events/[id]/page.tsx:81` |
| TC-107† | Refund eligible when quantity = 1 | `quantity === 1 ? 'eligible' : 'ineligible'` | `bookings/[id]/page.tsx:27` |
| TC-108† | Refund ineligible when quantity > 1 | same function, different input | `bookings/[id]/page.tsx:27` |
| TC-114† | Ref uniqueness fallback uses `Date.now().toString(36)` | `generateUniqueRef` after 10 retries | `bookingService.js:21–32` |

> † These TCs are also covered at higher layers for defense-in-depth. Unit tests verify the math is correct in isolation; higher layers confirm the full flow.

---

### API — Backend Contracts & Business Rules

Call the live API with `fetch`/`axios` (or a Playwright `request` context). No browser, no UI rendering. Target `https://eventhub.rahulshettyacademy.com/api`.

| TC | Title | Method + Endpoint | Expected Response | Source enforced in |
|---|---|---|---|---|
| TC-202 | Unauthenticated POST /api/bookings → 401 | `POST /api/bookings` (no token) | 401 Unauthorized | `middleware/auth.js` |
| TC-209 | Cancel another user's booking → 403 | `DELETE /api/bookings/:id` (User B token, User A booking) | 403 Forbidden | `bookingService.js:127–130` |
| TC-313 | Request more tickets than available → 400 | `POST /api/bookings` `quantity > availableSeats` | 400 `InsufficientSeatsError` | `bookingService.js:88–92` |
| TC-105 | Seats decrement after booking | `POST` then `GET /api/events/:id` | `availableSeats` reduced by quantity | `eventRepository.decrementSeats` |
| TC-106 | Seats restore after cancellation | `DELETE /api/bookings/:id` then `GET /api/events/:id` | `availableSeats` restored | `bookingService.js:126–136` |
| TC-103 | FIFO prune — 10th booking deletes oldest | `POST` 9 bookings then 10th | Count stays at 9; oldest gone | `bookingService.js:72–78` |
| TC-403 | FIFO prefers pruning different-event booking | 9 bookings across events A & B; 10th for B | Oldest booking for A pruned first | `bookingService.js:73–74` |
| TC-409 | Same-event FIFO fallback burns a seat | 9 bookings all on event X; 10th for X | `sameEventFallback=true` → `decrementSeats` called | `bookingService.js:94–96` |
| TC-406 | Book exactly remaining seats succeeds | `POST` with `quantity = availableSeats` | 201 Created | `bookingService.js:87` (≥ boundary) |
| TC-401 | Book same event twice — per-user seats used | Book N, book N again | Both succeed; personal available decrements | `eventService.js:withPersonalSeats` |
| TC-113 | Per-user availableSeats in GET /api/events/:id | `GET /api/events/:id` after own booking | `availableSeats = DB − ownBooked` | `eventService.js:44` |
| TC-407 | Free event — totalPrice = 0 | `POST /api/bookings` price=0 event | `totalPrice: 0` in response | `bookingService.js:99` |
| TC-408 | Numeric title first char in bookingRef | Create event "2025 Summit"; book it | `bookingRef` starts with `2-` | `bookingService.js:12` |
| TC-310* | Past eventDate rejected → 400 | `POST /api/events` past date | 400 validation error | `eventValidator.js` |
| TC-311* | Missing required event fields → 400 | `POST /api/events` partial body | 400 with field list | `eventValidator.js` |
| TC-205* | Edit static event → 403 | `PUT /api/events/:staticId` | 403 `Cannot modify a static event` | `eventService.js:76` |
| TC-210 | Invalid JWT → 401 | Any protected endpoint with bad token | 401 Unauthorized | `middleware/auth.js` |

> *TC-310, TC-311, TC-205 are event-creation scenarios included here because they directly gate the booking flow.

---

### Component — UI State Isolation

Render individual React components in isolation (Jest + React Testing Library). No real API calls — mock the data props. These test conditional rendering and state machine transitions.

| TC | Title | Component | What to render/simulate |
|---|---|---|---|
| TC-504 | Sold-out event disables "Sold Out" button | `BookingForm` (`events/[id]/page.tsx:69`) | Pass `event.availableSeats=0`; assert button text "Sold Out" and `disabled` attribute |
| TC-111 | maxQty = min(10, seats) clamps "+" button | `BookingForm` | Pass `availableSeats=3`; click "+" 5×; assert quantity=3 and `+` disabled |
| TC-112 | "−" button disabled at quantity 1 | `BookingForm` | Mount at default; assert `−` disabled; quantity stays 1 |
| TC-507 | Confirmation card renders all booking fields | `BookingConfirmation` (`events/[id]/page.tsx:27`) | Pass mock booking data; assert ref, name, qty, total, both links present |
| TC-107/108 | RefundEligibility state machine: idle → checking → result | `RefundEligibility` (`bookings/[id]/page.tsx:21`) | Click button; assert spinner; fast-forward setTimeout(4000); assert eligible/ineligible result |
| TC-516 | ConfirmDialog renders correct cancellation text | `ConfirmDialog` | Pass `title`, `description` with `bookingRef` + `quantity`; assert text content |

> **Why Component, not E2E for refund eligibility rendering (TC-107/108)?** The eligibility logic is `quantity === 1 ? eligible : ineligible` — a pure state machine in `<RefundEligibility>`. E2E for this pays the cost of login + booking creation just to test a `setTimeout`. With React Testing Library + `jest.useFakeTimers()` you get deterministic, sub-second tests. E2E still covers the full flow (TC-107 E2E) for smoke coverage.

---

### E2E — Multi-Page Journeys

Full browser tests via Playwright against `https://eventhub.rahulshettyacademy.com`. Reserve E2E for flows that cross page boundaries or require real user session state.

| TC | Title | Pages crossed | Priority | Key assertions |
|---|---|---|---|---|
| TC-007 | Book single ticket — full flow | `/events` → `/events/:id` → confirmation | P0 | Ref visible; format `{X}-{6chars}`; total correct |
| TC-008 | Book 3 tickets — multi-ticket flow | `/events` → `/events/:id` → confirmation | P1 | Total = price × 3; confirmation card qty=3 |
| TC-011 | Cancel booking from detail page | `/bookings` → `/bookings/:id` → React dialog → `/bookings` | P0 | Toast "cancelled successfully"; booking gone from list |
| TC-012 | Clear all bookings | `/bookings` → native dialog → empty state | P1 | "No bookings yet" + "Browse Events" link |
| TC-016 | Navigate to bookings via confirmation link | `/events/:id` → confirmation → `/bookings` | P1 | New booking card visible in list |
| TC-101 | Booking ref prefix matches event title | `/events` → `/events/:id` → confirmation | P0 | `bookingRef[0] === eventTitle[0].toUpperCase()` |
| TC-107 | Single-ticket refund eligible (with spinner) | `/bookings/:id` | P0 | Spinner visible; after ≥4s green "Eligible" result |
| TC-108 | Multi-ticket refund ineligible | `/bookings/:id` | P0 | Red "Not eligible" with correct quantity in message |
| TC-201 | Cross-user booking access denied | `/bookings/:userA_id` (User B session) | P0 | "Access Denied" empty state shown |
| TC-203 | Unauthenticated `/bookings` blocked | `/bookings` (no session) | P0 | Redirect to `/login` or auth error state |
| TC-312 | Sold-out event shows disabled button | `/events/:id` (0 seats) | P0 | Button text "Sold Out"; confirm button `disabled` |
| TC-314 | Non-existent booking → empty state | `/bookings/999999` | P1 | "Booking not found" empty state + back link |
| TC-503 | Empty bookings page | `/bookings` (zero bookings) | P1 | "No bookings yet" + "Browse Events" link |
| TC-109 | Refund spinner timing | `/bookings/:id` | P1 | `#refund-spinner` visible immediately after click; `#refund-result` appears after delay |

---

## Rationale for Contested Assignments

### TC-107 / TC-108 (Refund Eligibility) — Component + E2E, not only E2E

The original suggestion was E2E-only. The business logic (`quantity === 1`) lives entirely in `<RefundEligibility>` (`bookings/[id]/page.tsx:21–70`) — there is no backend API involved. Testing at E2E means waiting a real 4 seconds per test. Component tests use `jest.useFakeTimers()` to advance the clock instantly, running the same assertions in < 50 ms. Both layers are kept: Component for logic correctness, E2E for integration smoke.

### TC-103 / TC-403 / TC-409 (FIFO Pruning) — API, not E2E

These require creating 9–10 bookings to trigger the pruning boundary. At E2E this means 9 full form-fill → submit cycles. At API layer you batch-POST 9 bookings in the setup request, then assert on the 10th — total setup time drops from ~3 min to ~2 s. The FIFO logic lives purely in `bookingService.js:68–78`; no UI is involved.

### TC-313 (Insufficient Seats) — API, not E2E

The error `InsufficientSeatsError` is thrown at `bookingService.js:89–92` and mapped to HTTP 400 by `errorHandler.js`. Testing this at E2E would require manufacturing an event with very few seats and racing a second booking — fragile and slow. A direct `POST /api/bookings` with a controlled `quantity` exceeding `availableSeats` is deterministic and tests the exact enforcement point.

### TC-304 / TC-307 / TC-308 / TC-309 (Client-Side Validation) — Component preferred over E2E

These validate regex/length rules coded in `register/page.tsx:33–38` and `events/[id]/page.tsx:88–95`. The error messages are set synchronously before any API call. E2E tests work, but they're slow and test the wrong layer. A component render with controlled inputs and a submit event catches the same defects in < 10 ms.

> Note: The existing `booking-management.spec.js` tests DO NOT cover these — so Component tests here are additive, not redundant.

### TC-201 (Cross-User Access) — E2E retained

Although the 403 check occurs in `bookingService.js:57`, validating the full "Access Denied" UX (empty state, correct title, back link) requires the browser render path. Keeping one E2E test here validates the complete frontend error-handling chain. The raw HTTP 403 is separately covered by TC-209 at the API layer.

---

## Anti-Patterns Found in Existing Tests (`booking-management.spec.js`)

| Anti-Pattern | Location | Impact | Recommendation |
|---|---|---|---|
| **CSS class selectors** instead of data-testid | `page.locator('.booking-ref')`, `page.locator('.confirm-booking-btn')` | Fragile — breaks on CSS refactor | Switch to `getByTestId('booking-ref')` per Playwright best practices |
| **ID selectors** mixed with role selectors | `page.locator('#customer-email')`, `page.locator('#confirm-dialog-yes')` | Medium fragility | Prefer `getByTestId` or `getByRole` for consistency |
| **No explicit helper teardown retry** | `clearBookings` catches `isVisible()` but doesn't verify final state after each test | If a test fails mid-run, next test starts dirty | Add `test.afterEach` hook calling `clearBookings(page)` |
| **Validation errors tested at E2E** | Not present in existing tests, but suggested layer in scenarios TC-307/308/309 is E2E | Slow, brittle | Push form validation to Component layer (see above) |
| **`console.log` in test helpers** | `bookEvent()` and `clearBookings()` log to stdout | Noisy CI output | Remove or replace with Playwright step annotations (`test.step`) |

---

## Defense-in-Depth: Critical Rules Tested at Multiple Layers

| Business Rule | Unit | API | E2E |
|---|---|---|---|
| `totalPrice = price × quantity` | TC-110 | TC-407 (price=0 case) | TC-007, TC-008 |
| Booking ref prefix = event title[0] | TC-101 (unit) | TC-408 (digit prefix) | TC-101 (E2E) |
| Seats available per user | TC-113 (unit) | TC-105, TC-106, TC-401 | TC-007 (seat count visible) |
| Seat boundary enforcement | TC-111 (unit) | TC-313, TC-406 | TC-312 (sold-out UI) |
| Cross-user isolation | — | TC-209 | TC-201 |
| Refund eligibility logic | TC-107/108 (unit) | — | TC-107/108 (E2E) |
