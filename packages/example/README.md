# @r8s/example

Template package for new r8s operator integrations. **Not published to npm** —
it exists to be copied, read, and kept compiling in CI so it never drifts from
reality.

## Usage

```bash
cp -r packages/example packages/my-operator
```

Then, in the new directory:

1. `package.json` — rename `@r8s/example` → `@r8s/my-operator`, write a real
   `description`, set `keywords` and `r8s.category`, and remove `"private": true`
2. `src/index.ts` — replace the operator declaration and the `Widget` component
3. `__tests__/` — replace with tests for your components
4. Register the package (root `tsconfig.json` paths + references) — see the
   full guide: https://r8s.berget.ai/adding-packages
