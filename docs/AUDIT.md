# Implementation audit

Audited 2026-09-06 against [the 0.1 specification](SPEC.md).

## Result

The compiler, React runtime, framework adapters, package exports, demo, docs and release scaffolding meet the 0.1 scope. The package is ready for repository review and prerelease testing. Publishing remains disabled until npm ownership and trusted publishing are configured.

## Evidence

- ESLint, strict TypeScript and Prettier pass across the workspace.
- Vitest passes 30 focused parser, compiler and runtime cases on React 19. The same suite passes on React 18.3.
- Tests cover compile output and metadata, Unicode and escapes, dynamic annotations, warnings, hidden and disabled targets, editable input, cancelled and composing events, AltGr, repeat filtering, committed updates, Strict Mode refs, native controls, portal modal priority, SSR, customizable overlays and an installed Radix Select adapter.
- Next.js 16.3.4 production builds pass with Turbopack and Webpack. The Vite 7.3.6 fixture builds and emits its manifest.
- `publint`, export loading and a TypeScript consumer compiled from the npm tarball pass. The package contains 28 files: 71,994 bytes packed and 330,803 bytes unpacked.
- The client runtime is 7,665 bytes gzip, below the enforced 16 KiB budget. React stays external; compiler and pure-core entries remain separate.
- Production dependency audit reports zero known vulnerabilities.

## Findings resolved during audit

- Compiler rules were limited to application source so Next no longer transforms dependencies or duplicates file extensions.
- JSX whitespace, directives, dynamic expressions, label inference and malformed shortcut diagnostics gained regression coverage.
- The compiler declares Babel as a normal dependency; a fresh compiler-first install has no hidden peer requirement.
- The package check now installs the packed artifact through its public exports and verifies opt-in JSX typing.
- The loader uses a CommonJS TypeScript source extension, removing its build-format warning.
- React 18 and 19 ref behavior is handled explicitly.
- Help refresh is event-driven while overlay geometry polls only while visible.
- Runtime development warnings now detect both Node/Next and Vite development builds.

## Release limits

- The full development graph has one low-severity advisory in `esbuild@0.27.7`, inherited from current build tooling. It does not affect package consumers or production dependencies. Avoid exposing a Windows development server to untrusted clients; update once the toolchain accepts the patched esbuild line.
- Real-browser layout, OS-reserved shortcuts, screen-reader output and WebKit behavior remain manual prerelease checks. No browser automation was used for this audit.
- Recheck the provisional `react-keybound` npm name and configure the protected `npm-release` GitHub environment before enabling publish.
