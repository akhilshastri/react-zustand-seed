import { AppProviders } from '@/app/providers'

// Composition root only — every provider and the router live in AppProviders (plan §3).
export const App = () => <AppProviders />
