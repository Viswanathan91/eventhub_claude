# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
EventHub is a full-stack event ticket booking platform built for QA training. Users can browse events, book tickets, manage bookings, and create events. Each user operates in an isolated sandbox.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Query v5
- **Backend**: Express.js, Prisma ORM, MySQL 8+
- **Auth**: JWT (7-day expiry), bcryptjs
- **Testing**: Playwright E2E (Chromium only)

## Project Structure
```
eventhub/
├── frontend/          # Next.js 14 app (port 3000)
│   ├── app/           # Pages (App Router)
│   ├── components/    # React components
│   ├── lib/           # API clients, hooks, providers
│   └── types/         # TypeScript interfaces
├── backend/           # Express API (port 3001)
│   ├── src/
│   │   ├── routes/        # HTTP endpoints
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access (Prisma)
│   │   ├── validators/    # Input validation
│   │   └── middleware/    # Auth, error handling
│   └── prisma/            # Schema + seed
├── tests/             # Playwright E2E tests
└── .claude/
    └── skills/        # Skill documents (reference guides)
```

## Architecture Pattern
Backend follows layered architecture: Routes → Controllers → Services → Repositories → Database

## Commands

```bash
# Development
npm run dev          # Start frontend (port 3000) + backend (port 3001) concurrently
npm run setup        # Install npm deps in both /backend and /frontend
npm run lint         # ESLint on frontend

# Database
npm run seed         # Seed 10 static events
npm run db:push      # Push schema to DB without migration files (non-interactive)
npm run migrate      # Run prisma migrate dev (interactive, creates migration files)

# Testing
npm run test                                                           # Run all Playwright tests
npm run test:ui                                                        # Playwright with UI mode
npm run test:report                                                    # Show HTML test report
npx playwright test tests/<file>.spec.js --reporter=line              # Run single test file
```

## Testing Conventions
- **Tests run against the hosted app**: `https://eventhub.rahulshettyacademy.com` (configured in `playwright.config.ts` `baseURL` — not localhost)
- Test files go in `tests/` as `<feature-name>.spec.js`
- Follow guidelines in `.claude/skills/playwright-best-practices.md`
- Locator priority: data-testid > role > label/placeholder > ID > CSS class
- No `page.waitForTimeout()` — use `expect().toBeVisible()`
- Tests must be self-contained (login → action → assert)
- Test account: `rahulshetty1@gmail.com` / `Magiclife1!`
- Login uses `#login-btn` (ID selector), `you@email.com` placeholder for email
- "Clear all bookings" triggers a **native browser confirm dialog** (`page.once('dialog', ...)`), not the React ConfirmDialog

## Key Business Rules
- Max 6 user-created events per user (FIFO pruning on overflow)
- Max 9 bookings per user (FIFO pruning on overflow)
- Booking ref format: `{EventTitleFirstChar}-{6 uppercase alphanumeric}` e.g. `I-A3B2C1` — first character is the event title's first character (uppercase)
- `availableSeats` returned by the API is **per-user adjusted** — it subtracts the user's own booked quantity from the true available count (see `withPersonalSeats()` in `eventService.js`)
- Seat count reduces on booking, restores on cancellation
- Refund eligibility: 1 ticket = eligible, >1 ticket = not eligible (client-side logic only)
- Cross-user booking access returns "Access Denied"
- Static events (`isStatic: true`) are immutable — cannot be edited or deleted
- Only the event owner (`userId`) can edit/delete their dynamic events

## Key Selectors (Playwright)

`data-testid` attributes:

| `data-testid` | Element |
|---|---|
| `event-card` | Each event card in listings |
| `book-now-btn` | "Book Now" link on event card |
| `quantity-input` | Ticket quantity display in booking form |
| `customer-name` | Full name input field |
| `customer-email` | Email input field |
| `customer-phone` | Phone number input field |
| `confirm-booking-btn` | Submit booking button |
| `booking-ref` | Booking reference shown on confirmation |
| `booking-card` | Each booking card in my bookings list |
| `cancel-booking-btn` | Cancel booking button |
| `confirm-dialog-yes` | Confirm button in React confirmation dialog |
| `admin-event-form` | Admin event create/edit form |
| `event-title-input` | Title field in admin form |
| `add-event-btn` | Submit button in admin form |
| `event-table-row` | Each row in the admin events table |
| `edit-event-btn` | Edit button in admin events table row |
| `delete-event-btn` | Delete button in admin events table row |
| `nav-events` | Navbar "Events" link |
| `nav-bookings` | Navbar "My Bookings" link |

ID-based selectors also used in tests: `#login-btn`, `#customer-email`, `#check-refund-btn`, `#confirm-dialog-yes`

## Custom Skills (Slash Commands)

Located in `.claude/skills/`:

- `/generate-tests <feature>` — AI Test Automation Engineer: generates Playwright tests
- `/review-tests <file>` — AI Code Reviewer: reviews test code quality
- `/create-scenarios <area>` — AI Functional Tester: creates test scenario documents
- `/test-strategy <scenarios>` — AI Test Architect: assigns tests to optimal pyramid layers

## Skill Documents
- `.claude/skills/playwright-best-practices.md` — Playwright testing standards
- `.claude/skills/eventhub-domain.md` — Domain knowledge and business rules

## Code Style
- Backend: JavaScript with JSDoc, Express patterns
- Frontend: TypeScript, React hooks, Tailwind utility classes
- Tests: JavaScript with Playwright test runner
- Use meaningful variable names, add step comments in tests
- Keep functions focused and single-responsibility
