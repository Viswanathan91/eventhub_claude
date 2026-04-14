# EventHub — Test Scenarios

> Generated from domain knowledge, business rules, UI flows, and backend service analysis.  
> Consumed by `/test-strategy` to assign scenarios to the optimal test pyramid layer.

---

## Happy Path (TC-001 – TC-099)

### TC-001: Register a new user account
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: User has no existing account  
**Steps**:
1. Navigate to `/register`
2. Enter a unique email (e.g. `newuser@test.com`)
3. Enter a strong password (`Test@1234`)
4. Enter same password in Confirm Password field
5. Click "Create Account"
**Expected Results**: JWT issued, user redirected to home page  
**Business Rule**: Successful registration issues a 7-day JWT token  
**Suggested Layer**: E2E

---

### TC-002: Login with valid credentials
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: User account exists  
**Steps**:
1. Navigate to `/login`
2. Enter valid email
3. Enter valid password
4. Click "Sign In"
**Expected Results**: User redirected to home page; "Browse Events →" link visible  
**Business Rule**: Valid credentials return JWT + user object  
**Suggested Layer**: E2E

---

### TC-003: Browse events listing
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: Logged in; at least 1 event seeded  
**Steps**:
1. Navigate to `/events`
**Expected Results**: Event cards visible; each shows title, category badge, city, date, price, available seats, and "Book Now" button  
**Business Rule**: GET /api/events returns paginated events  
**Suggested Layer**: E2E

---

### TC-004: Filter events by category
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in; multiple categories seeded  
**Steps**:
1. Navigate to `/events`
2. Select "Conference" from category dropdown
**Expected Results**: Only "Conference" events shown; other categories hidden  
**Business Rule**: `?category=Conference` filter applied server-side  
**Suggested Layer**: E2E

---

### TC-005: Filter events by city
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in; multiple cities seeded  
**Steps**:
1. Navigate to `/events`
2. Select "Bangalore" from city dropdown
**Expected Results**: Only Bangalore events displayed  
**Business Rule**: `?city=Bangalore` filter applied server-side  
**Suggested Layer**: E2E

---

### TC-006: Search events by keyword
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in  
**Steps**:
1. Navigate to `/events`
2. Type "Tech" in the search input
**Expected Results**: Only events whose title, description, or venue contains "Tech" are shown  
**Business Rule**: Full-text search on title, description, venue  
**Suggested Layer**: E2E

---

### TC-007: Book an event with a single ticket
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: Logged in; event with available seats exists  
**Steps**:
1. Navigate to `/events`
2. Click "Book Now" on an available event
3. Leave quantity at 1 (default)
4. Fill in name, email, phone
5. Click "Confirm Booking"
**Expected Results**: Confirmation card shown with booking ref in format `{FirstChar}-{6 alphanumeric}`; total price = event price × 1  
**Business Rule**: Booking created; seats decremented; bookingRef generated  
**Suggested Layer**: E2E

---

### TC-008: Book an event with multiple tickets
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in; event with ≥ 3 seats available  
**Steps**:
1. Navigate to event detail page
2. Click "+" to increment quantity to 3
3. Fill customer details
4. Click "Confirm Booking"
**Expected Results**: Booking confirmed; total = price × 3 shown on confirmation card  
**Business Rule**: `totalPrice = event.price × quantity`  
**Suggested Layer**: E2E

---

### TC-009: View booking in My Bookings list
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: User has at least 1 active booking  
**Steps**:
1. Navigate to `/bookings`
**Expected Results**: Booking card visible; shows event title, booking ref, status "confirmed"  
**Business Rule**: GET /api/bookings returns user's own bookings  
**Suggested Layer**: E2E

---

### TC-010: View booking detail page
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: User has at least 1 booking  
**Steps**:
1. Navigate to `/bookings`
2. Click "View Details" on a booking card
**Expected Results**: Page at `/bookings/:id` shows: Event Details section, Customer Details section, Payment Summary with Total Paid, Booking Information section, "Check eligibility for refund?" link  
**Business Rule**: Booking detail loads all related event data  
**Suggested Layer**: E2E

---

### TC-011: Cancel a booking from the detail page
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: User has at least 1 active booking  
**Steps**:
1. Navigate to booking detail page
2. Click "Cancel Booking"
3. React ConfirmDialog appears — click "Yes, cancel it"
**Expected Results**: Toast "Booking cancelled successfully"; redirected to `/bookings`; booking no longer listed  
**Business Rule**: Cancellation deletes booking; seats restored for dynamic events  
**Suggested Layer**: E2E

---

### TC-012: Clear all bookings from bookings list
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: User has ≥ 1 booking  
**Steps**:
1. Navigate to `/bookings`
2. Click "Clear all bookings"
3. Accept native browser confirm dialog
**Expected Results**: All booking cards removed; "No bookings yet" empty state shown with "Browse Events" link  
**Business Rule**: DELETE /api/bookings removes all user bookings  
**Suggested Layer**: E2E

---

### TC-013: Create a new event via Admin UI
**Category**: Happy Path  
**Priority**: P0  
**Preconditions**: Logged in; user has < 6 dynamic events  
**Steps**:
1. Navigate to `/admin/events`
2. Fill in: Title, Category, City, Venue, future date, Price, Total Seats
3. Click "+ Add Event" (or equivalent submit button)
**Expected Results**: "Event created!" toast shown; new event appears in the events table  
**Business Rule**: POST /api/events creates event owned by the logged-in user  
**Suggested Layer**: E2E

---

### TC-014: Edit an existing dynamic event
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in; user owns ≥ 1 dynamic event  
**Steps**:
1. Navigate to `/admin/events`
2. Click "Edit" on a dynamic event row
3. Form populates with current values; modify the title
4. Submit the form
**Expected Results**: Event updated in the table; page scrolls to top to show pre-populated form  
**Business Rule**: PUT /api/events/:id updates only the owner's non-static event  
**Suggested Layer**: E2E

---

### TC-015: Delete an event via Admin UI
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in; user owns ≥ 1 dynamic event  
**Steps**:
1. Navigate to `/admin/events`
2. Click "Delete" on a dynamic event
3. ConfirmDialog appears; click "Delete event"
**Expected Results**: "Event deleted" toast; row removed from table  
**Business Rule**: DELETE /api/events/:id cascades to associated bookings  
**Suggested Layer**: E2E

---

### TC-016: Navigate to bookings via "View My Bookings" link on confirmation
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: User just completed a booking  
**Steps**:
1. Complete a booking — confirmation card appears
2. Click "View My Bookings"
**Expected Results**: Redirected to `/bookings`; new booking card visible in the list  
**Business Rule**: Post-booking navigation flow  
**Suggested Layer**: E2E

---

### TC-017: Navigate to events via navbar
**Category**: Happy Path  
**Priority**: P1  
**Preconditions**: Logged in  
**Steps**:
1. Click "Events" in the navbar
**Expected Results**: Navigates to `/events`  
**Business Rule**: Navbar `[data-testid="nav-events"]` link  
**Suggested Layer**: E2E

---

## Business Rules (TC-100 – TC-199)

### TC-101: Booking reference starts with event title's first character
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; event with a known title exists  
**Steps**:
1. Book an event whose title starts with "T" (e.g. "Tech Conference Bangalore")
2. Note booking reference on confirmation card
**Expected Results**: `bookingRef` matches pattern `^T-[A-Z0-9]{6}$`  
**Business Rule**: `bookingRef = eventTitle[0].toUpperCase() + '-' + 6 random alphanumeric chars`  
**Suggested Layer**: E2E

---

### TC-102: FIFO pruning removes oldest event when 7th event is created
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; user already has exactly 6 dynamic events  
**Steps**:
1. Note the title of the oldest user-created event
2. Create a 7th event via `/admin/events`
**Expected Results**: The oldest event is automatically deleted; total count stays at 6; new event appears  
**Business Rule**: Max 6 user-created events; FIFO replacement on overflow  
**Suggested Layer**: API

---

### TC-103: FIFO pruning removes oldest booking when 10th booking is created
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; user already has exactly 9 bookings  
**Steps**:
1. Note the ref of the oldest booking
2. Book a 10th ticket
**Expected Results**: Oldest booking is deleted automatically; total count stays at 9; new booking appears  
**Business Rule**: Max 9 bookings per user; FIFO replacement on overflow  
**Suggested Layer**: API

---

### TC-104: Static events show "Read-only" in admin table (no edit/delete)
**Category**: Business Rule  
**Priority**: P1  
**Preconditions**: Logged in; seeded static events present  
**Steps**:
1. Navigate to `/admin/events`
2. Find a row with "Featured" badge
**Expected Results**: Row shows "Read-only" text instead of Edit/Delete buttons  
**Business Rule**: `isStatic = true` events are immutable  
**Suggested Layer**: E2E

---

### TC-105: Available seats decrement immediately after booking
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; event with known seat count  
**Steps**:
1. Note available seats for an event
2. Book 2 tickets
3. Return to event detail page
**Expected Results**: Available seats count reduced by 2  
**Business Rule**: Seat count reduces on booking confirmation  
**Suggested Layer**: API

---

### TC-106: Available seats restore after booking cancellation
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; user has a booking for a dynamic event  
**Steps**:
1. Note available seats for an event after booking N tickets
2. Cancel the booking
3. Check available seats
**Expected Results**: Available seats count restored by N  
**Business Rule**: Booking deletion frees seats immediately  
**Suggested Layer**: API

---

### TC-107: Single-ticket booking is eligible for refund
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; user has a booking with quantity = 1  
**Steps**:
1. Navigate to booking detail page for a 1-ticket booking
2. Click "Check eligibility for refund?"
3. Wait ~4 seconds
**Expected Results**: Green "Eligible for refund. Single-ticket bookings qualify for a full refund." message shown  
**Business Rule**: quantity = 1 → eligible; client-side logic with `setTimeout(4000)`  
**Suggested Layer**: E2E

---

### TC-108: Multi-ticket booking is NOT eligible for refund
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; user has a booking with quantity > 1 (e.g. 3)  
**Steps**:
1. Navigate to booking detail for the 3-ticket booking
2. Click "Check eligibility for refund?"
3. Wait ~4 seconds
**Expected Results**: Red "Not eligible for refund. Group bookings (3 tickets) are non-refundable." message  
**Business Rule**: quantity > 1 → not eligible; message includes the actual quantity  
**Suggested Layer**: E2E

---

### TC-109: Refund check spinner shows for approximately 4 seconds
**Category**: Business Rule  
**Priority**: P1  
**Preconditions**: Logged in; on a booking detail page  
**Steps**:
1. Click "Check eligibility for refund?"
2. Immediately observe the UI
**Expected Results**: Spinner with "Checking your refund eligibility…" text visible while waiting; disappears after ~4s when result shows  
**Business Rule**: 4-second deliberate delay before result (front-end animation)  
**Suggested Layer**: E2E

---

### TC-110: Total price calculated as price × quantity
**Category**: Business Rule  
**Priority**: P0  
**Preconditions**: Logged in; on event detail page  
**Steps**:
1. Note event price
2. Set quantity to 4
3. Observe price summary before submitting
**Expected Results**: Price summary shows `price × 4 = {total}`; confirmation card and booking detail show same total  
**Business Rule**: `totalPrice = event.price × quantity`  
**Suggested Layer**: E2E

---

### TC-111: Ticket quantity capped at availableSeats when fewer than 10
**Category**: Business Rule  
**Priority**: P1  
**Preconditions**: Logged in; event with exactly 3 available seats  
**Steps**:
1. Navigate to event detail
2. Click "+" button repeatedly
**Expected Results**: Quantity stops incrementing at 3; "+" button becomes disabled; "(max 3)" shown  
**Business Rule**: `maxQty = Math.min(10, event.availableSeats)`  
**Suggested Layer**: E2E

---

### TC-112: Quantity decrement button disabled at minimum (1)
**Category**: Business Rule  
**Priority**: P1  
**Preconditions**: Logged in; on event detail page  
**Steps**:
1. Note quantity is 1 by default
2. Click "−" button
**Expected Results**: Quantity stays at 1; "−" button is disabled  
**Business Rule**: Min quantity = 1  
**Suggested Layer**: E2E

---

### TC-113: Per-user availableSeats accounts for user's own prior bookings
**Category**: Business Rule  
**Priority**: P1  
**Preconditions**: Logged in; user has booked 2 tickets for a dynamic event with 10 total seats  
**Steps**:
1. Navigate to the same event detail page
**Expected Results**: Available seats shown as 8 (not 10), because user's own 2 booked are subtracted  
**Business Rule**: `availableSeats = DB.availableSeats - userBookedQuantity` (per-user computation)  
**Suggested Layer**: API

---

### TC-114: Booking reference uniqueness guaranteed via retry
**Category**: Business Rule  
**Priority**: P2  
**Preconditions**: API accessible  
**Steps**:
1. Create multiple bookings for events with same title first letter
**Expected Results**: Each booking ref is unique in the database  
**Business Rule**: `generateUniqueRef` retries up to 10 times on collision, then uses `Date.now().toString(36)` fallback  
**Suggested Layer**: API

---

## Security (TC-200 – TC-299)

### TC-201: Cross-user booking access returns "Access Denied"
**Category**: Security  
**Priority**: P0  
**Preconditions**: Two user accounts; User A has a booking  
**Steps**:
1. Login as User A; create a booking; note its ID from URL
2. Logout; login as User B
3. Navigate to `/bookings/{UserA_booking_id}`
**Expected Results**: "Access Denied — You are not authorized to view this booking" shown  
**Business Rule**: bookingService throws ForbiddenError if `booking.userId !== requestingUserId`  
**Suggested Layer**: E2E

---

### TC-202: Unauthenticated user cannot book an event
**Category**: Security  
**Priority**: P0  
**Preconditions**: Not logged in  
**Steps**:
1. Call POST /api/bookings without Authorization header
**Expected Results**: 401 Unauthorized response  
**Business Rule**: All booking endpoints require Bearer token  
**Suggested Layer**: API

---

### TC-203: Unauthenticated access to /bookings redirects or shows auth error
**Category**: Security  
**Priority**: P0  
**Preconditions**: Not logged in (cleared localStorage)  
**Steps**:
1. Navigate directly to `/bookings`
**Expected Results**: Redirected to `/login` or unauthorized state shown  
**Business Rule**: JWT required; frontend auth guard  
**Suggested Layer**: E2E

---

### TC-204: Unauthenticated access to /admin/events is blocked
**Category**: Security  
**Priority**: P0  
**Preconditions**: Not logged in  
**Steps**:
1. Navigate directly to `/admin/events`
**Expected Results**: Redirected to `/login` or blocked  
**Business Rule**: All event mutation endpoints require Bearer token  
**Suggested Layer**: E2E

---

### TC-205: Cannot edit a static event via API
**Category**: Security  
**Priority**: P0  
**Preconditions**: Authenticated; know the ID of a static (seeded) event  
**Steps**:
1. Send PUT /api/events/{staticEventId} with valid body and auth token
**Expected Results**: 403 "Cannot modify a static event"  
**Business Rule**: `if (event.isStatic) throw ForbiddenError`  
**Suggested Layer**: API

---

### TC-206: Cannot delete a static event via API
**Category**: Security  
**Priority**: P0  
**Preconditions**: Authenticated  
**Steps**:
1. Send DELETE /api/events/{staticEventId} with auth token
**Expected Results**: 403 "Cannot delete a static event"  
**Business Rule**: `if (event.isStatic) throw ForbiddenError`  
**Suggested Layer**: API

---

### TC-207: Cannot edit another user's dynamic event via API
**Category**: Security  
**Priority**: P0  
**Preconditions**: User A owns an event; User B is authenticated  
**Steps**:
1. Login as User B
2. Send PUT /api/events/{UserA_eventId} with valid token
**Expected Results**: 403 "You do not own this event"  
**Business Rule**: `if (event.userId !== userId) throw ForbiddenError`  
**Suggested Layer**: API

---

### TC-208: Demo credentials show special warning on login failure
**Category**: Security  
**Priority**: P2  
**Preconditions**: Demo accounts (`rahulshetty1@gmail.com`) do not work  
**Steps**:
1. Enter `rahulshetty1@gmail.com` and any wrong password
2. Click Sign In
**Expected Results**: Amber warning box shown: "Looks like you're using sample test credentials! Sign up now…" instead of generic error toast  
**Business Rule**: Frontend `DEMO_EMAILS` list triggers special UX nudge  
**Suggested Layer**: E2E

---

### TC-209: Cannot cancel another user's booking via API
**Category**: Security  
**Priority**: P0  
**Preconditions**: User A has a booking  
**Steps**:
1. Authenticate as User B
2. Send DELETE /api/bookings/{UserA_bookingId}
**Expected Results**: 403 Forbidden  
**Business Rule**: `if (booking.userId !== userId) throw ForbiddenError`  
**Suggested Layer**: API

---

### TC-210: Expired or invalid JWT returns 401
**Category**: Security  
**Priority**: P1  
**Preconditions**: Have an expired or tampered token  
**Steps**:
1. Send GET /api/events with `Authorization: Bearer invalid.token.here`
**Expected Results**: 401 Unauthorized  
**Business Rule**: JWT middleware validates token signature and expiry  
**Suggested Layer**: API

---

## Negative / Error (TC-300 – TC-399)

### TC-301: Login with incorrect password
**Category**: Negative  
**Priority**: P0  
**Preconditions**: Valid user account exists  
**Steps**:
1. Navigate to `/login`
2. Enter correct email, wrong password
3. Click "Sign In"
**Expected Results**: Error toast: "Invalid email or password"; user remains on login page  
**Business Rule**: authService returns generic error (no email enumeration)  
**Suggested Layer**: E2E

---

### TC-302: Login with non-existent email
**Category**: Negative  
**Priority**: P0  
**Preconditions**: None  
**Steps**:
1. Navigate to `/login`
2. Enter an email that has never registered
3. Click "Sign In"
**Expected Results**: Error toast: "Invalid email or password"  
**Business Rule**: Same error as wrong password — no enumeration  
**Suggested Layer**: E2E

---

### TC-303: Register with duplicate email
**Category**: Negative  
**Priority**: P0  
**Preconditions**: Account with `test@test.com` already exists  
**Steps**:
1. Navigate to `/register`
2. Enter `test@test.com` + valid password
3. Submit
**Expected Results**: Error toast: "Email already registered"; account not created  
**Business Rule**: authService throws `ValidationError('Email already registered')` → 409  
**Suggested Layer**: E2E

---

### TC-304: Register with invalid email format
**Category**: Negative  
**Priority**: P1  
**Preconditions**: None  
**Steps**:
1. Navigate to `/register`
2. Enter `notanemail` as email
3. Submit form
**Expected Results**: Inline validation error: "Enter a valid email"; form not submitted  
**Business Rule**: Client-side email regex validation  
**Suggested Layer**: E2E

---

### TC-305: Register with weak password (fails strength rules)
**Category**: Negative  
**Priority**: P1  
**Preconditions**: None  
**Steps**:
1. Navigate to `/register`
2. Enter valid email
3. Enter password `abc123` (no uppercase, no special char)
4. Submit
**Expected Results**: Error "Password does not meet the requirements below"; strength checklist shows failing rules in grey  
**Business Rule**: Password requires: 8+ chars, uppercase, number, special character  
**Suggested Layer**: E2E

---

### TC-306: Register with mismatched confirm password
**Category**: Negative  
**Priority**: P1  
**Preconditions**: None  
**Steps**:
1. Navigate to `/register`
2. Enter valid email + strong password
3. Enter different text in Confirm Password
4. Submit
**Expected Results**: Inline error "Passwords do not match"  
**Business Rule**: Client-side confirm password validation  
**Suggested Layer**: E2E

---

### TC-307: Book event with name shorter than 2 characters
**Category**: Negative  
**Priority**: P1  
**Preconditions**: Logged in; on event detail page  
**Steps**:
1. Set Full Name to "A"
2. Fill valid email and phone
3. Click "Confirm Booking"
**Expected Results**: Inline error "Name must be at least 2 chars"; booking not created  
**Business Rule**: customerName min length = 2  
**Suggested Layer**: E2E

---

### TC-308: Book event with invalid email format
**Category**: Negative  
**Priority**: P1  
**Preconditions**: Logged in; on event detail page  
**Steps**:
1. Enter "notanemail" in the Email field
2. Submit booking form
**Expected Results**: Inline error "Enter a valid email"  
**Business Rule**: customerEmail must match email regex  
**Suggested Layer**: E2E

---

### TC-309: Book event with phone number shorter than 10 digits
**Category**: Negative  
**Priority**: P1  
**Preconditions**: Logged in; on event detail page  
**Steps**:
1. Enter "12345" in Phone field (< 10 digits)
2. Submit booking form
**Expected Results**: Inline error "Enter a valid 10-digit phone"  
**Business Rule**: `customerPhone.replace(/\D/g, '').length >= 10`  
**Suggested Layer**: E2E

---

### TC-310: Create event with a past date
**Category**: Negative  
**Priority**: P0  
**Preconditions**: Authenticated  
**Steps**:
1. Send POST /api/events with `eventDate` set to yesterday
**Expected Results**: 400 "Event date must be in the future"  
**Business Rule**: eventDate must be a future DateTime  
**Suggested Layer**: API

---

### TC-311: Create event with missing required fields
**Category**: Negative  
**Priority**: P1  
**Preconditions**: Authenticated  
**Steps**:
1. Send POST /api/events with body `{ "title": "Test" }` (missing all other required fields)
**Expected Results**: 400 with validation error details listing missing fields  
**Business Rule**: express-validator checks title, category, city, venue, eventDate, price, totalSeats  
**Suggested Layer**: API

---

### TC-312: Attempt to book a sold-out event
**Category**: Negative  
**Priority**: P0  
**Preconditions**: Logged in; event exists with 0 available seats  
**Steps**:
1. Navigate to the sold-out event detail page
**Expected Results**: "Confirm Booking" button replaced with disabled "Sold Out" button; quantity controls inaccessible  
**Business Rule**: `soldOut = event.availableSeats === 0`  
**Suggested Layer**: E2E

---

### TC-313: API request for more tickets than available
**Category**: Negative  
**Priority**: P0  
**Preconditions**: Authenticated; event with 2 available seats  
**Steps**:
1. Send POST /api/bookings with `quantity: 5` for that event
**Expected Results**: 400 "Only 2 seat(s) available, but 5 requested"  
**Business Rule**: `InsufficientSeatsError` thrown in bookingService  
**Suggested Layer**: API

---

### TC-314: Navigate to non-existent booking
**Category**: Negative  
**Priority**: P1  
**Preconditions**: Logged in  
**Steps**:
1. Navigate to `/bookings/999999`
**Expected Results**: "Booking not found — This booking doesn't exist or may have been cancelled" empty state with "View My Bookings" button  
**Business Rule**: 404 NotFoundError rendered as empty state  
**Suggested Layer**: E2E

---

### TC-315: Navigate to non-existent event
**Category**: Negative  
**Priority**: P1  
**Preconditions**: Logged in  
**Steps**:
1. Navigate to `/events/999999`
**Expected Results**: "Event not found" empty state with "Browse Events" button  
**Business Rule**: 404 NotFoundError from eventService  
**Suggested Layer**: E2E

---

### TC-316: Login with empty email field
**Category**: Negative  
**Priority**: P1  
**Preconditions**: On login page  
**Steps**:
1. Leave email blank
2. Enter a password
3. Click Sign In
**Expected Results**: Inline error "Enter a valid email"; no API call made  
**Business Rule**: Client-side validation before submit  
**Suggested Layer**: E2E

---

### TC-317: Login with password shorter than 6 characters
**Category**: Negative  
**Priority**: P1  
**Preconditions**: On login page  
**Steps**:
1. Enter valid email
2. Enter "abc" (3 chars) as password
3. Click Sign In
**Expected Results**: Inline error "Password must be at least 6 characters"  
**Business Rule**: Login form validates password min length = 6  
**Suggested Layer**: E2E

---

## Edge Cases (TC-400 – TC-499)

### TC-401: Book the same event multiple times (per-user seat computation)
**Category**: Edge Case  
**Priority**: P1  
**Preconditions**: Logged in; dynamic event with ≥ 5 total seats  
**Steps**:
1. Book 2 tickets for the event
2. Book 2 more tickets for the same event
3. Check availableSeats shown
**Expected Results**: Each booking succeeds; available seats shown to this user reflects 4 fewer  
**Business Rule**: Per-user seat computation allows re-booking same event for testing  
**Suggested Layer**: API

---

### TC-402: Creating the 7th event triggers FIFO with oldest non-same-event preference
**Category**: Edge Case  
**Priority**: P1  
**Preconditions**: Logged in; user has exactly 6 dynamic events with different IDs  
**Steps**:
1. Record the creation timestamps of all 6 events
2. Create a 7th event
**Expected Results**: The chronologically oldest event (by `createdAt`) is deleted; 7th event appears  
**Business Rule**: `findOldestUserDynamic` selects oldest by createdAt  
**Suggested Layer**: API

---

### TC-403: Creating 10th booking triggers FIFO — prefers deleting booking from a different event
**Category**: Edge Case  
**Priority**: P1  
**Preconditions**: Logged in; 9 existing bookings where some share the same eventId  
**Steps**:
1. Create a 10th booking for event X
**Expected Results**: Oldest booking for a *different* event is pruned first; if all are same event, oldest overall is pruned  
**Business Rule**: `findOldestUserBookingExcludingEvent(userId, eventId)` preferred over `findOldestUserBooking`  
**Suggested Layer**: API

---

### TC-404: Quantity = 1 (minimum boundary)
**Category**: Edge Case  
**Priority**: P1  
**Preconditions**: Logged in; on event detail page  
**Steps**:
1. Confirm quantity defaults to 1
2. Try to decrement below 1
**Expected Results**: Quantity stays at 1; "−" button disabled; booking with qty=1 succeeds  
**Business Rule**: Min quantity = 1; button disabled via `disabled={form.quantity <= 1}`  
**Suggested Layer**: E2E

---

### TC-405: Quantity = 10 (maximum boundary when seats ≥ 10)
**Category**: Edge Case  
**Priority**: P1  
**Preconditions**: Logged in; event with ≥ 10 available seats  
**Steps**:
1. Click "+" 9 times to reach quantity of 10
2. Try to increment further
**Expected Results**: Quantity caps at 10; "+" button disabled at 10; booking with qty=10 succeeds  
**Business Rule**: `maxQty = Math.min(10, availableSeats)` caps at 10  
**Suggested Layer**: E2E

---

### TC-406: Book exactly the remaining available seats
**Category**: Edge Case  
**Priority**: P1  
**Preconditions**: Logged in; event with exactly 3 available seats  
**Steps**:
1. Navigate to event detail
2. Set quantity to 3
3. Confirm booking
**Expected Results**: Booking succeeds; event now shows 0 seats / "Sold Out"  
**Business Rule**: Booking succeeds when `personalAvailable >= quantity` (boundary = equal)  
**Suggested Layer**: API

---

### TC-407: Booking an event with price = 0 (free event)
**Category**: Edge Case  
**Priority**: P2  
**Preconditions**: Authenticated; event with price = 0 exists  
**Steps**:
1. Send POST /api/events with price = 0
2. Book 2 tickets for the free event
**Expected Results**: Event created; booking shows totalPrice = $0; confirmation card shows $0  
**Business Rule**: `price >= 0` allowed; `totalPrice = 0 × quantity = 0`  
**Suggested Layer**: API

---

### TC-408: Event title starting with a number generates numeric-prefixed booking ref
**Category**: Edge Case  
**Priority**: P2  
**Preconditions**: Authenticated  
**Steps**:
1. Create event titled "2025 Tech Summit"
2. Book a ticket
**Expected Results**: Booking ref starts with `2-` (e.g. `2-AB1234`)  
**Business Rule**: `prefix = eventTitle[0].toUpperCase()` — works for digits too  
**Suggested Layer**: API

---

### TC-409: FIFO booking pruning — "same event fallback" burns a seat permanently
**Category**: Edge Case  
**Priority**: P2  
**Preconditions**: User has 9 bookings all for the same event X  
**Steps**:
1. Create a 10th booking for event X
**Expected Results**: Oldest booking is pruned; new booking created; `event.availableSeats` decremented because `sameEventFallback = true`  
**Business Rule**: When pruned booking is for the same event, `decrementSeats` is called to keep seat count consistent  
**Suggested Layer**: API

---

### TC-410: Password strength checklist all-passing before submit
**Category**: Edge Case  
**Priority**: P2  
**Preconditions**: On register page  
**Steps**:
1. Type `Test@1234` in password field (meets all 4 rules)
**Expected Results**: All 4 checklist items turn green (checkmark); no error on submit  
**Business Rule**: All 4 PASSWORD_RULES must pass: 8+ chars, uppercase, digit, special char  
**Suggested Layer**: E2E

---

## UI State (TC-500 – TC-599)

### TC-501: Events list shows loading state before data arrives
**Category**: UI State  
**Priority**: P2  
**Preconditions**: On slow network or initial page load  
**Steps**:
1. Navigate to `/events` and observe immediately
**Expected Results**: Skeleton card placeholders shown while events load; cards appear after data arrives  
**Business Rule**: React Query loading state renders EventCard skeletons  
**Suggested Layer**: E2E

---

### TC-502: Events list shows empty state when no results match filters
**Category**: UI State  
**Priority**: P1  
**Preconditions**: Logged in  
**Steps**:
1. Navigate to `/events`
2. Search for a keyword that matches no events (e.g. "xyzabc123")
**Expected Results**: "No events found" empty state shown  
**Business Rule**: Empty response triggers EmptyState component  
**Suggested Layer**: E2E

---

### TC-503: Bookings page shows empty state when user has no bookings
**Category**: UI State  
**Priority**: P1  
**Preconditions**: Logged in; user has no bookings  
**Steps**:
1. Navigate to `/bookings`
**Expected Results**: "No bookings yet" empty state shown with "Browse Events" link  
**Business Rule**: Empty booking list renders EmptyState  
**Suggested Layer**: E2E

---

### TC-504: Sold-out event shows disabled "Sold Out" button on detail page
**Category**: UI State  
**Priority**: P0  
**Preconditions**: Event with 0 available seats  
**Steps**:
1. Navigate to event detail for sold-out event
**Expected Results**: Booking form shows disabled "Sold Out" button; confirm button not clickable  
**Business Rule**: `soldOut = event.availableSeats === 0; disabled={soldOut}`  
**Suggested Layer**: E2E

---

### TC-505: Event detail shows amber warning when seats ≤ 10
**Category**: UI State  
**Priority**: P2  
**Preconditions**: Event with 5 available seats  
**Steps**:
1. Navigate to event detail
**Expected Results**: Available seats count displayed in amber/orange color (`text-amber-600`)  
**Business Rule**: `availableSeats <= 10 ? 'text-amber-600' : 'text-emerald-600'`  
**Suggested Layer**: E2E

---

### TC-506: Sandbox warning banner appears on events page near limit
**Category**: UI State  
**Priority**: P1  
**Preconditions**: Logged in; user has ≥ 5 events  
**Steps**:
1. Navigate to `/events`
**Expected Results**: Banner visible containing text "sandbox holds up to" (sandbox limit reminder)  
**Business Rule**: Banner shown when user is close to the 6-event limit  
**Suggested Layer**: E2E

---

### TC-507: Booking confirmation card shows all expected fields
**Category**: UI State  
**Priority**: P0  
**Preconditions**: User just completed a booking  
**Steps**:
1. Complete a booking
2. Observe confirmation card
**Expected Results**: Card shows: "Booking Confirmed! 🎉", Booking Ref (`.booking-ref`), Customer name, Ticket quantity, Total price, "View My Bookings" button, "Browse More Events" button  
**Business Rule**: BookingConfirmation component renders all booking fields  
**Suggested Layer**: E2E

---

### TC-508: Refund spinner visible during 4-second wait
**Category**: UI State  
**Priority**: P1  
**Preconditions**: On booking detail page (any booking)  
**Steps**:
1. Click "Check eligibility for refund?"
2. Immediately check for spinner element
**Expected Results**: `#refund-spinner` visible with spinner animation; disappears after ~4 seconds; replaced by `#refund-result`  
**Business Rule**: `status === 'checking'` shows spinner; `setTimeout(4000)` then reveals result  
**Suggested Layer**: E2E

---

### TC-509: Admin events table — static events show "Read-only"
**Category**: UI State  
**Priority**: P1  
**Preconditions**: Logged in; seeded events present  
**Steps**:
1. Navigate to `/admin/events`
2. Find a "Featured" event row
**Expected Results**: Actions column shows italic grey "Read-only" text; no Edit or Delete buttons  
**Business Rule**: `event.isStatic → <span>Read-only</span>`  
**Suggested Layer**: E2E

---

### TC-510: Admin events table — dynamic events show Edit and Delete buttons
**Category**: UI State  
**Priority**: P1  
**Preconditions**: Logged in; user has created ≥ 1 dynamic event  
**Steps**:
1. Navigate to `/admin/events`
2. Find a row without "Featured" badge
**Expected Results**: Actions column shows "Edit" and "Delete" buttons  
**Business Rule**: `!event.isStatic → Edit + Delete buttons`  
**Suggested Layer**: E2E

---

### TC-511: Login button shows loading state during sign-in
**Category**: UI State  
**Priority**: P2  
**Preconditions**: On `/login`  
**Steps**:
1. Enter valid credentials
2. Click "Sign In" and immediately observe button
**Expected Results**: Button text changes to "Signing in…" and is disabled while API call is in progress  
**Business Rule**: `loading` state disables button; `{loading ? 'Signing in…' : 'Sign In'}`  
**Suggested Layer**: E2E

---

### TC-512: Password strength checklist updates in real-time during typing
**Category**: UI State  
**Priority**: P2  
**Preconditions**: On `/register`  
**Steps**:
1. Type progressively stronger password in Password field
2. Observe the checklist below the input
**Expected Results**: Each rule item turns from grey (dot icon) to green (checkmark icon) as its condition is satisfied; rules: 8+ chars, uppercase, digit, special char  
**Business Rule**: `PASSWORD_RULES.map(r => r.test(password))` renders per rule  
**Suggested Layer**: E2E

---

### TC-513: Booking detail breadcrumb shows booking reference
**Category**: UI State  
**Priority**: P1  
**Preconditions**: On booking detail page  
**Steps**:
1. Navigate to `/bookings/:id`
2. Observe breadcrumb
**Expected Results**: Breadcrumb shows "My Bookings / {bookingRef}" where bookingRef is in monospace font  
**Business Rule**: `<span className="text-gray-900 font-mono">{booking.bookingRef}</span>`  
**Suggested Layer**: E2E

---

### TC-514: Event detail page shows "Featured" badge and info banner for static events
**Category**: UI State  
**Priority**: P2  
**Preconditions**: Logged in; static event exists  
**Steps**:
1. Navigate to a seeded event detail page
**Expected Results**: "Featured" emerald badge shown alongside category badge; info banner "This is a featured event — always available for practice" visible  
**Business Rule**: `event.isStatic` conditionally renders Featured badge and info banner  
**Suggested Layer**: E2E

---

### TC-515: Admin event form switches to "Edit Event" mode when editing
**Category**: UI State  
**Priority**: P1  
**Preconditions**: Logged in; user owns a dynamic event  
**Steps**:
1. Navigate to `/admin/events`
2. Click "Edit" on a dynamic event
**Expected Results**: Form header changes to "✏️ Edit Event"; form pre-populated with current event values; page scrolls to top  
**Business Rule**: `selectedEvent` state switches form heading and pre-fills fields  
**Suggested Layer**: E2E

---

### TC-516: ConfirmDialog shows correct description for booking cancellation
**Category**: UI State  
**Priority**: P1  
**Preconditions**: On booking detail page  
**Steps**:
1. Click "Cancel Booking"
**Expected Results**: Dialog title "Cancel this booking?"; description mentions `bookingRef` and seat count to be released  
**Business Rule**: `description={Cancelling ${bookingRef} will release ${quantity} seat(s)...}`  
**Suggested Layer**: E2E

---

### TC-517: Events page pagination works correctly
**Category**: UI State  
**Priority**: P2  
**Preconditions**: Logged in; more than 10 events exist  
**Steps**:
1. Navigate to `/events`
2. Click next page
**Expected Results**: Next page of events loads; page indicator updates  
**Business Rule**: GET /api/events `?page=2&limit=10` returns next page  
**Suggested Layer**: E2E

---

### TC-518: Admin events table shows pagination when > 10 events
**Category**: UI State  
**Priority**: P2  
**Preconditions**: Logged in; more than 10 total events (static + dynamic)  
**Steps**:
1. Navigate to `/admin/events`
2. Observe bottom of table
**Expected Results**: Pagination component shown below table  
**Business Rule**: `pagination.totalPages > 1` renders Pagination  
**Suggested Layer**: E2E
