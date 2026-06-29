import { Navigate, useLocation } from 'react-router'

import { loginCredentialsSchema } from '@/domain/auth'
import { paths } from '@/shared/config/paths'
import { FormField, useZodForm } from '@/shared/forms'
import { Button } from '@/shared/ui/button'

import { useLogin } from '../api/use-login'
import { useAuth } from '../hooks/use-auth'

/** Login page (RHF + Zod). On success, returns the user to where they were headed (plan §4.6). */
export const LoginPage = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const login = useLogin()
  const form = useZodForm(loginCredentialsSchema, {
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) return <Navigate to={paths.home} replace />

  const from = (location.state as { from?: string } | null)?.from ?? paths.home

  // Errors land on login.error (mutate doesn't throw); success flips login.isSuccess.
  const onSubmit = form.handleSubmit((values) => login.mutate(values))

  if (login.isSuccess) return <Navigate to={from} replace />

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground text-sm">Use a seeded account to continue.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
        />
        <FormField
          control={form.control}
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="password"
        />
        {login.isError ? <p className="text-destructive text-sm">{login.error.message}</p> : null}
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-xs">
        Seeded accounts: admin@example.com · manager@example.com · viewer@example.com — password
        “password”.
      </p>
    </div>
  )
}
