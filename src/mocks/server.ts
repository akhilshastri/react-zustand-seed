import { setupServer } from 'msw/node'

import { handlers } from './handlers'

/** Node server — serves the same mocked REST to Vitest (no service worker; plan §4.8). */
export const server = setupServer(...handlers)
