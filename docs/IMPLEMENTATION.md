# Implementation guide

1. Keep `core` pure: mnemonic parsing, key parsing, normalization and key matching. Preserve original display text; separate keyboard normalization from presentation.
2. Put committed registrations in one provider-owned registry. The dispatcher filters current DOM eligibility, then scope/modal eligibility, then sorts peers. Only the selected binding runs. Hooks, wrappers and compiler-generated code all reach this path.
3. Scope records exist independently of bindings so an empty modal can block background actions. React context carries ancestry across portals. Activation order must update when a mounted modal reopens.
4. Hooks provide native props and a rendered label. Wrappers compose refs and preserve native handlers. Keep headless library-specific behavior at the explicit action callback boundary.
5. Overlay is a separate optional export using the same registry and eligibility rules. Poll positions only while visible; cancel every frame on close/unmount. Decorative hints must not intercept keyboard or pointer use.
6. Compiler emits ordinary wrappers/imports; no runtime DOM mutation, app-wide JSX type changes, or React internals. Preserve directives and import hygiene. Test generated code by actually rendering it and building consumer applications.
7. Build separate ESM entries for client, pure core and Babel plugin. Keep React external; preserve `use client` only where appropriate. Publish declarations and optional CSS through explicit exports. Smoke-test the npm tarball rather than only source aliases.
8. Demo composes small Next components on Tailwind/shadcn primitives. Use the actual workspace package; compile its plain JSX mnemonic example. Highlight code with sugar-high. Controls must do what their labels promise, and all demo state stays local.
9. Write quickstart, behavior and customization docs alongside their implementation. Record deliberate scope limits. CI covers Node/React support, lint, types, behavioral tests, build, exports and package consumers; manual releases produce reviewable artifacts without publishing by default.
10. Audit end to end: declaration -> compiler -> registration -> eligibility -> dispatch -> action -> hints -> cleanup. Verify documentation against implementation and mark evidence in `AUDIT.md`; do not inflate test claims.

## Architecture boundaries

`core` <- runtime registry/provider <- hooks/wrappers <- app

`core` <- Babel plugin -> generated runtime wrappers

registry + DOM eligibility <- optional overlay

The website never becomes a dependency of the package. Test-only layout mocks never become production fallbacks.

## Release setup

Initial package name is `react-keybound`; verify availability and ownership again before first publish. Repository metadata matches the existing `Eggwite/keybound` remote. Configure the GitHub environment and npm trusted publisher, then explicitly enable the publishing workflow. A dry-run tarball and draft GitHub release are the default.
