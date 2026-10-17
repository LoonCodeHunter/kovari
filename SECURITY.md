# Security

Treat prompts, repository files, generated text, tool arguments, protocol payloads and process output as untrusted. Apply least privilege, narrow workspace roots, validated resource limits, cancellation and policy checks. Product hosts should maintain explicit command allow-lists and human approval for destructive actions.

## Supply chain
Do not commit npm credentials or private registry URLs. Review `package-lock.json` changes. Run the lockfile validator and inspect the npm pack dry-run before publishing.
