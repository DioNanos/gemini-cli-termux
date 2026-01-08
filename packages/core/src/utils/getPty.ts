/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export type PtyImplementation = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any;
  name: 'mmmbuto-node-pty';
} | null;

export interface PtyProcess {
  readonly pid: number;
  onData(callback: (data: string) => void): void;
  onExit(callback: (e: { exitCode: number; signal?: number }) => void): void;
  kill(signal?: string): void;
}

export const getPty = async (): Promise<PtyImplementation> => {
  const isAndroid =
    process.platform === 'android' ||
    process.env['PREFIX']?.includes('com.termux');

  if (!isAndroid) {
    return null;
  }

  try {
    const mmmbuto = '@mmmbuto/node-pty-android-arm64';
    const module = await import(mmmbuto);
    return { module, name: 'mmmbuto-node-pty' };
  } catch (_e) {
    return null;
  }
};
