/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable no-console */
import util from 'node:util';
export class ConsolePatcher {
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    originalConsoleDebug = console.debug;
    originalConsoleInfo = console.info;
    params;
    constructor(params) {
        this.params = params;
    }
    patch() {
        console.log = this.patchConsoleMethod('log');
        console.warn = this.patchConsoleMethod('warn');
        console.error = this.patchConsoleMethod('error');
        console.debug = this.patchConsoleMethod('debug');
        console.info = this.patchConsoleMethod('info');
    }
    cleanup = () => {
        console.log = this.originalConsoleLog;
        console.warn = this.originalConsoleWarn;
        console.error = this.originalConsoleError;
        console.debug = this.originalConsoleDebug;
        console.info = this.originalConsoleInfo;
    };
    formatArgs = (args) => util.format(...args);
    patchConsoleMethod = (type) => (...args) => {
        if (this.params.stderr) {
            if (type !== 'debug' || this.params.debugMode) {
                this.originalConsoleError(this.formatArgs(args));
            }
        }
        else {
            if (type !== 'debug' || this.params.debugMode) {
                this.params.onNewMessage?.({
                    type,
                    content: this.formatArgs(args),
                    count: 1,
                });
            }
        }
    };
}
//# sourceMappingURL=ConsolePatcher.js.map