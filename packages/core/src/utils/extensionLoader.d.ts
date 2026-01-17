/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { EventEmitter } from 'node:events';
import type { Config, GeminiCLIExtension } from '../config/config.js';
export declare abstract class ExtensionLoader {
    private readonly eventEmitter?;
    protected config: Config | undefined;
    protected startingCount: number;
    protected startCompletedCount: number;
    protected stoppingCount: number;
    protected stopCompletedCount: number;
    private isStarting;
    constructor(eventEmitter?: EventEmitter<ExtensionEvents> | undefined);
    /**
     * All currently known extensions, both active and inactive.
     */
    abstract getExtensions(): GeminiCLIExtension[];
    /**
     * Fully initializes all active extensions.
     *
     * Called within `Config.initialize`, which must already have an
     * McpClientManager, PromptRegistry, and GeminiChat set up.
     */
    start(config: Config): Promise<void>;
    /**
     * Unconditionally starts an `extension` and loads all its MCP servers,
     * context, custom commands, etc. Assumes that `start` has already been called
     * and we have a Config object.
     *
     * This should typically only be called from `start`, most other calls should
     * go through `maybeStartExtension` which will only start the extension if
     * extension reloading is enabled and the `config` object is initialized.
     */
    protected startExtension(extension: GeminiCLIExtension): Promise<void>;
    private maybeRefreshMemories;
    /**
     * Refreshes the gemini tools list if it is initialized and the extension has
     * any excludeTools settings.
     */
    private maybeRefreshGeminiTools;
    /**
     * If extension reloading is enabled and `start` has already been called,
     * then calls `startExtension` to include all extension features into the
     * program.
     */
    protected maybeStartExtension(extension: GeminiCLIExtension): Promise<void>;
    /**
     * Unconditionally stops an `extension` and unloads all its MCP servers,
     * context, custom commands, etc. Assumes that `start` has already been called
     * and we have a Config object.
     *
     * Most calls should go through `maybeStopExtension` which will only stop the
     * extension if extension reloading is enabled and the `config` object is
     * initialized.
     */
    protected stopExtension(extension: GeminiCLIExtension): Promise<void>;
    /**
     * If extension reloading is enabled and `start` has already been called,
     * then this also performs all necessary steps to remove all extension
     * features from the rest of the system.
     */
    protected maybeStopExtension(extension: GeminiCLIExtension): Promise<void>;
    restartExtension(extension: GeminiCLIExtension): Promise<void>;
}
export interface ExtensionEvents {
    extensionsStarting: ExtensionsStartingEvent[];
    extensionsStopping: ExtensionsStoppingEvent[];
}
export interface ExtensionsStartingEvent {
    total: number;
    completed: number;
}
export interface ExtensionsStoppingEvent {
    total: number;
    completed: number;
}
export declare class SimpleExtensionLoader extends ExtensionLoader {
    protected readonly extensions: GeminiCLIExtension[];
    constructor(extensions: GeminiCLIExtension[], eventEmitter?: EventEmitter<ExtensionEvents>);
    getExtensions(): GeminiCLIExtension[];
    loadExtension(extension: GeminiCLIExtension): Promise<void>;
    unloadExtension(extension: GeminiCLIExtension): Promise<void>;
}
