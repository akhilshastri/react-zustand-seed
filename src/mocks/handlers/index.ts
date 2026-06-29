import type { RequestHandler } from 'msw'

/**
 * Convention-based handler discovery (plan §5). Every `*.ts` file in this folder
 * default-exports an array of MSW handlers and is auto-collected here — adding a resource means
 * adding a file, with no edits to a shared registry. This file excludes itself from the glob.
 */
const modules = import.meta.glob<RequestHandler[]>('./*.ts', {
  eager: true,
  import: 'default',
})

export const handlers: RequestHandler[] = Object.entries(modules)
  .filter(([path]) => path !== './index.ts')
  .flatMap(([, moduleHandlers]) => moduleHandlers ?? [])
