/**
 * Typed route paths — the single source of truth for navigation. Components and the router
 * reference these constants instead of stringly-typed literals (plan §4.3). Parameterized
 * routes get a builder here later (e.g. `userDetail: (id) => \`/users/${id}\``).
 */
export const paths = {
  home: '/',
  // login: '/login' — added in Phase 2 with the auth feature + route guards.
} as const

export type AppPath = (typeof paths)[keyof typeof paths]
