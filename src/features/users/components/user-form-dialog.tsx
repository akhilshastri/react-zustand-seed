import { useEffect } from 'react'
import { Controller } from 'react-hook-form'

import { ROLES } from '@/domain/rbac'
import { userInputSchema, type User } from '@/domain/user'
import { FormField, useZodForm } from '@/shared/forms'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'

import { useCreateUser, useUpdateUser } from '../api/use-user-mutations'

interface UserFormDialogProps {
  open: boolean
  /** `null` → create; a user → edit. */
  user: User | null
  onClose: () => void
}

/** Create/edit user dialog (RHF + Zod). The same schema validates the form and the API body. */
export const UserFormDialog = ({ open, user, onClose }: UserFormDialogProps) => {
  const isEdit = user !== null
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const form = useZodForm(userInputSchema, {
    defaultValues: { name: '', email: '', role: 'viewer' },
  })

  // Sync the form to the dialog's subject whenever it (re)opens.
  useEffect(() => {
    if (!open) return
    form.reset(
      user
        ? { name: user.name, email: user.email, role: user.roles[0] ?? 'viewer' }
        : { name: '', email: '', role: 'viewer' },
    )
  }, [open, user, form])

  const pending = createUser.isPending || updateUser.isPending
  const error = createUser.error ?? updateUser.error

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = () => onClose()
    if (user) updateUser.mutate({ id: user.id, input: values }, { onSuccess })
    else createUser.mutate(values, { onSuccess })
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit user' : 'New user'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user’s details.' : 'Add a user to the directory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField control={form.control} name="name" label="Name" placeholder="Ada Lovelace" />
          <FormField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="ada@example.com"
          />
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <select
                  id="role"
                  className="border-input h-9 rounded-md border bg-transparent px-3 text-sm capitalize shadow-xs"
                  {...field}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {error ? <p className="text-destructive text-sm">{error.message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
