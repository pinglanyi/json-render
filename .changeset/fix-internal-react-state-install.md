---
"@json-render/react": patch
"@json-render/react-pdf": patch
"@json-render/react-native": patch
---

Fix install failure caused by `@internal/react-state` (a private workspace package) being listed as a published dependency. The internal package is now bundled into each renderer's output at build time, so consumers no longer need to resolve it from npm.
