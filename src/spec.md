# Specification

## Summary
**Goal:** Add a single “multi-year to date” expense total (from earliest recorded expense year through the current canister time) and display it on the Daily Expenses page with auto-updating behavior.

**Planned changes:**
- Backend: add a new public query method that returns a Nat multi-year total summing all stored expense.amount values from the earliest stored expense year through Time.now.
- Frontend: add a React Query key and hook to fetch/cache the new multi-year total (following existing monthly/yearly total hook patterns).
- Frontend UI: add an additional total card on the Daily Expenses page labeled in English (e.g., “Multi-year Total (to date)”), with the same loading indicator and formatting as other total cards.
- Frontend mutations: invalidate the multi-year total query after create/update/delete expense actions so the displayed value refreshes without reloading.

**User-visible outcome:** The Daily Expenses page shows a new “multi-year total (to date)” card that loads with a spinner and automatically updates after expenses are created, updated, or deleted.
