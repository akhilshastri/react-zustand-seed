import { DemoForm } from './demo-form'
import { useHealthQuery } from './use-health-query'

/**
 * Phase 1 acceptance demo: server state (TanStack Query → MSW) and client form (RHF + Zod)
 * on one routed, themed page — the integrations wired across Phase 1.
 */
export const HomePage = () => {
  const health = useHealthQuery()

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="text-muted-foreground">Phase 1 core integrations are live.</p>
      </section>

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
