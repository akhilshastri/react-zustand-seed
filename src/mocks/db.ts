/**
 * In-memory "database" for the MSW backend (plan §3 — MSW *is* the backend).
 *
 * Phase 3 seeds real collections here (users, etc.); for now it only records when the mock
 * backend booted so `/health` can report uptime. Resetting between tests will clear/reseed
 * this object.
 */
export const db = {
  startedAt: Date.now(),
}
