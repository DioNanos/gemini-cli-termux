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

type TermuxPtySpawn = (...args: unknown[]) => {
  pid: number;
  on(event: 'data', callback: (data: string) => void): void;
  on(event: 'exit', callback: (exitCode: number, signal: number) => void): void;
  kill(): void;
};

type TermuxPtyImplementation = {
  module: {
    spawn: TermuxPtySpawn;
  };
  name: NonNullable<PtyImplementation>['name'];
};

function isTermuxPtyImplementation(
  value: unknown,
): value is TermuxPtyImplementation {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    module?: { spawn?: unknown };
    name?: unknown;
  };

  return (
    typeof candidate.module?.spawn === 'function' &&
    typeof candidate.name === 'string'
  );
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
      const impl: unknown = await termuxModule.getPty();
      if (isTermuxPtyImplementation(impl)) {
        const adaptedModule = {
          spawn: (...args: unknown[]) => {
            const pty = impl.module.spawn(...args);
            return {
              ...pty,
              onData(callback: (data: string) => void) {
                pty.on('data', callback);
              },
              onExit(
                callback: (e: { exitCode: number; signal?: number }) => void,
              ) {
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
                pty.kill();
              },
            };
          },
        };
        return { module: adaptedModule, name: impl.name };
      }
    }
  } catch {
    // Fallback to upstream PTY implementations below
  }

  try {
    const lydell = '@lydell/node-pty';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const module = await import(lydell);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { module, name: 'lydell-node-pty' };
  } catch {
    try {
      const nodePty = 'node-pty';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const module = await import(nodePty);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { module, name: 'node-pty' };
    } catch {
      return null;
    }
  }
};
