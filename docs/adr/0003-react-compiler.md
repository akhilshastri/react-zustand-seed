# 0003 — React Compiler via `@rolldown/plugin-babel`

**Status:** Accepted

## Context

`@vitejs/plugin-react` v6 dropped its internal Babel (JSX + Fast Refresh now run in oxc/Rust). The
familiar `react({ babel: { plugins: [...] } })` form therefore **does not run the React Compiler**
on Vite 8 — the compiler still needs a Babel pass.

## Decision

Run `babel-plugin-react-compiler` through a separate `@rolldown/plugin-babel` pass. Plugin order
is **`react()` first, then the babel/compiler pass** (the react.dev order, not the blog's
babel-first). Compiler lint rules ship via `eslint-plugin-react-hooks`.

Confirmed active in Phase 1: the transformed output imports `react/compiler-runtime` and each
component opens with `const $ = _c(n)` (a memo cache), while Fast Refresh still works.

## Consequences

- **Write plain React** — no hand-added `useMemo` / `useCallback` / `React.memo`.
- The compiler **safely bails** on components that use an incompatible-library hook — e.g.
  `DataGrid` (TanStack Table's `useReactTable`), which the `react-hooks/incompatible-library` rule
  flags and which is suppressed with an explanatory disable. TanStack Table memoises itself;
  correctness is unaffected and the rest of the app stays optimised.
- An escape hatch (drop the babel plugin → compiler off, app identical but unmemoised) exists for
  the bleeding-edge toolchain, but was **not** needed.
