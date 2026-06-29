import { http, HttpResponse } from 'msw'

import { db } from '../db'

/**
 * Sample resource handler proving the MSW backend serves the app. Real resource handlers
 * (auth, users) arrive in later phases — each new `*.ts` file in this folder is auto-registered
 * by `handlers/index.ts`, so adding a resource never edits a shared registry (plan §5).
 */
export default [
  http.get('/api/health', () =>
    HttpResponse.json({
      status: 'ok',
      uptimeMs: Date.now() - db.startedAt,
      time: new Date().toISOString(),
    }),
  ),
]
