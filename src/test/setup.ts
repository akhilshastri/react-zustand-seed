import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetDb } from '@/mocks/db'
import { server } from '@/mocks/server'

// MSW is the shared mock backend for tests too — here via setupServer (Node, no service worker).
// `onUnhandledRequest: 'error'` turns a missing handler into a failing test, not a silent miss.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
})

afterAll(() => {
  server.close()
})
