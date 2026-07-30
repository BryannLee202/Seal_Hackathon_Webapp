---
name: run-seal-hackathon
description: Build, launch, and smoke-test the SEAL Hackathon webapp (Spring Boot backend + NestJS BFF + React/Vite frontend + PostgreSQL, orchestrated by Docker Compose). Use when asked to run, start, launch, build, or screenshot the SEAL Hackathon app, or to verify the full stack works end-to-end after a change.
---

# Run: SEAL Hackathon webapp

Four containers via `docker compose` at the repo root: `postgres` →
`backend` (Spring Boot, Java 21) → `bff` (NestJS) → `frontend` (React/Vite,
served by nginx). The frontend talks to the bff directly at `:4001`
(not proxied through nginx), the bff talks to the backend at `:8080`.

All paths below are relative to the repo root (the directory containing
`docker-compose.yml`), not to this skill directory. The driver script is
at `.claude/skills/run-seal-hackathon/driver.sh` from there.

**Agent path — drive it over the API with `driver.sh`, no browser needed.**
This is the fastest way to prove a change didn't break the stack: it logs
in as the seeded coordinator, creates a real event through the actual
CSRF-protected write path, and confirms it persisted.

## Prerequisites

- Docker Desktop (or another Docker daemon) running. Check with:
  ```bash
  docker info >/dev/null 2>&1 && echo OK || echo "start Docker first"
  ```
  On Windows with Docker Desktop installed but not running, launch it and
  poll (it takes 30-90s to come up):
  ```bash
  "/c/Users/tai/AppData/Local/Programs/DockerDesktop/Docker Desktop.exe" &
  until docker info >/dev/null 2>&1; do sleep 3; done
  ```
- A root `.env` with `JWT_SECRET` set (compose fails fast without it):
  ```bash
  test -f .env || echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
  ```

## Build + launch

```bash
docker compose up -d --build
```

Run in **detached mode (`-d`)** — without it the command stays attached
and streaming logs, which looks like a hang to anything waiting on the
process to exit, and appears to "complete" (misleadingly) only once
something kills it or a timeout fires. `-d` returns immediately; the
containers keep running in the background.

First build compiles the Spring Boot jar via Maven and builds the Vite
production bundle — takes a few minutes cold, seconds once Docker's
layer cache is warm. Rebuild just one service after a source change
(much faster than a full `up --build`):

```bash
docker compose up -d --build frontend   # after any frontend/src change
docker compose up -d --build backend    # after any backend/src change
docker compose up -d --build bff        # after any bff/src change
```

Ports: frontend `:3000`, bff `:4001`, backend `:8080` (Swagger at
`:8080/swagger-ui.html`), postgres `:5432` (container-internal only).

## Run (agent path): `driver.sh`

```bash
chmod +x .claude/skills/run-seal-hackathon/driver.sh
.claude/skills/run-seal-hackathon/driver.sh smoke
```

Ran this exact command against a freshly built stack — real output:

```
[driver] waiting for backend, bff, frontend...
[driver] all healthy
[driver] logging in as coordinator@seal.edu.vn
[driver] login OK: {"userId":"...","roles":["COORDINATOR"]}
[driver] creating event "Driver smoke 1785444006" (csrf=77254ba6...)
[driver] created OK: {"id":"...","name":"Driver smoke 1785444006","status":"DRAFT",...}
[driver] verifying "Driver smoke 1785444006" appears in GET /api/events
[driver] verified: event is persisted and listed
[driver] SMOKE TEST PASSED
```

It exercises the exact contract the React app uses: `POST /api/auth/login`
→ cookies (`shms_at` httpOnly, `XSRF-TOKEN` readable) → double-submit CSRF
header (`x-xsrf-token`, read from the `XSRF-TOKEN` cookie) on the
state-changing `POST /api/events` call → `GET /api/events` to confirm the
write landed in Postgres. If this passes, the backend, the bff's CSRF
guard, and the auth flow all work together correctly — most regressions
in that path will fail here immediately, without needing a browser.

Subcommands: `healthcheck` (just wait for all three to answer), `login`
(login only, prints the cookie jar path — useful if you want to `curl`
more of the API by hand afterward).

## Run (human / visual path)

Open `http://localhost:3000`. Seeded coordinator account (from
`backend/src/main/resources/db/migration/V2__seed_data.sql`):
`coordinator@seal.edu.vn` / `Coordinator@123`.

**Browser automation in this environment:** `chromium-cli` is not
installed here (`npm view chromium-cli` → 404; it's not a published
package, only available where a container image bundles it) — the
verification run for this skill used the `claude-in-chrome` MCP tools
instead (real Chrome, extension-driven). That flow, for reference:
`tabs_context_mcp` → `navigate` to `/login` → `computer` click+type into
the email/password fields → click submit → `navigate` to
`/coordinator/events` → `computer screenshot` (pass `save_to_disk: true`
to get a file on disk). It reproduced the same state `driver.sh` proved
via the API: both the curl-created and UI-created test events showed up
in the same list.

If a future environment *does* have `chromium-cli` available, drive it
the standard way instead (see the `run` skill's
`examples/playwright.md`): start from `nav http://localhost:3000/login`,
`fill`/`click` the login form, `nav` to `/coordinator/events`,
`screenshot`. Not verified in *this* session — no chromium-cli to test
it with — so it's a documented fallback, not a proven path.

## Gotchas

- **`docker compose up --build` without `-d` looks alive but isn't
  trackable.** It stays attached and streams container logs forever;
  a background-launch wrapper waiting for the process to *exit* will
  wait until something else kills it (timeout, Ctrl-C), then report
  "completed" even though nothing failed. Always `-d` for anything
  meant to keep running while you do other work.
- **The bff, not the backend, enforces CSRF.** `POST`/`PUT`/`PATCH`/
  `DELETE` through `:4001` need the `x-xsrf-token` header set to the
  `XSRF-TOKEN` cookie value, or the bff returns 403 with `"Thiếu hoặc
  sai CSRF token"` before ever reaching the backend. Hitting `:8080`
  directly skips this (and skips the cookie-based auth entirely — the
  backend expects a Bearer token, which only the bff attaches).
- **No `DELETE /api/events`.** `driver.sh smoke` creates a new event
  every run (timestamped name) and there's no API cleanup path — events
  accumulate in the local Postgres volume across repeated runs. Harmless
  for a dev DB; `docker compose down -v` wipes it if it gets noisy.
- **The seeded coordinator's access-token cookie expires after 1 hour**
  (`shms_at`, per the login sequence diagram in the root README) — a
  browser tab left logged in from an earlier session silently bounces
  back to `/login` on the next navigation. `driver.sh` is unaffected
  (fresh cookie jar per run) but a human/manual session can look "broken"
  when it's just an expired token; log in again.
- **Rebuilding only `frontend` after a source change still needs
  `--build`**, not just `up -d` — compose reuses the existing image
  otherwise and silently serves stale JS/CSS with no error.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `docker compose up` fails immediately citing `JWT_SECRET` | No root `.env`, or it's missing the var. See Prerequisites. |
| `docker: error during connect... dockerDesktopLinuxEngine` | Docker Desktop isn't running. Launch it, poll `docker info` until it succeeds (30-90s). |
| `driver.sh` hangs on `healthcheck` | One of the three isn't healthy yet — `docker compose ps` to see which; `docker compose logs backend` (usually the slow one, Spring Boot + Flyway migrations) for why. |
| Frontend shows old UI after a code change | You ran `docker compose up -d` without `--build` for the `frontend` service — it kept the old image. Rebuild that service specifically. |
| Browser tab shows the login page again after a while | 1-hour access-token cookie expired (see Gotchas) — not a bug, log in again. |
