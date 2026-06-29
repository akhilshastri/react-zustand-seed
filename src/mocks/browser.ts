import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

/** Browser worker — serves mocked REST in dev and Playwright (plan §4.8). */
export const worker = setupWorker(...handlers)
