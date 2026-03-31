# Server-only utilities

All files in `src/lib/server/` are server-only. Never import them from client-side code or universal (shared) load functions.

## cookie.ts — Session tokens

HMAC-SHA256 signed session cookies.

- `createSessionCookie(userId, maxAge)` → cookie string: `${userId}:${expiresAt}.${base64(hmac)}`
- `verifySessionCookie(cookie)` → `bigint` userId on success, `null` if invalid or expired
- `SESSION_COOKIE_NAME` — the cookie name constant; import this instead of hardcoding the string

## guards.ts — Auth guards

Reusable async functions for route protection. Throw `AuthError` (which carries an HTTP `status`) on failure.

| Function                                         | Throws                                        | Returns                   |
| ------------------------------------------------ | --------------------------------------------- | ------------------------- |
| `requireAuth(cookies)`                           | `AuthError(401)` if cookie missing or invalid | `bigint` userId           |
| `requireActiveUser(userId)`                      | `AuthError(403)` if user lacks access         | `User`                    |
| `requireOwnership(userId, getOwnerId, resource)` | — (sync)                                      | `Result<true, AuthError>` |

`requireActiveUser` enforces the access rule: `has_lifetime_access || is_current_server_member` (both checked together).

`requireOwnership` returns a `Result` rather than throwing because it is synchronous — follow the project's sync error convention.

## response.ts — HTTP response helpers

Use these in `+server.ts` API endpoints.

- `jsonResponse(data, status?)` → `Response` with `Content-Type: application/json`; serializes `bigint` values to strings automatically.
- `errorResponse(error, status)` → `Response` with `{ error }` body.

## discord.ts — OAuth

- `exchangeCode(code)` → Discord access token
- `getCurrentUser(token)` → Discord user profile
- `getGuildMember(token, guildId)` → guild membership + role list; throws `GuildMemberNotFoundError` if user is not in the server
- `discordUserToInsert(user, member)` → converts Discord API response to `UserInsert`

Custom errors: `TokenExchangeError`, `UserFetchError`, `GuildMemberFetchError`, `GuildMemberNotFoundError`.

## image-storage.ts — Image files

Utilities for saving and deleting image files on disk. The storage directory is `process.env.IMAGES_DIR ?? './images'`. Images are served by the `src/routes/images/[...path]/+server.ts` endpoint.

## services/auth.ts — Auth upsert

`upsertDiscordUser(discordUser, guildMember)` — wraps the Discord auth flow in a transaction:

1. Look up user by `discord_id`.
2. If not found, insert a new user.
3. If found, update `discord_handle`, membership status, and `last_checked_at`.

Always use this function in the OAuth callback — do not call the UsersDAO directly for auth.
