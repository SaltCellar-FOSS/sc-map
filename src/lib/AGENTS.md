# src/lib

Shared code that may be imported by both client and server. Do not import server-only modules (`$lib/server/*`) from here.

## result.ts — Synchronous error handling

`Result<T, E extends Error>` is a discriminated union for returning errors from synchronous functions without throwing.

```ts
// Returning a result
return Result.success(value);
return Result.failure(new SomeError('reason'));

// Consuming a result
if (result.success) {
	use(result.value);
} else {
	handle(result.error);
}
```

**Rules:**

- **Synchronous functions** that can fail must return `Result` instead of throwing.
- **Asynchronous functions** must NOT use `Result`. A `Promise` is already a result — use `throw` (or `Promise.reject`) for async errors.

Additional utilities:

- `Result.gen(fn*)` — generator-based unwrapping; `yield` a `Result` to unwrap or short-circuit on failure.
- `Result.all(results)` — combines multiple results; returns failure on the first error.

## schemas/ — Shared Zod schemas

`src/lib/schemas/` holds Zod schemas shared across DAOs and routes. Do not put server-only schemas here.

- `saved-place.ts` — `SavedPlaceSchema`, insert/update variants, `SavedPlaceType` enum (BAR, BAKERY, CAFE, DELI, DESSERT, FOOD_TRUCK, OTHER_DESTINATION, RESTAURANT)
- `visit.ts` — `VisitSchema` (uses `Temporal.PlainDate` for `visited_at`), `VisitWithUserSchema` (joined user + photos)
- `place.ts` — `Place` union type (`SavedPlace | BasePlace`)

## Temporal dates

Dates use the [Temporal API](https://tc39.es/proposal-temporal/) via `@js-temporal/polyfill`. Use `Temporal.PlainDate` for dates that represent a calendar day with no time component (e.g. `visited_at` on visits). When a timestamp is needed, use `Date` instead.

Use `Temporal.PlainDate.from(string)` to parse and `.toString()` to serialize to ISO format (`YYYY-MM-DD`).
