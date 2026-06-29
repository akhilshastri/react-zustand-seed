/**
 * Plop scaffolder (plan §5). Three core generators — `domain`, `feature`, `mock` — with
 * templates in `plop-templates/`. Generated files are TypeScript; this config is ESM JS so plop
 * loads it natively (no TS loader). MSW handlers auto-register via the `handlers/` import.meta.glob,
 * so there is no string-injection codegen.
 *
 * Run: `npm run gen <generator> <name>` (e.g. `npm run gen feature billing`).
 *
 * @param {import('plop').NodePlopAPI} plop
 */
export default function (plop) {
  const namePrompt = {
    type: 'input',
    name: 'name',
    message: 'Name (kebab-case, e.g. "billing" or "audit-log"):',
    validate: (value) =>
      /^[a-z][a-z0-9-]*$/.test(value) || 'Use kebab-case: lowercase letters, digits, hyphens.',
  }

  plop.setGenerator('domain', {
    description: 'A domain entity: Zod schema + inferred type + barrel.',
    prompts: [namePrompt],
    actions: [
      {
        type: 'add',
        path: 'src/domain/{{kebabCase name}}/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/domain/entity.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/domain/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/domain/index.ts.hbs',
      },
      (answers) =>
        `  ↳ add \`export * from './${plop.getHelper('kebabCase')(answers.name)}'\` to src/domain/index.ts`,
    ],
  })

  plop.setGenerator('feature', {
    description: 'A vertical feature slice (api + store + page + types) plus an MSW handler.',
    prompts: [namePrompt],
    actions: [
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/types/{{kebabCase name}}.types.ts',
        templateFile: 'plop-templates/feature/types.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/api/{{kebabCase name}}-keys.ts',
        templateFile: 'plop-templates/feature/keys.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/api/use-{{kebabCase name}}-list.ts',
        templateFile: 'plop-templates/feature/use-list.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/store/{{kebabCase name}}-store.ts',
        templateFile: 'plop-templates/feature/store.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/components/{{kebabCase name}}-page.tsx',
        templateFile: 'plop-templates/feature/page.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/feature/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/mocks/handlers/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/feature/handler.ts.hbs',
      },
      (answers) =>
        `  ↳ add a route for ${plop.getHelper('pascalCase')(answers.name)}Page in src/app/router/routes.tsx (the guarded data-router needs explicit placement)`,
    ],
  })

  plop.setGenerator('mock', {
    description: 'An MSW handler for a resource (auto-wired via the handlers glob).',
    prompts: [namePrompt],
    actions: [
      {
        type: 'add',
        path: 'src/mocks/handlers/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/mock/handler.ts.hbs',
      },
    ],
  })
}
