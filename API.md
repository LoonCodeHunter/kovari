# Kovari API

The `exports` map in `package.json` is the supported compatibility boundary. The root import composes the primary SDK. Focused subpaths expose individual capabilities for applications that do not need the complete SDK. Consumers must not import private paths inside `dist`.

## Contract design
Public inputs and outputs use explicit interfaces. Long-running operations support cancellation where appropriate. Effectful operations are asynchronous. Structured results keep UI, persistence and transport choices outside the package. Generated declarations are produced by the same TypeScript compiler pass as the runtime JavaScript.
