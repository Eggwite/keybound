# Preparing a release

Nothing publishes on push or tag creation. The manual **Prepare release** workflow validates the project, uploads the npm tarball, and creates a **draft** GitHub release. Its `publish` input defaults to false. Registry publishing additionally requires `NPM_PUBLISH_ENABLED=true` and the `npm-release` GitHub environment.

Before the first publication:

1. Confirm ownership and availability of `react-keybound`. The original `keybound` npm name belongs to another package. Update package names, import examples and workspace references together if needed.
2. Confirm repository metadata points to `Eggwite/keybound`, review MIT ownership and enable private vulnerability reporting.
3. Run `npm ci`, `npm run check`, and `npm run format:check`. Review `docs/AUDIT.md`, including manual browser checks. Bump package and local workspace references together; regenerate the lockfile and changelog.
4. Inspect `npm pack --dry-run --workspace react-keybound`; only dist, README and LICENSE should ship. Check the actual tarball in a consumer before publishing.
5. Set up the first npm package publication under the intended owner. Configure npm's GitHub trusted publisher for `Eggwite/keybound`, workflow `release.yml`, environment `npm-release`. Configure required reviewers for that GitHub environment. Trusted publishing requires a supported npm version; the workflow uses npm 11.
6. Run **Prepare release** with publishing off. Review its draft, version/tag and attached tarball. After ownership and trusted publishing are verified, enable `NPM_PUBLISH_ENABLED`, then deliberately run the publication path. Do not use an unreviewed build or leave a registry token in the repo.

The draft job creates a version tag as part of release preparation. A same-version rerun should reuse/edit or remove the existing draft deliberately before retrying; the workflow fails instead of silently replacing a release. npm versions are immutable. The workflow never automatically promotes a GitHub draft to public.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for registry setup details. No npm credentials or remote publishing actions were performed during initial implementation.
