/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import { getErrorMessage } from './errors.js';
import { z } from 'zod';
const ContentSchema = z
    .object({
    role: z.string().optional(),
    parts: z.array(z.record(z.unknown())),
})
    .passthrough();
export function getToolCallDataSchema(historyItemSchema) {
    const schema = historyItemSchema ?? z.any();
    return z.object({
        history: z.array(schema).optional(),
        clientHistory: z.array(ContentSchema).optional(),
        commitHash: z.string().optional(),
        toolCall: z.object({
            name: z.string(),
            args: z.record(z.unknown()),
        }),
        messageId: z.string().optional(),
    });
}
export function generateCheckpointFileName(toolCall) {
    const toolArgs = toolCall.args;
    const toolFilePath = toolArgs['file_path'];
    if (!toolFilePath) {
        return null;
    }
    const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '_');
    const toolName = toolCall.name;
    const fileName = path.basename(toolFilePath);
    return `${timestamp}-${fileName}-${toolName}`;
}
export function formatCheckpointDisplayList(filenames) {
    return getTruncatedCheckpointNames(filenames).join('\n');
}
export function getTruncatedCheckpointNames(filenames) {
    return filenames.map((file) => {
        const components = file.split('.');
        if (components.length <= 1) {
            return file;
        }
        components.pop();
        return components.join('.');
    });
}
export async function processRestorableToolCalls(toolCalls, gitService, geminiClient, history) {
    const checkpointsToWrite = new Map();
    const toolCallToCheckpointMap = new Map();
    const errors = [];
    for (const toolCall of toolCalls) {
        try {
            let commitHash;
            try {
                commitHash = await gitService.createFileSnapshot(`Snapshot for ${toolCall.name}`);
            }
            catch (error) {
                errors.push(`Failed to create new snapshot for ${toolCall.name}: ${getErrorMessage(error)}. Attempting to use current commit.`);
                commitHash = await gitService.getCurrentCommitHash();
            }
            if (!commitHash) {
                errors.push(`Failed to create snapshot for ${toolCall.name}. Checkpointing may not be working properly. Ensure Git is installed and the project directory is accessible.`);
                continue;
            }
            const checkpointFileName = generateCheckpointFileName(toolCall);
            if (!checkpointFileName) {
                errors.push(`Skipping restorable tool call due to missing file_path: ${toolCall.name}`);
                continue;
            }
            const clientHistory = geminiClient.getHistory();
            const checkpointData = {
                history,
                clientHistory,
                toolCall: {
                    name: toolCall.name,
                    args: toolCall.args,
                },
                commitHash,
                messageId: toolCall.prompt_id,
            };
            const fileName = `${checkpointFileName}.json`;
            checkpointsToWrite.set(fileName, JSON.stringify(checkpointData, null, 2));
            toolCallToCheckpointMap.set(toolCall.callId, fileName.replace('.json', ''));
        }
        catch (error) {
            errors.push(`Failed to create checkpoint for ${toolCall.name}: ${getErrorMessage(error)}`);
        }
    }
    return { checkpointsToWrite, toolCallToCheckpointMap, errors };
}
export function getCheckpointInfoList(checkpointFiles) {
    const checkpointInfoList = [];
    for (const [file, content] of checkpointFiles) {
        try {
            const toolCallData = JSON.parse(content);
            if (toolCallData.messageId) {
                checkpointInfoList.push({
                    messageId: toolCallData.messageId,
                    checkpoint: file.replace('.json', ''),
                });
            }
        }
        catch (_e) {
            // Ignore invalid JSON files
        }
    }
    return checkpointInfoList;
}
//# sourceMappingURL=checkpointUtils.js.map