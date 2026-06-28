import { create, type StateCreator } from 'zustand'
import { devtools, persist, type PersistOptions } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Standard middleware stack so every store behaves the same:
//   devtools (named, dev-only) → [persist] → immer (mutable `set` recipes).
// Components select narrow slices; actions are methods on the store (plan §4.1).
const isDev = import.meta.env.DEV

/** Initializer for a non-persisted store. `set` accepts an immer recipe + devtools action name. */
export type StoreInitializer<T> = StateCreator<
  T,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  T
>

export const createStore = <T>(name: string, initializer: StoreInitializer<T>) =>
  create<T>()(devtools(immer(initializer), { name, enabled: isDev }))

/** Initializer for a persisted store (adds the persist mutator between devtools and immer). */
export type PersistedStoreInitializer<T> = StateCreator<
  T,
  [['zustand/devtools', never], ['zustand/persist', unknown], ['zustand/immer', never]],
  [],
  T
>

export const createPersistedStore = <T, Persisted = T>(
  name: string,
  initializer: PersistedStoreInitializer<T>,
  persistOptions?: Omit<PersistOptions<T, Persisted>, 'name'>,
) =>
  create<T>()(
    devtools(persist(immer(initializer), { name, ...persistOptions }), { name, enabled: isDev }),
  )
