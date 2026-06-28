import { z } from 'zod'

/**
 * Typed, validated access to client env vars (Vite exposes only `VITE_`-prefixed ones).
 * Parsed once at startup; a misconfigured env fails fast here instead of deep in the app.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_APP_NAME: z.string().min(1).default('React Zustand Seed'),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse(import.meta.env)
