# Testing strategy

The quality pipeline checks TypeScript without emitting, compiles from a clean `dist`, runs unit and integration tests, validates source modules, metadata, image dimensions, export targets, lockfile portability and local publication configuration, then inspects both pack and publish dry-runs. CI repeats the release check on supported operating systems and Node versions.
