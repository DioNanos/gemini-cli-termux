/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { spawn } from 'node:child_process';
import { SafetyCheckDecision } from './protocol.js';
import { z } from 'zod';
const SafetyCheckResultSchema = z.discriminatedUnion('decision', [
    z.object({
        decision: z.literal(SafetyCheckDecision.ALLOW),
        reason: z.string().optional(),
    }),
    z.object({
        decision: z.literal(SafetyCheckDecision.DENY),
        reason: z.string().min(1),
    }),
    z.object({
        decision: z.literal(SafetyCheckDecision.ASK_USER),
        reason: z.string().min(1),
    }),
]);
/**
 * Service for executing safety checker processes.
 */
export class CheckerRunner {
    static DEFAULT_TIMEOUT = 5000; // 5 seconds
    registry;
    contextBuilder;
    timeout;
    constructor(contextBuilder, registry, config) {
        this.contextBuilder = contextBuilder;
        this.registry = registry;
        this.timeout = config.timeout ?? CheckerRunner.DEFAULT_TIMEOUT;
    }
    /**
     * Runs a safety checker and returns the result.
     */
    async runChecker(toolCall, checkerConfig) {
        if (checkerConfig.type === 'in-process') {
            return this.runInProcessChecker(toolCall, checkerConfig);
        }
        return this.runExternalChecker(toolCall, checkerConfig);
    }
    async runInProcessChecker(toolCall, checkerConfig) {
        try {
            const checker = this.registry.resolveInProcess(checkerConfig.name);
            const context = checkerConfig.required_context
                ? this.contextBuilder.buildMinimalContext(checkerConfig.required_context)
                : this.contextBuilder.buildFullContext();
            const input = {
                protocolVersion: '1.0.0',
                toolCall,
                context,
                config: checkerConfig.config,
            };
            // In-process checkers can be async, but we'll also apply a timeout
            // for safety, in case of infinite loops or unexpected delays.
            return await this.executeWithTimeout(checker.check(input));
        }
        catch (error) {
            return {
                decision: SafetyCheckDecision.DENY,
                reason: `Failed to run in-process checker "${checkerConfig.name}": ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    async runExternalChecker(toolCall, checkerConfig) {
        try {
            // Resolve the checker executable path
            const checkerPath = this.registry.resolveExternal(checkerConfig.name);
            // Build the appropriate context
            const context = checkerConfig.required_context
                ? this.contextBuilder.buildMinimalContext(checkerConfig.required_context)
                : this.contextBuilder.buildFullContext();
            // Create the input payload
            const input = {
                protocolVersion: '1.0.0',
                toolCall,
                context,
                config: checkerConfig.config,
            };
            // Run the checker process
            return await this.executeCheckerProcess(checkerPath, input, checkerConfig.name);
        }
        catch (error) {
            // If anything goes wrong, deny the operation
            return {
                decision: SafetyCheckDecision.DENY,
                reason: `Failed to run safety checker "${checkerConfig.name}": ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    /**
     * Executes an external checker process and handles its lifecycle.
     */
    executeCheckerProcess(checkerPath, input, checkerName) {
        return new Promise((resolve) => {
            const child = spawn(checkerPath, [], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            let stdout = '';
            let stderr = '';
            let timeoutHandle = null;
            let killed = false;
            let exited = false;
            // Set up timeout
            timeoutHandle = setTimeout(() => {
                killed = true;
                child.kill('SIGTERM');
                resolve({
                    decision: SafetyCheckDecision.DENY,
                    reason: `Safety checker "${checkerName}" timed out after ${this.timeout}ms`,
                });
                // Fallback: if process doesn't exit after 5s, force kill
                setTimeout(() => {
                    if (!exited) {
                        child.kill('SIGKILL');
                    }
                }, 5000).unref();
            }, this.timeout);
            // Collect output
            if (child.stdout) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }
            if (child.stderr) {
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
            }
            // Handle process completion
            child.on('close', (code) => {
                exited = true;
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                // If we already killed it due to timeout, don't process the result
                if (killed) {
                    return;
                }
                // Non-zero exit code is a failure
                if (code !== 0) {
                    resolve({
                        decision: SafetyCheckDecision.DENY,
                        reason: `Safety checker "${checkerName}" exited with code ${code}${stderr ? `: ${stderr}` : ''}`,
                    });
                    return;
                }
                // Try to parse the output
                try {
                    const rawResult = JSON.parse(stdout);
                    const result = SafetyCheckResultSchema.parse(rawResult);
                    resolve(result);
                }
                catch (parseError) {
                    resolve({
                        decision: SafetyCheckDecision.DENY,
                        reason: `Failed to parse output from safety checker "${checkerName}": ${parseError instanceof Error
                            ? parseError.message
                            : String(parseError)}`,
                    });
                }
            });
            // Handle process errors
            child.on('error', (error) => {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                if (!killed) {
                    resolve({
                        decision: SafetyCheckDecision.DENY,
                        reason: `Failed to spawn safety checker "${checkerName}": ${error.message}`,
                    });
                }
            });
            // Send input to the checker
            try {
                if (child.stdin) {
                    child.stdin.write(JSON.stringify(input));
                    child.stdin.end();
                }
                else {
                    throw new Error('Failed to open stdin for checker process');
                }
            }
            catch (writeError) {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                child.kill();
                resolve({
                    decision: SafetyCheckDecision.DENY,
                    reason: `Failed to write to stdin of safety checker "${checkerName}": ${writeError instanceof Error
                        ? writeError.message
                        : String(writeError)}`,
                });
            }
        });
    }
    /**
     * Executes a promise with a timeout.
     */
    executeWithTimeout(promise) {
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                reject(new Error(`Checker timed out after ${this.timeout}ms`));
            }, this.timeout);
            promise
                .then(resolve)
                .catch(reject)
                .finally(() => {
                clearTimeout(timeoutHandle);
            });
        });
    }
}
//# sourceMappingURL=checker-runner.js.map