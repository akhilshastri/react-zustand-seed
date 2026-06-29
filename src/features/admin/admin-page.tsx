/**
 * Admin landing page. The route is gated by `RequireRole permission="users:delete"` (admin
 * only); the MSW backend independently enforces admin-only operations with 403s (plan §4.6).
 */
export const AdminPage = () => (
  <div className="space-y-2">
    <h1 className="text-2xl font-semibold">Admin</h1>
    <p className="text-muted-foreground">
      You can see this page because your role grants <code>users:delete</code>. Managers and viewers
      are redirected away.
    </p>
  </div>
)
