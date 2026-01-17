/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// TERMUX PATCH: Utilities for detecting and working with Termux environment
import { execSync } from 'node:child_process';
/**
 * Detect if running in Termux environment
 */
export function isTermux() {
    return (process.platform === 'android' ||
        !!process.env['TERMUX_VERSION'] ||
        !!(process.env['PREFIX'] && process.env['PREFIX'].includes('com.termux')));
}
/**
 * Detect full Termux environment including API availability
 */
export function detectTermuxEnvironment() {
    if (!isTermux()) {
        return {
            isTermux: false,
            hasTermuxApi: false,
            prefix: '',
            availableCommands: [],
        };
    }
    let hasTermuxApi = false;
    let apiVersion;
    const availableCommands = [];
    try {
        // Check if termux-api is installed
        execSync('which termux-battery-status', { stdio: 'ignore' });
        hasTermuxApi = true;
        // Try to get version
        try {
            const result = execSync('pkg show termux-api 2>/dev/null | grep Version || echo ""', { encoding: 'utf-8' });
            const match = result.match(/Version:\s*(.+)/);
            if (match) {
                apiVersion = match[1].trim();
            }
        }
        catch {
            // Version detection failed, continue
        }
        // Detect available commands
        const commands = [
            'termux-battery-status',
            'termux-clipboard-get',
            'termux-clipboard-set',
            'termux-toast',
            'termux-notification',
            'termux-tts-speak',
            'termux-vibrate',
            'termux-torch',
            'termux-location',
            'termux-wifi-connectioninfo',
            'termux-camera-info',
            'termux-sensor',
            'termux-dialog',
        ];
        for (const cmd of commands) {
            try {
                execSync(`which ${cmd}`, { stdio: 'ignore' });
                availableCommands.push(cmd);
            }
            catch {
                // Command not available
            }
        }
    }
    catch {
        // termux-api not installed
    }
    return {
        isTermux: true,
        hasTermuxApi,
        apiVersion,
        prefix: process.env['PREFIX'] || '/data/data/com.termux/files/usr',
        availableCommands,
    };
}
//# sourceMappingURL=termux-detect.js.map