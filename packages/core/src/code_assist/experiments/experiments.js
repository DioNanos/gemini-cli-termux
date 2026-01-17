/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { getClientMetadata } from './client_metadata.js';
import * as fs from 'node:fs';
import { debugLogger } from '../../utils/debugLogger.js';
let experimentsPromise;
/**
 * Gets the experiments from the server.
 *
 * The experiments are cached so that they are only fetched once.
 */
export async function getExperiments(server) {
    if (experimentsPromise) {
        return experimentsPromise;
    }
    experimentsPromise = (async () => {
        if (process.env['GEMINI_EXP']) {
            try {
                const expPath = process.env['GEMINI_EXP'];
                debugLogger.debug('Reading experiments from', expPath);
                const content = await fs.promises.readFile(expPath, 'utf8');
                const response = JSON.parse(content);
                if ((response.flags && !Array.isArray(response.flags)) ||
                    (response.experimentIds && !Array.isArray(response.experimentIds))) {
                    throw new Error('Invalid format for experiments file: `flags` and `experimentIds` must be arrays if present.');
                }
                return parseExperiments(response);
            }
            catch (e) {
                debugLogger.debug('Failed to read experiments from GEMINI_EXP', e);
            }
        }
        if (!server) {
            return { flags: {}, experimentIds: [] };
        }
        const metadata = await getClientMetadata();
        const response = await server.listExperiments(metadata);
        return parseExperiments(response);
    })();
    return experimentsPromise;
}
function parseExperiments(response) {
    const flags = {};
    for (const flag of response.flags ?? []) {
        if (flag.flagId) {
            flags[flag.flagId] = flag;
        }
    }
    return {
        flags,
        experimentIds: response.experimentIds ?? [],
    };
}
//# sourceMappingURL=experiments.js.map