/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { MessageBusType, } from '../confirmation-bus/types.js';
/**
 * Manages the state of tool calls.
 * Publishes state changes to the MessageBus via TOOL_CALLS_UPDATE events.
 */
export class SchedulerStateManager {
    messageBus;
    activeCalls = new Map();
    queue = [];
    _completedBatch = [];
    constructor(messageBus) {
        this.messageBus = messageBus;
    }
    addToolCalls(calls) {
        this.enqueue(calls);
    }
    getToolCall(callId) {
        return (this.activeCalls.get(callId) ||
            this.queue.find((c) => c.request.callId === callId) ||
            this._completedBatch.find((c) => c.request.callId === callId));
    }
    enqueue(calls) {
        this.queue.push(...calls);
        this.emitUpdate();
    }
    dequeue() {
        const next = this.queue.shift();
        if (next) {
            this.activeCalls.set(next.request.callId, next);
            this.emitUpdate();
        }
        return next;
    }
    get isActive() {
        return this.activeCalls.size > 0;
    }
    get activeCallCount() {
        return this.activeCalls.size;
    }
    get queueLength() {
        return this.queue.length;
    }
    get firstActiveCall() {
        return this.activeCalls.values().next().value;
    }
    updateStatus(callId, status, auxiliaryData) {
        const call = this.activeCalls.get(callId);
        if (!call)
            return;
        const updatedCall = this.transitionCall(call, status, auxiliaryData);
        this.activeCalls.set(callId, updatedCall);
        this.emitUpdate();
    }
    finalizeCall(callId) {
        const call = this.activeCalls.get(callId);
        if (!call)
            return;
        if (this.isTerminalCall(call)) {
            this._completedBatch.push(call);
            this.activeCalls.delete(callId);
        }
    }
    updateArgs(callId, newArgs, newInvocation) {
        const call = this.activeCalls.get(callId);
        if (!call || call.status === 'error')
            return;
        this.activeCalls.set(callId, this.patchCall(call, {
            request: { ...call.request, args: newArgs },
            invocation: newInvocation,
        }));
        this.emitUpdate();
    }
    setOutcome(callId, outcome) {
        const call = this.activeCalls.get(callId);
        if (!call)
            return;
        this.activeCalls.set(callId, this.patchCall(call, { outcome }));
        this.emitUpdate();
    }
    cancelAllQueued(reason) {
        while (this.queue.length > 0) {
            const queuedCall = this.queue.shift();
            if (queuedCall.status === 'error') {
                this._completedBatch.push(queuedCall);
                continue;
            }
            this._completedBatch.push(this.toCancelled(queuedCall, reason));
        }
        this.emitUpdate();
    }
    getSnapshot() {
        return [
            ...this._completedBatch,
            ...Array.from(this.activeCalls.values()),
            ...this.queue,
        ];
    }
    clearBatch() {
        if (this._completedBatch.length === 0)
            return;
        this._completedBatch = [];
        this.emitUpdate();
    }
    get completedBatch() {
        return [...this._completedBatch];
    }
    emitUpdate() {
        const snapshot = this.getSnapshot();
        // Fire and forget - The message bus handles the publish and error handling.
        void this.messageBus.publish({
            type: MessageBusType.TOOL_CALLS_UPDATE,
            toolCalls: snapshot,
        });
    }
    isTerminalCall(call) {
        const { status } = call;
        return status === 'success' || status === 'error' || status === 'cancelled';
    }
    transitionCall(call, newStatus, auxiliaryData) {
        switch (newStatus) {
            case 'success': {
                if (!this.isToolCallResponseInfo(auxiliaryData)) {
                    throw new Error(`Invalid data for 'success' transition (callId: ${call.request.callId})`);
                }
                return this.toSuccess(call, auxiliaryData);
            }
            case 'error': {
                if (!this.isToolCallResponseInfo(auxiliaryData)) {
                    throw new Error(`Invalid data for 'error' transition (callId: ${call.request.callId})`);
                }
                return this.toError(call, auxiliaryData);
            }
            case 'awaiting_approval': {
                if (!auxiliaryData) {
                    throw new Error(`Missing data for 'awaiting_approval' transition (callId: ${call.request.callId})`);
                }
                return this.toAwaitingApproval(call, auxiliaryData);
            }
            case 'scheduled':
                return this.toScheduled(call);
            case 'cancelled': {
                if (typeof auxiliaryData !== 'string') {
                    throw new Error(`Invalid reason (string) for 'cancelled' transition (callId: ${call.request.callId})`);
                }
                return this.toCancelled(call, auxiliaryData);
            }
            case 'validating':
                return this.toValidating(call);
            case 'executing': {
                if (auxiliaryData !== undefined &&
                    !this.isExecutingToolCallPatch(auxiliaryData)) {
                    throw new Error(`Invalid patch for 'executing' transition (callId: ${call.request.callId})`);
                }
                return this.toExecuting(call, auxiliaryData);
            }
            default: {
                const exhaustiveCheck = newStatus;
                return exhaustiveCheck;
            }
        }
    }
    isToolCallResponseInfo(data) {
        return (typeof data === 'object' &&
            data !== null &&
            'callId' in data &&
            'responseParts' in data);
    }
    isExecutingToolCallPatch(data) {
        // A partial can be an empty object, but it must be a non-null object.
        return typeof data === 'object' && data !== null;
    }
    // --- Transition Helpers ---
    /**
     * Ensures the tool call has an associated tool and invocation before
     * transitioning to states that require them.
     */
    validateHasToolAndInvocation(call, targetStatus) {
        if (!('tool' in call && call.tool && 'invocation' in call && call.invocation)) {
            throw new Error(`Invalid state transition: cannot transition to ${targetStatus} without tool/invocation (callId: ${call.request.callId})`);
        }
    }
    toSuccess(call, response) {
        this.validateHasToolAndInvocation(call, 'success');
        const startTime = 'startTime' in call ? call.startTime : undefined;
        return {
            request: call.request,
            tool: call.tool,
            invocation: call.invocation,
            status: 'success',
            response,
            durationMs: startTime ? Date.now() - startTime : undefined,
            outcome: call.outcome,
        };
    }
    toError(call, response) {
        const startTime = 'startTime' in call ? call.startTime : undefined;
        return {
            request: call.request,
            status: 'error',
            tool: 'tool' in call ? call.tool : undefined,
            response,
            durationMs: startTime ? Date.now() - startTime : undefined,
            outcome: call.outcome,
        };
    }
    toAwaitingApproval(call, data) {
        this.validateHasToolAndInvocation(call, 'awaiting_approval');
        let confirmationDetails;
        let correlationId;
        if (this.isEventDrivenApprovalData(data)) {
            correlationId = data.correlationId;
            confirmationDetails = data.confirmationDetails;
        }
        else {
            // TODO: Remove legacy callback shape once event-driven migration is complete
            confirmationDetails = data;
        }
        return {
            request: call.request,
            tool: call.tool,
            status: 'awaiting_approval',
            correlationId,
            confirmationDetails,
            startTime: 'startTime' in call ? call.startTime : undefined,
            outcome: call.outcome,
            invocation: call.invocation,
        };
    }
    isEventDrivenApprovalData(data) {
        return (typeof data === 'object' &&
            data !== null &&
            'correlationId' in data &&
            'confirmationDetails' in data);
    }
    toScheduled(call) {
        this.validateHasToolAndInvocation(call, 'scheduled');
        return {
            request: call.request,
            tool: call.tool,
            status: 'scheduled',
            startTime: 'startTime' in call ? call.startTime : undefined,
            outcome: call.outcome,
            invocation: call.invocation,
        };
    }
    toCancelled(call, reason) {
        this.validateHasToolAndInvocation(call, 'cancelled');
        const startTime = 'startTime' in call ? call.startTime : undefined;
        // TODO: Refactor this tool-specific logic into the confirmation details payload.
        // See: https://github.com/google-gemini/gemini-cli/issues/16716
        let resultDisplay = undefined;
        if (this.isWaitingToolCall(call)) {
            const details = call.confirmationDetails;
            if (details.type === 'edit' &&
                'fileDiff' in details &&
                'fileName' in details &&
                'filePath' in details &&
                'originalContent' in details &&
                'newContent' in details) {
                resultDisplay = {
                    fileDiff: details.fileDiff,
                    fileName: details.fileName,
                    filePath: details.filePath,
                    originalContent: details.originalContent,
                    newContent: details.newContent,
                };
            }
        }
        const errorMessage = `[Operation Cancelled] Reason: ${reason}`;
        return {
            request: call.request,
            tool: call.tool,
            invocation: call.invocation,
            status: 'cancelled',
            response: {
                callId: call.request.callId,
                responseParts: [
                    {
                        functionResponse: {
                            id: call.request.callId,
                            name: call.request.name,
                            response: { error: errorMessage },
                        },
                    },
                ],
                resultDisplay,
                error: undefined,
                errorType: undefined,
                contentLength: errorMessage.length,
            },
            durationMs: startTime ? Date.now() - startTime : undefined,
            outcome: call.outcome,
        };
    }
    isWaitingToolCall(call) {
        return call.status === 'awaiting_approval';
    }
    patchCall(call, patch) {
        return { ...call, ...patch };
    }
    toValidating(call) {
        this.validateHasToolAndInvocation(call, 'validating');
        return {
            request: call.request,
            tool: call.tool,
            status: 'validating',
            startTime: 'startTime' in call ? call.startTime : undefined,
            outcome: call.outcome,
            invocation: call.invocation,
        };
    }
    toExecuting(call, data) {
        this.validateHasToolAndInvocation(call, 'executing');
        const execData = data;
        const liveOutput = execData?.liveOutput ??
            ('liveOutput' in call ? call.liveOutput : undefined);
        const pid = execData?.pid ?? ('pid' in call ? call.pid : undefined);
        return {
            request: call.request,
            tool: call.tool,
            status: 'executing',
            startTime: 'startTime' in call ? call.startTime : undefined,
            outcome: call.outcome,
            invocation: call.invocation,
            liveOutput,
            pid,
        };
    }
}
//# sourceMappingURL=state-manager.js.map