# 14 — Testing Your Feature

Goal: test a feature at two levels — fast unit/integration tests (Vitest + Testing Library) and a
real-browser smoke flow (Playwright). Both run against **the same MSW handlers** you wrote in
guide 05, just through different entry points.

## Unit / integration: Vitest + RTL + MSW (Node)

Render components through `src/test/test-utils.tsx`, which wraps them in the providers they need —
a **fresh** QueryClient (isolated cache per render) and a `MemoryRouter`:

```tsx
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'

it('shows Zod validation errors for invalid input', async () => {
  const user = userEvent.setup()
  renderWithProviders(<DemoForm />)

  await user.type(screen.getByLabelText('Email'), 'not-an-email')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
})
```

For hooks, pass `AllProviders` as the `wrapper` and assert on the resolved state — the network is
real MSW, not a stub:

```tsx
const { result } = renderHook(() => useHealthQuery(), { wrapper: AllProviders })
await waitFor(() => expect(result.current.isSuccess).toBe(true))
```

**The network is MSW via `setupServer`** (Node, no service worker). `src/test/setup.ts` wires it
globally:

- `server.listen({ onUnhandledRequest: 'error' })` — a request with no handler **fails the test**,
  so gaps can't pass silently.
- `afterEach` runs `cleanup()`, `server.resetHandlers()`, and `resetDb()` — every test starts from
  the same seeded data.

Two habits to keep:

- **Test behavior, not implementation.** Query by role/label/text like a user; assert on what's on
  screen, not on internal state.
- **Reset global stores you mutate.** Zustand stores are module singletons (no provider), so a
  test that writes to one should reset it in `beforeEach` to avoid leaking into the next test.

Override a handler for one test (e.g. force a `500`) with `server.use(...)` inside the test — it's
reverted by the `afterEach` `resetHandlers()`.

```bash
npm test          # run once
npm run test:watch
```

## End-to-end: Playwright

The smoke flow drives **headless Chromium against the dev server**, which serves MSW's **browser**
worker — never `setupServer`, never the shipped `dist` (which has no backend). `playwright.config.ts`
starts `npm run dev` for you and points `baseURL` at `localhost:5173`. A fresh browser context per
test means a clean session each time.

```ts
test('admin can log in and reach the users grid', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
})
```

Keep E2E for **critical paths** (auth gate, a core flow), not exhaustive coverage — that's the
unit/integration layer's job.

```bash
npm run e2e
```

> **Rules in play:** one set of MSW handlers, two entry points — `setupServer` for Vitest (Node),
> the browser worker for dev/Playwright. Never run E2E against `dist`. ([`AGENTS.md`](../../AGENTS.md)
> §4, Testing.)

---

**Next →** [15 — Connect a Real Backend](./15-connect-a-real-backend.md)
