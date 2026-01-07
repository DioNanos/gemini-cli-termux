# MCP SDK Type Shims (Termux Build)

**Purpose**: Work around missing TypeScript declarations in
`@modelcontextprotocol/sdk` for the Termux build, so `tsc --build` succeeds
under strict settings.

## Problem

The MCP SDK package currently ships JS modules without `.d.ts` declarations in
our environment, which causes TypeScript errors (TS7016/TS2339/TS2722) during
CLI/core builds.

## Patch Summary

We add minimal local `.d.ts` shims that cover only the APIs this fork uses.
These shims are **type-only** and **do not change runtime behavior**.

## Files

- `packages/core/src/types/mcp-sdk-shims.d.ts`
- `packages/cli/src/types/mcp-sdk-shims.d.ts`

## Notes

- Keep the shim surface aligned with actual usage in core/cli.
- Remove this patch once upstream ships proper TypeScript declarations for the
  SDK (or once our build can consume them directly).
