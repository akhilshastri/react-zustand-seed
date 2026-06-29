import { useState } from 'react'
import { z } from 'zod'

import { FormField, useZodForm } from '@/shared/forms'
import { Button } from '@/shared/ui/button'

// Zod v4: string formats are top-level helpers (`z.email()`), not `z.string().email()`.
const demoSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
  email: z.email('Enter a valid email'),
})

/** Sample client form — validates with Zod via the shared RHF helpers (plan §4.4). */
export const DemoForm = () => {
  const form = useZodForm(demoSchema, { defaultValues: { name: '', email: '' } })
  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <form
      onSubmit={form.handleSubmit((values) => setSubmitted(`${values.name} <${values.email}>`))}
      className="max-w-sm space-y-4"
      noValidate
    >
      <FormField control={form.control} name="name" label="Name" placeholder="Ada Lovelace" />
      <FormField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        placeholder="ada@example.com"
      />
      <Button type="submit">Submit</Button>
      {submitted ? <p className="text-muted-foreground text-sm">Submitted: {submitted}</p> : null}
    </form>
  )
}
