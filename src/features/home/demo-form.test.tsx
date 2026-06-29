import { describe, expect, it } from 'vitest'

import { renderWithProviders, screen, userEvent } from '@/test/test-utils'

import { DemoForm } from './demo-form'

describe('DemoForm', () => {
  it('shows Zod validation errors for invalid input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DemoForm />)

    await user.type(screen.getByLabelText('Name'), 'A')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText('At least 2 characters')).toBeInTheDocument()
    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument()
  })

  it('submits when the input is valid', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DemoForm />)

    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(await screen.findByText(/Submitted: Ada Lovelace/)).toBeInTheDocument()
  })
})
