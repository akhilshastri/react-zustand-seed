import { type HTMLInputTypeAttribute } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

import { cn } from '@/shared/lib/cn'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface FormFieldProps<TValues extends FieldValues> {
  control: Control<TValues>
  name: FieldPath<TValues>
  label?: string
  type?: HTMLInputTypeAttribute
  placeholder?: string
  autoComplete?: string
  className?: string
}

/**
 * A controlled text field bound to React Hook Form. Pairs the shadcn `Input` + `Label` with
 * inline error display and the matching `aria-invalid` / `aria-describedby` wiring (plan §4.4).
 * Composite fields (selects, checkboxes) follow the same Controller pattern.
 */
export const FormField = <TValues extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  className,
}: FormFieldProps<TValues>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => {
      const errorId = `${name}-error`
      return (
        <div className={cn('grid gap-2', className)}>
          {label ? <Label htmlFor={name}>{label}</Label> : null}
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.error ? errorId : undefined}
            {...field}
          />
          {fieldState.error ? (
            <p id={errorId} className="text-destructive text-sm">
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )
    }}
  />
)
