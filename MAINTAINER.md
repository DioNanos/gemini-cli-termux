# Maintainer

Gemini CLI Termux is maintained by **Davide A. Guglielmi** (GitHub:
[DioNanos](https://github.com/DioNanos)) as the porting / distribution
maintainer for Android ARM64 (Termux).

This is **not** an independent fork — Gemini CLI Termux tracks
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) closely
and carries only the Android/Termux compatibility delta needed to run it on
Termux.

## Scope of maintenance

In scope:

- the Android ARM64 / Termux compatibility patches (PTY support via
  `@mmmbuto/pty-termux-utils`, `termux-open-url` for auth/browser flows,
  optional `tts_notification` backed by `termux-tts-speak`, Termux environment
  detection)
- the `@mmmbuto/gemini-cli-termux` npm package and matching release assets
- the `next` channel for validation before promotion to `latest`
- the release flow: validate on `develop`, publish npm `next` → `latest`

Out of scope here:

- changes that belong upstream — please file those on
  [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
  directly
- broad product features unrelated to Termux compatibility

## Reporting

| Channel | Where |
|---|---|
| Termux/Android bug reports, PRs | [DioNanos/gemini-cli-termux](https://github.com/DioNanos/gemini-cli-termux) |
| Generic Gemini CLI bugs (not Termux-specific) | [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |
| Security disclosures (Termux fork) | [`SECURITY.md`](./SECURITY.md) — `security@mmmbuto.com` |
| General contact | `dev@mmmbuto.com` |

When reporting a Termux bug, please include: device, Android version, Termux
build (Classic or F-Droid), Node.js version, and `gemini --version`.

## Identity

- Profile: [github.com/DioNanos](https://github.com/DioNanos)
- Project hub: [mmmbuto.com](https://mmmbuto.com)
- Maintainer page and dev journal: [dev.mmmbuto.com](https://dev.mmmbuto.com)

## License

Gemini CLI Termux is distributed under the Apache License 2.0 inherited from
[google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli). The
Termux compatibility patches are released under the same license.
See [`LICENSE`](./LICENSE).

---

*Per aspera ad astra.*
