import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional class names and dedupe conflicting Tailwind utilities (shadcn convention). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
