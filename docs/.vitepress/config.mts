import { defineConfig } from 'vitepress'

// VitePress config for the how-to docs site, deployed to GitHub Pages.
// `base` must match how the site is served:
//   • Project pages (default): https://<owner>.github.io/react-zustand-seed/  → '/react-zustand-seed/'
//   • User/org pages or a custom domain (https://<owner>.github.io/ or docs.example.com) → '/'
export default defineConfig({
  title: 'React Zustand Seed',
  description: 'How-to guides for the enterprise React + Zustand + Vite seed — basic to advanced.',
  base: '/react-zustand-seed/',
  cleanUrls: true,
  lastUpdated: true,

  // Repo-root files (AGENTS.md, plan/) live outside the docs site, so links up to them
  // (../../) are valid on GitHub but not part of the published site — skip them in the checker.
  ignoreDeadLinks: [/\.\.\/\.\.\//],

  // Serve the GitHub-facing README.md files as section indexes on the site (keeps both happy).
  rewrites: {
    'how-to/README.md': 'how-to/index.md',
    'adr/README.md': 'adr/index.md',
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'How-To', link: '/how-to/' },
    ],

    sidebar: {
      '/how-to/': [
        {
          text: 'Tier 1 — Basics',
          items: [
            { text: 'Overview', link: '/how-to/' },
            { text: '00 — Get Started', link: '/how-to/00-get-started' },
            { text: '01 — Generate a Feature', link: '/how-to/01-generate-a-feature' },
            { text: '02 — Customize the Page', link: '/how-to/02-customize-the-page' },
            { text: '03 — Create a Domain Entity', link: '/how-to/03-create-a-domain-entity' },
            { text: '04 — Wire Routing', link: '/how-to/04-wire-routing' },
            { text: '05 — Mock the Backend', link: '/how-to/05-mock-the-backend' },
          ],
        },
        {
          text: 'Tier 2 — Core patterns',
          items: [
            { text: '06 — Client State (Zustand)', link: '/how-to/06-client-state-zustand' },
            { text: '07 — Server State (Query)', link: '/how-to/07-server-state-query' },
            { text: '08 — Forms (RHF + Zod)', link: '/how-to/08-forms-rhf-zod' },
            { text: '09 — The DataGrid', link: '/how-to/09-data-grid' },
          ],
        },
        {
          text: 'Tier 3 — Advanced',
          items: [
            { text: '10 — Auth & RBAC', link: '/how-to/10-auth-and-rbac' },
            { text: '11 — Cross-Store Reactions', link: '/how-to/11-cross-store-reactions' },
            { text: '12 — Advanced Routing', link: '/how-to/12-advanced-routing' },
            { text: '13 — Theming & PWA', link: '/how-to/13-theming-and-pwa' },
            { text: '14 — Testing', link: '/how-to/14-testing-your-feature' },
            { text: '15 — Real Backend', link: '/how-to/15-connect-a-real-backend' },
          ],
        },
      ],
    },

    search: { provider: 'local' },
    outline: 'deep',
  },
})
