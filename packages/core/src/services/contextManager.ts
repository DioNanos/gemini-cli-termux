/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  loadGlobalMemory,
  loadEnvironmentMemory,
  loadJitSubdirectoryMemory,
  concatenateInstructions,
} from '../utils/memoryDiscovery.js';
import { loadContextMemory } from '../utils/contextMemory.js';
import type { Config } from '../config/config.js';
import { coreEvents, CoreEvent } from '../utils/events.js';

export class ContextManager {
  private readonly loadedPaths: Set<string> = new Set();
  private readonly config: Config;
  private globalMemory: string = '';
  private environmentMemory: string = '';
  private combinedMemory: string | null = null;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Refreshes the memory by reloading global and environment memory.
   */
  async refresh(): Promise<void> {
    this.loadedPaths.clear();
    await this.loadGlobalMemory();
    await this.loadEnvironmentMemory();
    await this.loadContextMemory();
    this.emitMemoryChanged();
  }

  private async loadGlobalMemory(): Promise<void> {
    const result = await loadGlobalMemory(this.config.getDebugMode());
    this.markAsLoaded(result.files.map((f) => f.path));
    this.globalMemory = concatenateInstructions(
      result.files.map((f) => ({ filePath: f.path, content: f.content })),
      this.config.getWorkingDir(),
    );
  }

  private async loadEnvironmentMemory(): Promise<void> {
    const result = await loadEnvironmentMemory(
      [...this.config.getWorkspaceContext().getDirectories()],
      this.config.getExtensionLoader(),
      this.config.getDebugMode(),
    );
    this.markAsLoaded(result.files.map((f) => f.path));
    const envMemory = concatenateInstructions(
      result.files.map((f) => ({ filePath: f.path, content: f.content })),
      this.config.getWorkingDir(),
    );
    const mcpInstructions =
      this.config.getMcpClientManager()?.getMcpInstructions() || '';
    this.environmentMemory = [envMemory, mcpInstructions.trimStart()]
      .filter(Boolean)
      .join('\n\n');
  }

  private async loadContextMemory(): Promise<void> {
    const options = this.config.getContextMemoryOptions();
    const geminiCombined = [this.globalMemory, this.environmentMemory]
      .filter(Boolean)
      .join('\n\n');

    if (!options?.enabled) {
      this.combinedMemory = geminiCombined;
      return;
    }

    const result = await loadContextMemory(options, geminiCombined);
    for (const p of result.usedPaths) {
      this.loadedPaths.add(p);
    }

    const blocks: Array<{ content: string; slot: string }> = [];
    const geminiBlock =
      geminiCombined.trim().length > 0 ? geminiCombined : null;
    const primary = options.primary ?? 'gemini';
    const order: Array<'gemini' | 'jsonBase' | 'jsonUser'> = [
      primary,
      'gemini',
      'jsonBase',
      'jsonUser',
    ];

    const dedupOrder = Array.from(new Set(order));
    for (const slot of dedupOrder) {
      if (
        slot === 'gemini' &&
        geminiBlock &&
        (options.autoLoadGemini ?? true)
      ) {
        blocks.push({ content: geminiBlock, slot });
      }
      if (slot === 'jsonBase') {
        const base = result.files.find(
          (f) =>
            f.path === options.paths.base &&
            (options.autoLoadJsonBase ?? false),
        );
        if (base) blocks.push({ content: base.content, slot });
      }
      if (slot === 'jsonUser') {
        const user = result.files.find(
          (f) =>
            f.path === options.paths.user &&
            (options.autoLoadJsonUser ?? false),
        );
        if (user) blocks.push({ content: user.content, slot });
      }
    }

    this.combinedMemory = blocks.map((b) => b.content).join('\n\n');
  }

  /**
   * Discovers and loads context for a specific accessed path (Tier 3 - JIT).
   * Traverses upwards from the accessed path to the project root.
   */
  async discoverContext(
    accessedPath: string,
    trustedRoots: string[],
  ): Promise<string> {
    const result = await loadJitSubdirectoryMemory(
      accessedPath,
      trustedRoots,
      this.loadedPaths,
      this.config.getDebugMode(),
    );

    if (result.files.length === 0) {
      return '';
    }

    this.markAsLoaded(result.files.map((f) => f.path));
    return concatenateInstructions(
      result.files.map((f) => ({ filePath: f.path, content: f.content })),
      this.config.getWorkingDir(),
    );
  }

  private emitMemoryChanged(): void {
    coreEvents.emit(CoreEvent.MemoryChanged, {
      fileCount: this.loadedPaths.size,
    });
  }

  getGlobalMemory(): string {
    return this.globalMemory;
  }

  getEnvironmentMemory(): string {
    return this.environmentMemory;
  }

  getCombinedMemory(): string {
    if (this.combinedMemory !== null) {
      return this.combinedMemory;
    }
    return [this.globalMemory, this.environmentMemory]
      .filter(Boolean)
      .join('\n\n');
  }

  private markAsLoaded(paths: string[]): void {
    for (const p of paths) {
      this.loadedPaths.add(p);
    }
  }

  getLoadedPaths(): ReadonlySet<string> {
    return this.loadedPaths;
  }
}
