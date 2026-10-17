# Registry portability

The project-level `.npmrc` selects the public npm registry for both unscoped and `@kovari` packages. The lockfile records exact versions and integrity values but deliberately does not record tarball `resolved` URLs. This prevents a custom feed used by one development machine from becoming a hard-coded download origin for another machine.

Run `npm config get registry` and `npm run validate:lock` when diagnosing installation behaviour.
