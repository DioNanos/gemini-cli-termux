/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { ToolConfirmationOutcome, } from '../tools/tools.js';
import { PolicyDecision, ApprovalMode } from '../policy/types.js';
import { logToolCall } from '../telemetry/loggers.js';
import { ToolErrorType } from '../tools/tool-error.js';
import { ToolCallEvent } from '../telemetry/types.js';
import { runInDevTraceSpan } from '../telemetry/trace.js';
import { ToolModificationHandler } from '../scheduler/tool-modifier.js';
import { getToolSuggestion } from '../utils/tool-utils.js';
import { MessageBusType } from '../confirmation-bus/types.js';
import { fireToolNotificationHook } from './coreToolHookTriggers.js';
import {} from '../scheduler/types.js';
import { ToolExecutor } from '../scheduler/tool-executor.js';
import { DiscoveredMCPTool } from '../tools/mcp-tool.js';
export const PLAN_MODE_DENIAL_MESSAGE = 'You are in Plan Mode - adjust your prompt to only use read and search tools.';
const createErrorResponse = (request, error, errorType) => ({
    callId: request.callId,
    error,
    responseParts: [
        {
            functionResponse: {
                id: request.callId,
                name: request.name,
                response: { error: error.message },
            },
        },
    ],
    resultDisplay: error.message,
    errorType,
    contentLength: error.message.length,
});
export class CoreToolScheduler {
    // Static WeakMap to track which MessageBus instances already have a handler subscribed
    // This prevents duplicate subscriptions when multiple CoreToolScheduler instances are created
    static subscribedMessageBuses = new WeakMap();
    toolCalls = [];
    outputUpdateHandler;
    onAllToolCallsComplete;
    onToolCallsUpdate;
    getPreferredEditor;
    config;
    isFinalizingToolCalls = false;
    isScheduling = false;
    isCancelling = false;
    requestQueue = [];
    toolCallQueue = [];
    completedToolCallsForBatch = [];
    toolExecutor;
    toolModifier;
    constructor(options) {
        this.config = options.config;
        this.outputUpdateHandler = options.outputUpdateHandler;
        this.onAllToolCallsComplete = options.onAllToolCallsComplete;
        this.onToolCallsUpdate = options.onToolCallsUpdate;
        this.getPreferredEditor = options.getPreferredEditor;
        this.toolExecutor = new ToolExecutor(this.config);
        this.toolModifier = new ToolModificationHandler();
        // Subscribe to message bus for ASK_USER policy decisions
        // Use a static WeakMap to ensure we only subscribe ONCE per MessageBus instance
        // This prevents memory leaks when multiple CoreToolScheduler instances are created
        // (e.g., on every React render, or for each non-interactive tool call)
        const messageBus = this.config.getMessageBus();
        // Check if we've already subscribed a handler to this message bus
        if (!CoreToolScheduler.subscribedMessageBuses.has(messageBus)) {
            // Create a shared handler that will be used for this message bus
            const sharedHandler = (request) => {
                // When ASK_USER policy decision is made, respond with requiresUserConfirmation=true
                // to tell tools to use their legacy confirmation flow
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                messageBus.publish({
                    type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
                    correlationId: request.correlationId,
                    confirmed: false,
                    requiresUserConfirmation: true,
                });
            };
            messageBus.subscribe(MessageBusType.TOOL_CONFIRMATION_REQUEST, sharedHandler);
            // Store the handler in the WeakMap so we don't subscribe again
            CoreToolScheduler.subscribedMessageBuses.set(messageBus, sharedHandler);
        }
    }
    setStatusInternal(targetCallId, newStatus, signal, auxiliaryData) {
        this.toolCalls = this.toolCalls.map((currentCall) => {
            if (currentCall.request.callId !== targetCallId ||
                currentCall.status === 'success' ||
                currentCall.status === 'error' ||
                currentCall.status === 'cancelled') {
                return currentCall;
            }
            // currentCall is a non-terminal state here and should have startTime and tool.
            const existingStartTime = currentCall.startTime;
            const toolInstance = currentCall.tool;
            const invocation = currentCall.invocation;
            const outcome = currentCall.outcome;
            switch (newStatus) {
                case 'success': {
                    const durationMs = existingStartTime
                        ? Date.now() - existingStartTime
                        : undefined;
                    return {
                        request: currentCall.request,
                        tool: toolInstance,
                        invocation,
                        status: 'success',
                        response: auxiliaryData,
                        durationMs,
                        outcome,
                    };
                }
                case 'error': {
                    const durationMs = existingStartTime
                        ? Date.now() - existingStartTime
                        : undefined;
                    return {
                        request: currentCall.request,
                        status: 'error',
                        tool: toolInstance,
                        response: auxiliaryData,
                        durationMs,
                        outcome,
                    };
                }
                case 'awaiting_approval':
                    return {
                        request: currentCall.request,
                        tool: toolInstance,
                        status: 'awaiting_approval',
                        confirmationDetails: auxiliaryData,
                        startTime: existingStartTime,
                        outcome,
                        invocation,
                    };
                case 'scheduled':
                    return {
                        request: currentCall.request,
                        tool: toolInstance,
                        status: 'scheduled',
                        startTime: existingStartTime,
                        outcome,
                        invocation,
                    };
                case 'cancelled': {
                    const durationMs = existingStartTime
                        ? Date.now() - existingStartTime
                        : undefined;
                    // Preserve diff for cancelled edit operations
                    let resultDisplay = undefined;
                    if (currentCall.status === 'awaiting_approval') {
                        const waitingCall = currentCall;
                        if (waitingCall.confirmationDetails.type === 'edit') {
                            resultDisplay = {
                                fileDiff: waitingCall.confirmationDetails.fileDiff,
                                fileName: waitingCall.confirmationDetails.fileName,
                                originalContent: waitingCall.confirmationDetails.originalContent,
                                newContent: waitingCall.confirmationDetails.newContent,
                                filePath: waitingCall.confirmationDetails.filePath,
                            };
                        }
                    }
                    const errorMessage = `[Operation Cancelled] Reason: ${auxiliaryData}`;
                    return {
                        request: currentCall.request,
                        tool: toolInstance,
                        invocation,
                        status: 'cancelled',
                        response: {
                            callId: currentCall.request.callId,
                            responseParts: [
                                {
                                    functionResponse: {
                                        id: currentCall.request.callId,
                                        name: currentCall.request.name,
                                        response: {
                                            error: errorMessage,
                                        },
                                    },
                                },
                            ],
                            resultDisplay,
                            error: undefined,
                            errorType: undefined,
                            contentLength: errorMessage.length,
                        },
                        durationMs,
                        outcome,
                    };
                }
                case 'validating':
                    return {
                        request: currentCall.request,
                        tool: toolInstance,
                        status: 'validating',
                        startTime: existingStartTime,
                        outcome,
                        invocation,
                    };
                case 'executing':
                    return {
                        request: currentCall.request,
                        tool: toolInstance,
                        status: 'executing',
                        startTime: existingStartTime,
                        outcome,
                        invocation,
                    };
                default: {
                    const exhaustiveCheck = newStatus;
                    return exhaustiveCheck;
                }
            }
        });
        this.notifyToolCallsUpdate();
    }
    setArgsInternal(targetCallId, args) {
        this.toolCalls = this.toolCalls.map((call) => {
            // We should never be asked to set args on an ErroredToolCall, but
            // we guard for the case anyways.
            if (call.request.callId !== targetCallId || call.status === 'error') {
                return call;
            }
            const invocationOrError = this.buildInvocation(call.tool, args);
            if (invocationOrError instanceof Error) {
                const response = createErrorResponse(call.request, invocationOrError, ToolErrorType.INVALID_TOOL_PARAMS);
                return {
                    request: { ...call.request, args: args },
                    status: 'error',
                    tool: call.tool,
                    response,
                };
            }
            return {
                ...call,
                request: { ...call.request, args: args },
                invocation: invocationOrError,
            };
        });
    }
    isRunning() {
        return (this.isFinalizingToolCalls ||
            this.toolCalls.some((call) => call.status === 'executing' || call.status === 'awaiting_approval'));
    }
    buildInvocation(tool, args) {
        try {
            return tool.build(args);
        }
        catch (e) {
            if (e instanceof Error) {
                return e;
            }
            return new Error(String(e));
        }
    }
    schedule(request, signal) {
        return runInDevTraceSpan({ name: 'schedule' }, async ({ metadata: spanMetadata }) => {
            spanMetadata.input = request;
            if (this.isRunning() || this.isScheduling) {
                return new Promise((resolve, reject) => {
                    const abortHandler = () => {
                        // Find and remove the request from the queue
                        const index = this.requestQueue.findIndex((item) => item.request === request);
                        if (index > -1) {
                            this.requestQueue.splice(index, 1);
                            reject(new Error('Tool call cancelled while in queue.'));
                        }
                    };
                    signal.addEventListener('abort', abortHandler, { once: true });
                    this.requestQueue.push({
                        request,
                        signal,
                        resolve: () => {
                            signal.removeEventListener('abort', abortHandler);
                            resolve();
                        },
                        reject: (reason) => {
                            signal.removeEventListener('abort', abortHandler);
                            reject(reason);
                        },
                    });
                });
            }
            return this._schedule(request, signal);
        });
    }
    cancelAll(signal) {
        if (this.isCancelling) {
            return;
        }
        this.isCancelling = true;
        // Cancel the currently active tool call, if there is one.
        if (this.toolCalls.length > 0) {
            const activeCall = this.toolCalls[0];
            // Only cancel if it's in a cancellable state.
            if (activeCall.status === 'awaiting_approval' ||
                activeCall.status === 'executing' ||
                activeCall.status === 'scheduled' ||
                activeCall.status === 'validating') {
                this.setStatusInternal(activeCall.request.callId, 'cancelled', signal, 'User cancelled the operation.');
            }
        }
        // Clear the queue and mark all queued items as cancelled for completion reporting.
        this._cancelAllQueuedCalls();
        // Finalize the batch immediately.
        void this.checkAndNotifyCompletion(signal);
    }
    async _schedule(request, signal) {
        this.isScheduling = true;
        this.isCancelling = false;
        try {
            if (this.isRunning()) {
                throw new Error('Cannot schedule new tool calls while other tool calls are actively running (executing or awaiting approval).');
            }
            const requestsToProcess = Array.isArray(request) ? request : [request];
            this.completedToolCallsForBatch = [];
            const newToolCalls = requestsToProcess.map((reqInfo) => {
                const toolInstance = this.config
                    .getToolRegistry()
                    .getTool(reqInfo.name);
                if (!toolInstance) {
                    const suggestion = getToolSuggestion(reqInfo.name, this.config.getToolRegistry().getAllToolNames());
                    const errorMessage = `Tool "${reqInfo.name}" not found in registry. Tools must use the exact names that are registered.${suggestion}`;
                    return {
                        status: 'error',
                        request: reqInfo,
                        response: createErrorResponse(reqInfo, new Error(errorMessage), ToolErrorType.TOOL_NOT_REGISTERED),
                        durationMs: 0,
                    };
                }
                const invocationOrError = this.buildInvocation(toolInstance, reqInfo.args);
                if (invocationOrError instanceof Error) {
                    return {
                        status: 'error',
                        request: reqInfo,
                        tool: toolInstance,
                        response: createErrorResponse(reqInfo, invocationOrError, ToolErrorType.INVALID_TOOL_PARAMS),
                        durationMs: 0,
                    };
                }
                return {
                    status: 'validating',
                    request: reqInfo,
                    tool: toolInstance,
                    invocation: invocationOrError,
                    startTime: Date.now(),
                };
            });
            this.toolCallQueue.push(...newToolCalls);
            await this._processNextInQueue(signal);
        }
        finally {
            this.isScheduling = false;
        }
    }
    async _processNextInQueue(signal) {
        // If there's already a tool being processed, or the queue is empty, stop.
        if (this.toolCalls.length > 0 || this.toolCallQueue.length === 0) {
            return;
        }
        // If cancellation happened between steps, handle it.
        if (signal.aborted) {
            this._cancelAllQueuedCalls();
            // Finalize the batch.
            await this.checkAndNotifyCompletion(signal);
            return;
        }
        const toolCall = this.toolCallQueue.shift();
        // This is now the single active tool call.
        this.toolCalls = [toolCall];
        this.notifyToolCallsUpdate();
        // Handle tools that were already errored during creation.
        if (toolCall.status === 'error') {
            // An error during validation means this "active" tool is already complete.
            // We need to check for batch completion to either finish or process the next in queue.
            await this.checkAndNotifyCompletion(signal);
            return;
        }
        // This logic is moved from the old `for` loop in `_schedule`.
        if (toolCall.status === 'validating') {
            const { request: reqInfo, invocation } = toolCall;
            try {
                if (signal.aborted) {
                    this.setStatusInternal(reqInfo.callId, 'cancelled', signal, 'Tool call cancelled by user.');
                    // The completion check will handle the cascade.
                    await this.checkAndNotifyCompletion(signal);
                    return;
                }
                // Policy Check using PolicyEngine
                // We must reconstruct the FunctionCall format expected by PolicyEngine
                const toolCallForPolicy = {
                    name: toolCall.request.name,
                    args: toolCall.request.args,
                };
                const serverName = toolCall.tool instanceof DiscoveredMCPTool
                    ? toolCall.tool.serverName
                    : undefined;
                const { decision } = await this.config
                    .getPolicyEngine()
                    .check(toolCallForPolicy, serverName);
                if (decision === PolicyDecision.DENY) {
                    let errorMessage = `Tool execution denied by policy.`;
                    let errorType = ToolErrorType.POLICY_VIOLATION;
                    if (this.config.getApprovalMode() === ApprovalMode.PLAN) {
                        errorMessage = PLAN_MODE_DENIAL_MESSAGE;
                        errorType = ToolErrorType.STOP_EXECUTION;
                    }
                    this.setStatusInternal(reqInfo.callId, 'error', signal, createErrorResponse(reqInfo, new Error(errorMessage), errorType));
                    await this.checkAndNotifyCompletion(signal);
                    return;
                }
                if (decision === PolicyDecision.ALLOW) {
                    this.setToolCallOutcome(reqInfo.callId, ToolConfirmationOutcome.ProceedAlways);
                    this.setStatusInternal(reqInfo.callId, 'scheduled', signal);
                }
                else {
                    // PolicyDecision.ASK_USER
                    // We need confirmation details to show to the user
                    const confirmationDetails = await invocation.shouldConfirmExecute(signal);
                    if (!confirmationDetails) {
                        this.setToolCallOutcome(reqInfo.callId, ToolConfirmationOutcome.ProceedAlways);
                        this.setStatusInternal(reqInfo.callId, 'scheduled', signal);
                    }
                    else {
                        if (!this.config.isInteractive()) {
                            throw new Error(`Tool execution for "${toolCall.tool.displayName || toolCall.tool.name}" requires user confirmation, which is not supported in non-interactive mode.`);
                        }
                        // Fire Notification hook before showing confirmation to user
                        const messageBus = this.config.getMessageBus();
                        const hooksEnabled = this.config.getEnableHooks();
                        if (hooksEnabled && messageBus) {
                            await fireToolNotificationHook(messageBus, confirmationDetails);
                        }
                        // Allow IDE to resolve confirmation
                        if (confirmationDetails.type === 'edit' &&
                            confirmationDetails.ideConfirmation) {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            confirmationDetails.ideConfirmation.then((resolution) => {
                                if (resolution.status === 'accepted') {
                                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                    this.handleConfirmationResponse(reqInfo.callId, confirmationDetails.onConfirm, ToolConfirmationOutcome.ProceedOnce, signal);
                                }
                                else {
                                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                    this.handleConfirmationResponse(reqInfo.callId, confirmationDetails.onConfirm, ToolConfirmationOutcome.Cancel, signal);
                                }
                            });
                        }
                        const originalOnConfirm = confirmationDetails.onConfirm;
                        const wrappedConfirmationDetails = {
                            ...confirmationDetails,
                            onConfirm: (outcome, payload) => this.handleConfirmationResponse(reqInfo.callId, originalOnConfirm, outcome, signal, payload),
                        };
                        this.setStatusInternal(reqInfo.callId, 'awaiting_approval', signal, wrappedConfirmationDetails);
                    }
                }
            }
            catch (error) {
                if (signal.aborted) {
                    this.setStatusInternal(reqInfo.callId, 'cancelled', signal, 'Tool call cancelled by user.');
                    await this.checkAndNotifyCompletion(signal);
                }
                else {
                    this.setStatusInternal(reqInfo.callId, 'error', signal, createErrorResponse(reqInfo, error instanceof Error ? error : new Error(String(error)), ToolErrorType.UNHANDLED_EXCEPTION));
                    await this.checkAndNotifyCompletion(signal);
                }
            }
        }
        await this.attemptExecutionOfScheduledCalls(signal);
    }
    async handleConfirmationResponse(callId, originalOnConfirm, outcome, signal, payload) {
        const toolCall = this.toolCalls.find((c) => c.request.callId === callId && c.status === 'awaiting_approval');
        if (toolCall && toolCall.status === 'awaiting_approval') {
            await originalOnConfirm(outcome);
        }
        this.setToolCallOutcome(callId, outcome);
        if (outcome === ToolConfirmationOutcome.Cancel || signal.aborted) {
            // Instead of just cancelling one tool, trigger the full cancel cascade.
            this.cancelAll(signal);
            return; // `cancelAll` calls `checkAndNotifyCompletion`, so we can exit here.
        }
        else if (outcome === ToolConfirmationOutcome.ModifyWithEditor) {
            const waitingToolCall = toolCall;
            const editorType = this.getPreferredEditor();
            if (!editorType) {
                return;
            }
            this.setStatusInternal(callId, 'awaiting_approval', signal, {
                ...waitingToolCall.confirmationDetails,
                isModifying: true,
            });
            const result = await this.toolModifier.handleModifyWithEditor(waitingToolCall, editorType, signal);
            // Restore status (isModifying: false) and update diff if result exists
            if (result) {
                this.setArgsInternal(callId, result.updatedParams);
                this.setStatusInternal(callId, 'awaiting_approval', signal, {
                    ...waitingToolCall.confirmationDetails,
                    fileDiff: result.updatedDiff,
                    isModifying: false,
                });
            }
            else {
                this.setStatusInternal(callId, 'awaiting_approval', signal, {
                    ...waitingToolCall.confirmationDetails,
                    isModifying: false,
                });
            }
        }
        else {
            // If the client provided new content, apply it and wait for
            // re-confirmation.
            if (payload?.newContent && toolCall) {
                const result = await this.toolModifier.applyInlineModify(toolCall, payload, signal);
                if (result) {
                    this.setArgsInternal(callId, result.updatedParams);
                    this.setStatusInternal(callId, 'awaiting_approval', signal, {
                        ...toolCall.confirmationDetails,
                        fileDiff: result.updatedDiff,
                    });
                    // After an inline modification, wait for another user confirmation.
                    return;
                }
            }
            this.setStatusInternal(callId, 'scheduled', signal);
        }
        await this.attemptExecutionOfScheduledCalls(signal);
    }
    async attemptExecutionOfScheduledCalls(signal) {
        const allCallsFinalOrScheduled = this.toolCalls.every((call) => call.status === 'scheduled' ||
            call.status === 'cancelled' ||
            call.status === 'success' ||
            call.status === 'error');
        if (allCallsFinalOrScheduled) {
            const callsToExecute = this.toolCalls.filter((call) => call.status === 'scheduled');
            for (const toolCall of callsToExecute) {
                if (toolCall.status !== 'scheduled')
                    continue;
                this.setStatusInternal(toolCall.request.callId, 'executing', signal);
                const executingCall = this.toolCalls.find((c) => c.request.callId === toolCall.request.callId);
                if (!executingCall) {
                    // Should not happen, but safe guard
                    continue;
                }
                const completedCall = await this.toolExecutor.execute({
                    call: executingCall,
                    signal,
                    outputUpdateHandler: (callId, output) => {
                        if (this.outputUpdateHandler) {
                            this.outputUpdateHandler(callId, output);
                        }
                        this.toolCalls = this.toolCalls.map((tc) => tc.request.callId === callId && tc.status === 'executing'
                            ? { ...tc, liveOutput: output }
                            : tc);
                        this.notifyToolCallsUpdate();
                    },
                    onUpdateToolCall: (updatedCall) => {
                        this.toolCalls = this.toolCalls.map((tc) => tc.request.callId === updatedCall.request.callId
                            ? updatedCall
                            : tc);
                        this.notifyToolCallsUpdate();
                    },
                });
                this.toolCalls = this.toolCalls.map((tc) => tc.request.callId === completedCall.request.callId
                    ? completedCall
                    : tc);
                this.notifyToolCallsUpdate();
                await this.checkAndNotifyCompletion(signal);
            }
        }
    }
    async checkAndNotifyCompletion(signal) {
        // This method is now only concerned with the single active tool call.
        if (this.toolCalls.length === 0) {
            // It's possible to be called when a batch is cancelled before any tool has started.
            if (signal.aborted && this.toolCallQueue.length > 0) {
                this._cancelAllQueuedCalls();
            }
        }
        else {
            const activeCall = this.toolCalls[0];
            const isTerminal = activeCall.status === 'success' ||
                activeCall.status === 'error' ||
                activeCall.status === 'cancelled';
            // If the active tool is not in a terminal state (e.g., it's 'executing' or 'awaiting_approval'),
            // then the scheduler is still busy or paused. We should not proceed.
            if (!isTerminal) {
                return;
            }
            // The active tool is finished. Move it to the completed batch.
            const completedCall = activeCall;
            this.completedToolCallsForBatch.push(completedCall);
            logToolCall(this.config, new ToolCallEvent(completedCall));
            // Clear the active tool slot. This is crucial for the sequential processing.
            this.toolCalls = [];
        }
        // Now, check if the entire batch is complete.
        // The batch is complete if the queue is empty or the operation was cancelled.
        if (this.toolCallQueue.length === 0 || signal.aborted) {
            if (signal.aborted) {
                this._cancelAllQueuedCalls();
            }
            // If we are already finalizing, another concurrent call to
            // checkAndNotifyCompletion will just return. The ongoing finalized loop
            // will pick up any new tools added to completedToolCallsForBatch.
            if (this.isFinalizingToolCalls) {
                return;
            }
            // If there's nothing to report and we weren't cancelled, we can stop.
            // But if we were cancelled, we must proceed to potentially start the next queued request.
            if (this.completedToolCallsForBatch.length === 0 && !signal.aborted) {
                return;
            }
            this.isFinalizingToolCalls = true;
            try {
                // We use a while loop here to ensure that if new tools are added to the
                // batch (e.g., via cancellation) while we are awaiting
                // onAllToolCallsComplete, they are also reported before we finish.
                while (this.completedToolCallsForBatch.length > 0) {
                    const batchToReport = [...this.completedToolCallsForBatch];
                    this.completedToolCallsForBatch = [];
                    if (this.onAllToolCallsComplete) {
                        await this.onAllToolCallsComplete(batchToReport);
                    }
                }
            }
            finally {
                this.isFinalizingToolCalls = false;
                this.isCancelling = false;
                this.notifyToolCallsUpdate();
            }
            // After completion of the entire batch, process the next item in the main request queue.
            if (this.requestQueue.length > 0) {
                const next = this.requestQueue.shift();
                this._schedule(next.request, next.signal)
                    .then(next.resolve)
                    .catch(next.reject);
            }
        }
        else {
            // The batch is not yet complete, so continue processing the current batch sequence.
            await this._processNextInQueue(signal);
        }
    }
    _cancelAllQueuedCalls() {
        while (this.toolCallQueue.length > 0) {
            const queuedCall = this.toolCallQueue.shift();
            // Don't cancel tools that already errored during validation.
            if (queuedCall.status === 'error') {
                this.completedToolCallsForBatch.push(queuedCall);
                continue;
            }
            const durationMs = 'startTime' in queuedCall && queuedCall.startTime
                ? Date.now() - queuedCall.startTime
                : undefined;
            const errorMessage = '[Operation Cancelled] User cancelled the operation.';
            this.completedToolCallsForBatch.push({
                request: queuedCall.request,
                tool: queuedCall.tool,
                invocation: queuedCall.invocation,
                status: 'cancelled',
                response: {
                    callId: queuedCall.request.callId,
                    responseParts: [
                        {
                            functionResponse: {
                                id: queuedCall.request.callId,
                                name: queuedCall.request.name,
                                response: {
                                    error: errorMessage,
                                },
                            },
                        },
                    ],
                    resultDisplay: undefined,
                    error: undefined,
                    errorType: undefined,
                    contentLength: errorMessage.length,
                },
                durationMs,
                outcome: ToolConfirmationOutcome.Cancel,
            });
        }
    }
    notifyToolCallsUpdate() {
        if (this.onToolCallsUpdate) {
            this.onToolCallsUpdate([
                ...this.completedToolCallsForBatch,
                ...this.toolCalls,
                ...this.toolCallQueue,
            ]);
        }
    }
    setToolCallOutcome(callId, outcome) {
        this.toolCalls = this.toolCalls.map((call) => {
            if (call.request.callId !== callId)
                return call;
            return {
                ...call,
                outcome,
            };
        });
    }
}
//# sourceMappingURL=coreToolScheduler.js.map