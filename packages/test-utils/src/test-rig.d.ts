/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as pty from '@lydell/node-pty';
export declare function getDefaultTimeout(): 60000 | 30000 | 15000;
export declare function poll(predicate: () => boolean, timeout: number, interval: number): Promise<boolean>;
export declare function sanitizeTestName(name: string): string;
export declare function createToolCallErrorMessage(expectedTools: string | string[], foundTools: string[], result: string): string;
export declare function printDebugInfo(rig: TestRig, result: string, context?: Record<string, unknown>): {
    toolRequest: {
        name: string;
        args: string;
        success: boolean;
        duration_ms: number;
    };
}[];
export declare function validateModelOutput(result: string, expectedContent?: string | (string | RegExp)[] | null, testName?: string): boolean;
export interface ParsedLog {
    attributes?: {
        'event.name'?: string;
        function_name?: string;
        function_args?: string;
        success?: boolean;
        duration_ms?: number;
        request_text?: string;
        hook_event_name?: string;
        hook_name?: string;
        hook_input?: Record<string, unknown>;
        hook_output?: Record<string, unknown>;
        exit_code?: number;
        stdout?: string;
        stderr?: string;
        error?: string;
    };
    scopeMetrics?: {
        metrics: {
            descriptor: {
                name: string;
            };
        }[];
    }[];
}
export declare class InteractiveRun {
    ptyProcess: pty.IPty;
    output: string;
    constructor(ptyProcess: pty.IPty);
    expectText(text: string, timeout?: number): Promise<void>;
    type(text: string): Promise<void>;
    sendText(text: string): Promise<void>;
    sendKeys(text: string): Promise<void>;
    kill(): Promise<void>;
    expectExit(): Promise<number>;
}
export declare class TestRig {
    testDir: string | null;
    homeDir: string | null;
    testName?: string;
    _lastRunStdout?: string;
    fakeResponsesPath?: string;
    originalFakeResponsesPath?: string;
    private _interactiveRuns;
    private _spawnedProcesses;
    setup(testName: string, options?: {
        settings?: Record<string, unknown>;
        fakeResponsesPath?: string;
    }): void;
    private _createSettingsFile;
    createFile(fileName: string, content: string): string;
    mkdir(dir: string): void;
    sync(): void;
    /**
     * The command and args to use to invoke Gemini CLI. Allows us to switch
     * between using the bundled gemini.js (the default) and using the installed
     * 'gemini' (used to verify npm bundles).
     */
    private _getCommandAndArgs;
    run(options: {
        args?: string | string[];
        stdin?: string;
        stdinDoesNotEnd?: boolean;
        yolo?: boolean;
        timeout?: number;
        env?: Record<string, string | undefined>;
    }): Promise<string>;
    private _filterPodmanTelemetry;
    runCommand(args: string[], options?: {
        stdin?: string;
        timeout?: number;
        env?: Record<string, string | undefined>;
    }): Promise<string>;
    readFile(fileName: string): string;
    cleanup(): Promise<void>;
    waitForTelemetryReady(): Promise<void>;
    waitForTelemetryEvent(eventName: string, timeout?: number): Promise<boolean>;
    waitForToolCall(toolName: string, timeout?: number, matchArgs?: (args: string) => boolean): Promise<boolean>;
    expectToolCallSuccess(toolNames: string[], timeout?: number, matchArgs?: (args: string) => boolean): Promise<void>;
    waitForAnyToolCall(toolNames: string[], timeout?: number): Promise<boolean>;
    _parseToolLogsFromStdout(stdout: string): {
        timestamp: number;
        toolRequest: {
            name: string;
            args: string;
            success: boolean;
            duration_ms: number;
        };
    }[];
    private _readAndParseTelemetryLog;
    readToolLogs(): {
        toolRequest: {
            name: string;
            args: string;
            success: boolean;
            duration_ms: number;
        };
    }[];
    readAllApiRequest(): ParsedLog[];
    readLastApiRequest(): ParsedLog | null;
    waitForMetric(metricName: string, timeout?: number): Promise<boolean>;
    readMetric(metricName: string): Record<string, unknown> | null;
    runInteractive(options?: {
        args?: string | string[];
        yolo?: boolean;
        env?: Record<string, string | undefined>;
    }): Promise<InteractiveRun>;
    readHookLogs(): {
        hookCall: {
            hook_event_name: string;
            hook_name: string;
            hook_input: Record<string, unknown>;
            hook_output: Record<string, unknown>;
            exit_code: number;
            stdout: string;
            stderr: string;
            duration_ms: number;
            success: boolean;
            error: string;
        };
    }[];
    pollCommand(commandFn: () => Promise<void>, predicateFn: () => boolean, timeout?: number, interval?: number): Promise<void>;
}
