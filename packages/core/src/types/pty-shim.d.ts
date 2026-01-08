/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

declare module '@mmmbuto/node-pty-android-arm64' {
  export interface IPty {
    pid: number;
    write(data: string): void;
    resize(columns: number, rows: number): void;
    onData(callback: (data: string) => void): void;
    onExit(callback: (e: { exitCode: number; signal?: number }) => void): void;
    kill(signal?: string): void;
  }
  export interface ISpawnOptions {
    name?: string;
    cols?: number;
    rows?: number;
    cwd?: string;
    env?: Record<string, string>;
  }
  export function spawn(
    file: string,
    args?: string[],
    options?: ISpawnOptions,
  ): IPty;
}
