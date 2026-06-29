import { Can, useAuth } from '@/features/auth'

import { DemoForm } from './demo-form'
import { useHealthQuery } from './use-health-query'

/**
 * Authenticated dashboard. Demonstrates the Phase 1 integrations (server state + RHF/Zod form)
 * plus Phase 2 auth/RBAC: a greeting for the signed-in user and a `<Can>`-gated admin panel.
 */
export const HomePage = () => {
  const { user } = useAuth()
  const health = useHealthQuery()

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Welcome{user ? `, ${user.name}` : ''}</h1>
        <p className="text-muted-foreground">
          Signed in as <span className="font-mono">{user?.email}</span> · roles{' '}
          <span className="font-mono">{user?.roles.join(', ')}</span>.
        </p>
      </section>

      <Can permission="users:delete">
        <section className="border-destructive/40 bg-destructive/5 space-y-1 rounded-md border p-4">
          <h2 className="font-medium">Admin-only panel</h2>
          <p className="text-muted-foreground text-sm">
            Visible only to roles with <code>users:delete</code>. Hidden for managers and viewers.
          </p>
        </section>
      </Can>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Server state — TanStack Query + MSW</h2>
        {health.isPending ? (
          <p className="text-muted-foreground text-sm">Checking backend…</p>
        ) : health.isError ? (
          <p className="text-destructive text-sm">Backend error: {health.error.message}</p>
        ) : (
          <p className="text-sm">
            Backend status: <span className="font-mono">{health.data.status}</span> (uptime{' '}
            {Math.round(health.data.uptimeMs)}ms)
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Client form — React Hook Form + Zod</h2>
        <DemoForm />
      </section>
    </div>
  )
}
