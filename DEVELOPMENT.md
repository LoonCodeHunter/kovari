# Development

Use Node.js 20 or newer and npm 10 or newer. Install the pinned development dependencies, run the strict compiler, generate `dist`, execute behavioural tests and run all validators before committing release changes. `src` is authoritative; generated files in `dist` must match it.

The development dependencies intentionally remain normal npm packages. The portable lockfile prevents private feed URLs from being committed.
