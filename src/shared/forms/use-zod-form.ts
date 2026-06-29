import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form'
import type { z, ZodType } from 'zod'

/**
 * `useForm` pre-wired with a Zod resolver. Form value and error types are inferred from the
 * schema, so a single schema (living in `domain/`) validates the form and can also parse the
 * matching API payload (plan §4.4).
 *
 * The schema is constrained so its input/output are object shapes (RHF's `FieldValues`). Input
 * vs. output types are threaded through, so coercing/transforming schemas (e.g.
 * `z.coerce.number()`) type `handleSubmit`'s argument as the parsed output.
 */
export const useZodForm = <Schema extends ZodType<FieldValues, FieldValues>>(
  schema: Schema,
  options?: Omit<UseFormProps<z.input<Schema>, unknown, z.output<Schema>>, 'resolver'>,
): UseFormReturn<z.input<Schema>, unknown, z.output<Schema>> =>
  useForm<z.input<Schema>, unknown, z.output<Schema>>({
    ...options,
    resolver: zodResolver(schema),
  })
