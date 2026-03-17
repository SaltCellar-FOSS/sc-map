# Tools

- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime
- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Web application framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Linting**: [ESLint](https://eslint.org/) with [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte)
- **Formatting**: [Prettier](https://prettier.io/) with [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte)
- **Testing**: Bun's built-in test runner
- **Pre-commit Hooks**: [prek](https://github.com/j178/prek)

# Code Quality

- TypeScript, ESLint, and Prettier warnings are not allowed. All code must be warning-free.
- Synchronous functions should use the `Result` type defined in @src/lib/result.ts. Do not throw errors outside of asynchronous functions.
