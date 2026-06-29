/**
 * Typed route paths — the single source of truth for navigation (plan §4.3). Lives in `shared/`
 * (not `app/`) so features can navigate by constant without importing the app layer, keeping the
 * dependency direction intact (app → features → shared). Parameterized routes get a builder here.
 */
export const paths = {
  home: '/',
  login: '/login',
  users: '/users',
} as const

export type AppPath = (typeof paths)[keyof typeof paths]
