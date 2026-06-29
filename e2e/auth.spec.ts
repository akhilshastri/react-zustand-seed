import { expect, test } from '@playwright/test'

// Smoke E2E (plan §5): the auth gate + login + reaching the users grid, all against the MSW
// browser worker served by the dev server. A fresh browser context per test = a clean session.

test('unauthenticated visitor is redirected to the login page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('admin can log in and reach the users grid', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email').fill('admin@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Lands on the dashboard for the signed-in user.
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()

  // Navigate to the role-gated users grid (server-driven against MSW).
  await page.getByRole('link', { name: 'Users' }).click()
  await expect(page).toHaveURL(/\/users$/)
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  await expect(page.getByText(/\d+ total/)).toBeVisible()
})
