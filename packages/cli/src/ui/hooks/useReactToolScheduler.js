/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { CoreToolScheduler, debugLogger } from '@google/gemini-cli-core';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { ToolCallStatus } from '../types.js';
export function useReactToolScheduler(onComplete, config, getPreferredEditor) {
    const [toolCallsForDisplay, setToolCallsForDisplay] = useState([]);
    const [lastToolOutputTime, setLastToolOutputTime] = useState(0);
    // Store callbacks in refs to keep them up-to-date without causing re-renders.
    const onCompleteRef = useRef(onComplete);
    const getPreferredEditorRef = useRef(getPreferredEditor);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);
    useEffect(() => {
        getPreferredEditorRef.current = getPreferredEditor;
    }, [getPreferredEditor]);
    const outputUpdateHandler = useCallback((toolCallId, outputChunk) => {
        setLastToolOutputTime(Date.now());
        setToolCallsForDisplay((prevCalls) => prevCalls.map((tc) => {
            if (tc.request.callId === toolCallId && tc.status === 'executing') {
                const executingTc = tc;
                return { ...executingTc, liveOutput: outputChunk };
            }
            return tc;
        }));
    }, []);
    const allToolCallsCompleteHandler = useCallback(async (completedToolCalls) => {
        await onCompleteRef.current(completedToolCalls);
    }, []);
    const toolCallsUpdateHandler = useCallback((allCoreToolCalls) => {
        setToolCallsForDisplay((prevTrackedCalls) => {
            const prevCallsMap = new Map(prevTrackedCalls.map((c) => [c.request.callId, c]));
            return allCoreToolCalls.map((coreTc) => {
                const existingTrackedCall = prevCallsMap.get(coreTc.request.callId);
                const responseSubmittedToGemini = existingTrackedCall?.responseSubmittedToGemini ?? false;
                if (coreTc.status === 'executing') {
                    // Preserve live output if it exists from a previous render.
                    const liveOutput = existingTrackedCall
                        ?.liveOutput;
                    return {
                        ...coreTc,
                        responseSubmittedToGemini,
                        liveOutput,
                        pid: coreTc.pid,
                    };
                }
                else {
                    return {
                        ...coreTc,
                        responseSubmittedToGemini,
                    };
                }
            });
        });
    }, [setToolCallsForDisplay]);
    const stableGetPreferredEditor = useCallback(() => getPreferredEditorRef.current(), []);
    const scheduler = useMemo(() => new CoreToolScheduler({
        outputUpdateHandler,
        onAllToolCallsComplete: allToolCallsCompleteHandler,
        onToolCallsUpdate: toolCallsUpdateHandler,
        getPreferredEditor: stableGetPreferredEditor,
        config,
    }), [
        config,
        outputUpdateHandler,
        allToolCallsCompleteHandler,
        toolCallsUpdateHandler,
        stableGetPreferredEditor,
    ]);
    const schedule = useCallback((request, signal) => {
        setToolCallsForDisplay([]);
        return scheduler.schedule(request, signal);
    }, [scheduler, setToolCallsForDisplay]);
    const markToolsAsSubmitted = useCallback((callIdsToMark) => {
        setToolCallsForDisplay((prevCalls) => prevCalls.map((tc) => callIdsToMark.includes(tc.request.callId)
            ? { ...tc, responseSubmittedToGemini: true }
            : tc));
    }, []);
    const cancelAllToolCalls = useCallback((signal) => {
        scheduler.cancelAll(signal);
    }, [scheduler]);
    return [
        toolCallsForDisplay,
        schedule,
        markToolsAsSubmitted,
        setToolCallsForDisplay,
        cancelAllToolCalls,
        lastToolOutputTime,
    ];
}
/**
 * Maps a CoreToolScheduler status to the UI's ToolCallStatus enum.
 */
function mapCoreStatusToDisplayStatus(coreStatus) {
    switch (coreStatus) {
        case 'validating':
            return ToolCallStatus.Executing;
        case 'awaiting_approval':
            return ToolCallStatus.Confirming;
        case 'executing':
            return ToolCallStatus.Executing;
        case 'success':
            return ToolCallStatus.Success;
        case 'cancelled':
            return ToolCallStatus.Canceled;
        case 'error':
            return ToolCallStatus.Error;
        case 'scheduled':
            return ToolCallStatus.Pending;
        default: {
            const exhaustiveCheck = coreStatus;
            debugLogger.warn(`Unknown core status encountered: ${exhaustiveCheck}`);
            return ToolCallStatus.Error;
        }
    }
}
/**
 * Transforms `TrackedToolCall` objects into `HistoryItemToolGroup` objects for UI display.
 */
export function mapToDisplay(toolOrTools) {
    const toolCalls = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
    const toolDisplays = toolCalls.map((trackedCall) => {
        let displayName;
        let description;
        let renderOutputAsMarkdown = false;
        if (trackedCall.status === 'error') {
            displayName =
                trackedCall.tool === undefined
                    ? trackedCall.request.name
                    : trackedCall.tool.displayName;
            description = JSON.stringify(trackedCall.request.args);
        }
        else {
            displayName = trackedCall.tool.displayName;
            description = trackedCall.invocation.getDescription();
            renderOutputAsMarkdown = trackedCall.tool.isOutputMarkdown;
        }
        const baseDisplayProperties = {
            callId: trackedCall.request.callId,
            name: displayName,
            description,
            renderOutputAsMarkdown,
        };
        switch (trackedCall.status) {
            case 'success':
                return {
                    ...baseDisplayProperties,
                    status: mapCoreStatusToDisplayStatus(trackedCall.status),
                    resultDisplay: trackedCall.response.resultDisplay,
                    confirmationDetails: undefined,
                    outputFile: trackedCall.response.outputFile,
                };
            case 'error':
                return {
                    ...baseDisplayProperties,
                    status: mapCoreStatusToDisplayStatus(trackedCall.status),
                    resultDisplay: trackedCall.response.resultDisplay,
                    confirmationDetails: undefined,
                };
            case 'cancelled':
                return {
                    ...baseDisplayProperties,
                    status: mapCoreStatusToDisplayStatus(trackedCall.status),
                    resultDisplay: trackedCall.response.resultDisplay,
                    confirmationDetails: undefined,
                };
            case 'awaiting_approval':
                return {
                    ...baseDisplayProperties,
                    status: mapCoreStatusToDisplayStatus(trackedCall.status),
                    resultDisplay: undefined,
                    confirmationDetails: trackedCall.confirmationDetails,
                };
            case 'executing':
                return {
                    ...baseDisplayProperties,
                    status: mapCoreStatusToDisplayStatus(trackedCall.status),
                    resultDisplay: trackedCall.liveOutput ?? undefined,
                    confirmationDetails: undefined,
                    ptyId: trackedCall.pid,
                };
            case 'validating': // Fallthrough
            case 'scheduled':
                return {
                    ...baseDisplayProperties,
                    status: mapCoreStatusToDisplayStatus(trackedCall.status),
                    resultDisplay: undefined,
                    confirmationDetails: undefined,
                };
            default: {
                const exhaustiveCheck = trackedCall;
                return {
                    callId: exhaustiveCheck.request.callId,
                    name: 'Unknown Tool',
                    description: 'Encountered an unknown tool call state.',
                    status: ToolCallStatus.Error,
                    resultDisplay: 'Unknown tool call state',
                    confirmationDetails: undefined,
                    renderOutputAsMarkdown: false,
                };
            }
        }
    });
    return {
        type: 'tool_group',
        tools: toolDisplays,
    };
}
//# sourceMappingURL=useReactToolScheduler.js.map