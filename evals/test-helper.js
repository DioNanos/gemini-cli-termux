/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { TestRig } from '@google/gemini-cli-test-utils';
import { createUnauthorizedToolError } from '@google/gemini-cli-core';
export * from '@google/gemini-cli-test-utils';
export function evalTest(policy, evalCase) {
    const fn = async () => {
        const rig = new TestRig();
        try {
            rig.setup(evalCase.name, evalCase.params);
            if (evalCase.files) {
                for (const [filePath, content] of Object.entries(evalCase.files)) {
                    const fullPath = path.join(rig.testDir, filePath);
                    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                    fs.writeFileSync(fullPath, content);
                }
                const execOptions = { cwd: rig.testDir, stdio: 'inherit' };
                execSync('git init', execOptions);
                execSync('git config user.email "test@example.com"', execOptions);
                execSync('git config user.name "Test User"', execOptions);
                execSync('git add .', execOptions);
                execSync('git commit --allow-empty -m "Initial commit"', execOptions);
            }
            const result = await rig.run({ args: evalCase.prompt });
            const unauthorizedErrorPrefix = createUnauthorizedToolError('').split("'")[0];
            if (result.includes(unauthorizedErrorPrefix)) {
                throw new Error('Test failed due to unauthorized tool call in output: ' + result);
            }
            await evalCase.assert(rig, result);
        }
        finally {
            await logToFile(evalCase.name, JSON.stringify(rig.readToolLogs(), null, 2));
            await rig.cleanup();
        }
    };
    if (policy === 'USUALLY_PASSES' && !process.env['RUN_EVALS']) {
        it.skip(evalCase.name, fn);
    }
    else {
        it(evalCase.name, fn);
    }
}
async function logToFile(name, content) {
    const logDir = 'evals/logs';
    await fs.promises.mkdir(logDir, { recursive: true });
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const logFile = `${logDir}/${sanitizedName}.log`;
    await fs.promises.writeFile(logFile, content);
}
//# sourceMappingURL=test-helper.js.map