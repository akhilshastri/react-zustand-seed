# Architecture Decision Records

Short, durable records of the decisions that shape this seed. The full rationale and the phased
build history are in [`plan/01-enterprise-app-plan.md`](../../plan/01-enterprise-app-plan.md).

| #                                           | Decision                                             | Status   |
| ------------------------------------------- | ---------------------------------------------------- | -------- |
| [0001](0001-state-separation.md)            | State separation — TanStack Query vs Zustand         | Accepted |
| [0002](0002-msw-as-the-backend.md)          | MSW is the backend (dev + tests, no real server)     | Accepted |
| [0003](0003-react-compiler.md)              | React Compiler via `@rolldown/plugin-babel`          | Accepted |
| [0004](0004-cross-store-direct-bindings.md) | Cross-store comms via direct bindings (no event bus) | Accepted |
| [0005](0005-auth-security-defaults.md)      | Auth security defaults                               | Accepted |
| [0006](0006-installable-shell-pwa.md)       | Installable-shell PWA (no offline data)              | Accepted |
| [0007](0007-feature-sliced-architecture.md) | Feature-Sliced architecture + dependency direction   | Accepted |

Each record follows **Context / Decision / Consequences**.
