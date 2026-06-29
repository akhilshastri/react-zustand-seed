import {
  Close as DialogPrimitiveClose,
  Content as DialogPrimitiveContent,
  Description as DialogPrimitiveDescription,
  Overlay as DialogPrimitiveOverlay,
  Portal as DialogPrimitivePortal,
  Root as Dialog,
  Title as DialogPrimitiveTitle,
  Trigger as DialogTrigger,
} from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/cn'

// shadcn/ui "new-york" Dialog (canonical upstream form — see Button note).
const DialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitiveContent>) => (
  <DialogPrimitivePortal>
    <DialogPrimitiveOverlay
      data-slot="dialog-overlay"
      className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
    />
    <DialogPrimitiveContent
      data-slot="dialog-content"
      className={cn(
        'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg duration-200',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitiveClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none">
        <XIcon className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitiveClose>
    </DialogPrimitiveContent>
  </DialogPrimitivePortal>
)

const DialogHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-header"
    className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="dialog-footer"
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
)

const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitiveTitle>) => (
  <DialogPrimitiveTitle
    data-slot="dialog-title"
    className={cn('text-lg leading-none font-semibold', className)}
    {...props}
  />
)

const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitiveDescription>) => (
  <DialogPrimitiveDescription
    data-slot="dialog-description"
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
)

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
