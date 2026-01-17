/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { KeyBinding } from '../packages/cli/src/config/keyBindings.js';
export interface KeybindingDocCommand {
    description: string;
    bindings: readonly KeyBinding[];
}
export interface KeybindingDocSection {
    title: string;
    commands: readonly KeybindingDocCommand[];
}
export declare function main(argv?: string[]): Promise<void>;
export declare function buildDefaultDocSections(): readonly KeybindingDocSection[];
export declare function renderDocumentation(sections: readonly KeybindingDocSection[]): string;
