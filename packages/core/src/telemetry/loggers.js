/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { logs } from '@opentelemetry/api-logs';
import { SERVICE_NAME } from './constants.js';
import { EVENT_API_ERROR, EVENT_API_RESPONSE, EVENT_TOOL_CALL, } from './types.js';
import { recordApiErrorMetrics, recordToolCallMetrics, recordChatCompressionMetrics, recordFileOperationMetric, recordInvalidChunk, recordContentRetry, recordContentRetryFailure, recordModelRoutingMetrics, recordModelSlashCommand, getConventionAttributes, recordTokenUsageMetrics, recordApiResponseMetrics, recordAgentRunMetrics, recordRecoveryAttemptMetrics, recordLinesChanged, recordHookCallMetrics, } from './metrics.js';
import { bufferTelemetryEvent } from './sdk.js';
import { uiTelemetryService } from './uiTelemetry.js';
import { ClearcutLogger } from './clearcut-logger/clearcut-logger.js';
export function logCliConfiguration(config, event) {
    // Guard against undefined event to prevent TypeError
    if (!event) {
        return;
    }
    void ClearcutLogger.getInstance(config)?.logStartSessionEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logUserPrompt(config, event) {
    ClearcutLogger.getInstance(config)?.logNewPromptEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logToolCall(config, event) {
    const uiEvent = {
        ...event,
        'event.name': EVENT_TOOL_CALL,
        'event.timestamp': new Date().toISOString(),
    };
    uiTelemetryService.addEvent(uiEvent);
    ClearcutLogger.getInstance(config)?.logToolCallEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordToolCallMetrics(config, event.duration_ms, {
            function_name: event.function_name,
            success: event.success,
            decision: event.decision,
            tool_type: event.tool_type,
        });
        if (event.metadata) {
            const added = event.metadata['model_added_lines'];
            if (typeof added === 'number' && added > 0) {
                recordLinesChanged(config, added, 'added', {
                    function_name: event.function_name,
                });
            }
            const removed = event.metadata['model_removed_lines'];
            if (typeof removed === 'number' && removed > 0) {
                recordLinesChanged(config, removed, 'removed', {
                    function_name: event.function_name,
                });
            }
        }
    });
}
export function logToolOutputTruncated(config, event) {
    ClearcutLogger.getInstance(config)?.logToolOutputTruncatedEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logFileOperation(config, event) {
    ClearcutLogger.getInstance(config)?.logFileOperationEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordFileOperationMetric(config, {
            operation: event.operation,
            lines: event.lines,
            mimetype: event.mimetype,
            extension: event.extension,
            programming_language: event.programming_language,
        });
    });
}
export function logApiRequest(config, event) {
    ClearcutLogger.getInstance(config)?.logApiRequestEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        logger.emit(event.toLogRecord(config));
        logger.emit(event.toSemanticLogRecord(config));
    });
}
export function logFlashFallback(config, event) {
    ClearcutLogger.getInstance(config)?.logFlashFallbackEvent();
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logRipgrepFallback(config, event) {
    ClearcutLogger.getInstance(config)?.logRipgrepFallbackEvent();
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logApiError(config, event) {
    const uiEvent = {
        ...event,
        'event.name': EVENT_API_ERROR,
        'event.timestamp': new Date().toISOString(),
    };
    uiTelemetryService.addEvent(uiEvent);
    ClearcutLogger.getInstance(config)?.logApiErrorEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        logger.emit(event.toLogRecord(config));
        logger.emit(event.toSemanticLogRecord(config));
        recordApiErrorMetrics(config, event.duration_ms, {
            model: event.model,
            status_code: event.status_code,
            error_type: event.error_type,
        });
        // Record GenAI operation duration for errors
        recordApiResponseMetrics(config, event.duration_ms, {
            model: event.model,
            status_code: event.status_code,
            genAiAttributes: {
                ...getConventionAttributes(event),
                'error.type': event.error_type || 'unknown',
            },
        });
    });
}
export function logApiResponse(config, event) {
    const uiEvent = {
        ...event,
        'event.name': EVENT_API_RESPONSE,
        'event.timestamp': new Date().toISOString(),
    };
    uiTelemetryService.addEvent(uiEvent);
    ClearcutLogger.getInstance(config)?.logApiResponseEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        logger.emit(event.toLogRecord(config));
        logger.emit(event.toSemanticLogRecord(config));
        const conventionAttributes = getConventionAttributes(event);
        recordApiResponseMetrics(config, event.duration_ms, {
            model: event.model,
            status_code: event.status_code,
            genAiAttributes: conventionAttributes,
        });
        const tokenUsageData = [
            { count: event.usage.input_token_count, type: 'input' },
            { count: event.usage.output_token_count, type: 'output' },
            { count: event.usage.cached_content_token_count, type: 'cache' },
            { count: event.usage.thoughts_token_count, type: 'thought' },
            { count: event.usage.tool_token_count, type: 'tool' },
        ];
        for (const { count, type } of tokenUsageData) {
            recordTokenUsageMetrics(config, count, {
                model: event.model,
                type,
                genAiAttributes: conventionAttributes,
            });
        }
    });
}
export function logLoopDetected(config, event) {
    ClearcutLogger.getInstance(config)?.logLoopDetectedEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logLoopDetectionDisabled(config, event) {
    ClearcutLogger.getInstance(config)?.logLoopDetectionDisabledEvent();
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logNextSpeakerCheck(config, event) {
    ClearcutLogger.getInstance(config)?.logNextSpeakerCheck(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logSlashCommand(config, event) {
    ClearcutLogger.getInstance(config)?.logSlashCommandEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logIdeConnection(config, event) {
    ClearcutLogger.getInstance(config)?.logIdeConnectionEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logConversationFinishedEvent(config, event) {
    ClearcutLogger.getInstance(config)?.logConversationFinishedEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logChatCompression(config, event) {
    ClearcutLogger.getInstance(config)?.logChatCompressionEvent(event);
    const logger = logs.getLogger(SERVICE_NAME);
    const logRecord = {
        body: event.toLogBody(),
        attributes: event.toOpenTelemetryAttributes(config),
    };
    logger.emit(logRecord);
    recordChatCompressionMetrics(config, {
        tokens_before: event.tokens_before,
        tokens_after: event.tokens_after,
    });
}
export function logMalformedJsonResponse(config, event) {
    ClearcutLogger.getInstance(config)?.logMalformedJsonResponseEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logInvalidChunk(config, event) {
    ClearcutLogger.getInstance(config)?.logInvalidChunkEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordInvalidChunk(config);
    });
}
export function logContentRetry(config, event) {
    ClearcutLogger.getInstance(config)?.logContentRetryEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordContentRetry(config);
    });
}
export function logContentRetryFailure(config, event) {
    ClearcutLogger.getInstance(config)?.logContentRetryFailureEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordContentRetryFailure(config);
    });
}
export function logModelRouting(config, event) {
    ClearcutLogger.getInstance(config)?.logModelRoutingEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordModelRoutingMetrics(config, event);
    });
}
export function logModelSlashCommand(config, event) {
    ClearcutLogger.getInstance(config)?.logModelSlashCommandEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordModelSlashCommand(config, event);
    });
}
export async function logExtensionInstallEvent(config, event) {
    await ClearcutLogger.getInstance(config)?.logExtensionInstallEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export async function logExtensionUninstall(config, event) {
    await ClearcutLogger.getInstance(config)?.logExtensionUninstallEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export async function logExtensionUpdateEvent(config, event) {
    await ClearcutLogger.getInstance(config)?.logExtensionUpdateEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export async function logExtensionEnable(config, event) {
    await ClearcutLogger.getInstance(config)?.logExtensionEnableEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export async function logExtensionDisable(config, event) {
    await ClearcutLogger.getInstance(config)?.logExtensionDisableEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logEditStrategy(config, event) {
    ClearcutLogger.getInstance(config)?.logEditStrategyEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logEditCorrectionEvent(config, event) {
    ClearcutLogger.getInstance(config)?.logEditCorrectionEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logAgentStart(config, event) {
    ClearcutLogger.getInstance(config)?.logAgentStartEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logAgentFinish(config, event) {
    ClearcutLogger.getInstance(config)?.logAgentFinishEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordAgentRunMetrics(config, event);
    });
}
export function logRecoveryAttempt(config, event) {
    ClearcutLogger.getInstance(config)?.logRecoveryAttemptEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordRecoveryAttemptMetrics(config, event);
    });
}
export function logWebFetchFallbackAttempt(config, event) {
    ClearcutLogger.getInstance(config)?.logWebFetchFallbackAttemptEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logLlmLoopCheck(config, event) {
    ClearcutLogger.getInstance(config)?.logLlmLoopCheckEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
export function logHookCall(config, event) {
    ClearcutLogger.getInstance(config)?.logHookCallEvent(event);
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
        recordHookCallMetrics(config, event.hook_event_name, event.hook_name, event.duration_ms, event.success);
    });
}
export function logStartupStats(config, event) {
    bufferTelemetryEvent(() => {
        const logger = logs.getLogger(SERVICE_NAME);
        const logRecord = {
            body: event.toLogBody(),
            attributes: event.toOpenTelemetryAttributes(config),
        };
        logger.emit(logRecord);
    });
}
//# sourceMappingURL=loggers.js.map