# Contributing

Use Node 22.12+ and npm. Clone the repository, then:

```sh
npm ci
npm run dev
```

`dev` builds the package, watches its sources, and starts the Next.js playground. Compiler/config changes may require restarting Next. The application imports the built workspace package, so package boundary failures surface during development.

Before a pull request:

```sh
npm run check
npm run format:check
```

`check` runs lint, strict TypeScript, behavioral tests, production consumer builds and package validation. No coverage percentage target. Add the smallest regression case that demonstrates a behavior bug; exercise public behavior rather than copying the implementation into assertions. JSDOM has no layout: test setup supplies explicit rectangles, and claims must distinguish DOM simulation from browser verification.

The package lives in `packages/react-keybound`; the Next demo in `apps/web`; the Vite consumer in `fixtures/vite`. Read [the specification](docs/SPEC.md) and [implementation guide](docs/IMPLEMENTATION.md) before changing dispatch/compiler behavior. Public API changes should update the three user docs pages and changelog in the same pull request.

Prefer native DOM semantics, small modules, explicit configuration and accurate errors. Keep diagnostics non-blocking and suppressible. Do not add runtime dependencies for compiler or website features. Do not add speculative compatibility code or refactor unrelated files.

Pull requests should describe the concrete trigger, resulting behavior and verification. Include accessibility/SSR implications when relevant. Maintainers handle versioning and releases; contributors do not need registry credentials.
