/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export type PtyImplementation = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any;
  name:
    | 'mmmbuto-node-pty'
    | 'lydell-node-pty-linux-arm64'
    | 'lydell-node-pty'
    | 'node-pty';
} | null;

export interface PtyProcess {
  readonly pid: number;
  onData(callback: (data: string) => void): void;
  onExit(callback: (e: { exitCode: number; signal?: number }) => void): void;
  kill(signal?: string): void;
}

export const getPty = async (): Promise<PtyImplementation> => {
  if (process.env['GEMINI_PTY_INFO'] === 'child_process') {
    return null;
  }

  try {
    const termuxPty = '@mmmbuto/pty-termux-utils';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const termuxModule = await import(termuxPty);
    if (typeof termuxModule.getPty === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const impl = await termuxModule.getPty();
      if (impl?.module?.spawn && impl?.name) {
        const adaptedModule = {
          spawn: (...args: unknown[]) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const pty = impl.module.spawn(...args);
            return {
              ...pty,
              onData(callback: (data: string) => void) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                pty.on('data', callback);
              },
              onExit(
                callback: (e: { exitCode: number; signal?: number }) => void,
              ) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                pty.on('exit', (exitCode: number, signal: number) => {
                  callback({
                    exitCode,
                    signal: signal || undefined,
                  });
                });
                // Compatibility with @lydell/node-pty's disposable return.
                return { dispose() {} };
              },
              kill(_signal?: string) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                pty.kill();
              },
            };
          },
        };
        return { module: adaptedModule, name: impl.name };
      }
    }
  } catch (_e) {
    // Fallback to upstream PTY implementations below
  }

  try {
    const lydell = '@lydell/node-pty';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const module = await import(lydell);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { module, name: 'lydell-node-pty' };
  } catch (_e) {
    try {
      const nodePty = 'node-pty';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const module = await import(nodePty);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { module, name: 'node-pty' };
    } catch (_e2) {
      return null;
    }
  }
};
