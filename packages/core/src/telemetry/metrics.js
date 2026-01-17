/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { diag, metrics, ValueType } from '@opentelemetry/api';
import { SERVICE_NAME } from './constants.js';
import { AuthType } from '../core/contentGenerator.js';
import { getCommonAttributes } from './telemetryAttributes.js';
import { sanitizeHookName } from './sanitize.js';
const EVENT_CHAT_COMPRESSION = 'gemini_cli.chat_compression';
const TOOL_CALL_COUNT = 'gemini_cli.tool.call.count';
const TOOL_CALL_LATENCY = 'gemini_cli.tool.call.latency';
const API_REQUEST_COUNT = 'gemini_cli.api.request.count';
const API_REQUEST_LATENCY = 'gemini_cli.api.request.latency';
const TOKEN_USAGE = 'gemini_cli.token.usage';
const SESSION_COUNT = 'gemini_cli.session.count';
const FILE_OPERATION_COUNT = 'gemini_cli.file.operation.count';
const LINES_CHANGED = 'gemini_cli.lines.changed';
const INVALID_CHUNK_COUNT = 'gemini_cli.chat.invalid_chunk.count';
const CONTENT_RETRY_COUNT = 'gemini_cli.chat.content_retry.count';
const CONTENT_RETRY_FAILURE_COUNT = 'gemini_cli.chat.content_retry_failure.count';
const MODEL_ROUTING_LATENCY = 'gemini_cli.model_routing.latency';
const MODEL_ROUTING_FAILURE_COUNT = 'gemini_cli.model_routing.failure.count';
const MODEL_SLASH_COMMAND_CALL_COUNT = 'gemini_cli.slash_command.model.call_count';
const EVENT_HOOK_CALL_COUNT = 'gemini_cli.hook_call.count';
const EVENT_HOOK_CALL_LATENCY = 'gemini_cli.hook_call.latency';
// Agent Metrics
const AGENT_RUN_COUNT = 'gemini_cli.agent.run.count';
const AGENT_DURATION_MS = 'gemini_cli.agent.duration';
const AGENT_TURNS = 'gemini_cli.agent.turns';
const AGENT_RECOVERY_ATTEMPT_COUNT = 'gemini_cli.agent.recovery_attempt.count';
const AGENT_RECOVERY_ATTEMPT_DURATION = 'gemini_cli.agent.recovery_attempt.duration';
// OpenTelemetry GenAI Semantic Convention Metrics
const GEN_AI_CLIENT_TOKEN_USAGE = 'gen_ai.client.token.usage';
const GEN_AI_CLIENT_OPERATION_DURATION = 'gen_ai.client.operation.duration';
// Performance Monitoring Metrics
const STARTUP_TIME = 'gemini_cli.startup.duration';
const MEMORY_USAGE = 'gemini_cli.memory.usage';
const CPU_USAGE = 'gemini_cli.cpu.usage';
const TOOL_QUEUE_DEPTH = 'gemini_cli.tool.queue.depth';
const TOOL_EXECUTION_BREAKDOWN = 'gemini_cli.tool.execution.breakdown';
const TOKEN_EFFICIENCY = 'gemini_cli.token.efficiency';
const API_REQUEST_BREAKDOWN = 'gemini_cli.api.request.breakdown';
const PERFORMANCE_SCORE = 'gemini_cli.performance.score';
const REGRESSION_DETECTION = 'gemini_cli.performance.regression';
const REGRESSION_PERCENTAGE_CHANGE = 'gemini_cli.performance.regression.percentage_change';
const BASELINE_COMPARISON = 'gemini_cli.performance.baseline.comparison';
const FLICKER_FRAME_COUNT = 'gemini_cli.ui.flicker.count';
const SLOW_RENDER_LATENCY = 'gemini_cli.ui.slow_render.latency';
const EXIT_FAIL_COUNT = 'gemini_cli.exit.fail.count';
const baseMetricDefinition = {
    getCommonAttributes,
};
const COUNTER_DEFINITIONS = {
    [TOOL_CALL_COUNT]: {
        description: 'Counts tool calls, tagged by function name and success.',
        valueType: ValueType.INT,
        assign: (c) => (toolCallCounter = c),
        attributes: {},
    },
    [API_REQUEST_COUNT]: {
        description: 'Counts API requests, tagged by model and status.',
        valueType: ValueType.INT,
        assign: (c) => (apiRequestCounter = c),
        attributes: {},
    },
    [TOKEN_USAGE]: {
        description: 'Counts the total number of tokens used.',
        valueType: ValueType.INT,
        assign: (c) => (tokenUsageCounter = c),
        attributes: {},
    },
    [SESSION_COUNT]: {
        description: 'Count of CLI sessions started.',
        valueType: ValueType.INT,
        assign: (c) => (sessionCounter = c),
        attributes: {},
    },
    [FILE_OPERATION_COUNT]: {
        description: 'Counts file operations (create, read, update).',
        valueType: ValueType.INT,
        assign: (c) => (fileOperationCounter = c),
        attributes: {},
    },
    [LINES_CHANGED]: {
        description: 'Number of lines changed (from file diffs).',
        valueType: ValueType.INT,
        assign: (c) => (linesChangedCounter = c),
        attributes: {},
    },
    [INVALID_CHUNK_COUNT]: {
        description: 'Counts invalid chunks received from a stream.',
        valueType: ValueType.INT,
        assign: (c) => (invalidChunkCounter = c),
        attributes: {},
    },
    [CONTENT_RETRY_COUNT]: {
        description: 'Counts retries due to content errors (e.g., empty stream).',
        valueType: ValueType.INT,
        assign: (c) => (contentRetryCounter = c),
        attributes: {},
    },
    [CONTENT_RETRY_FAILURE_COUNT]: {
        description: 'Counts occurrences of all content retries failing.',
        valueType: ValueType.INT,
        assign: (c) => (contentRetryFailureCounter = c),
        attributes: {},
    },
    [MODEL_ROUTING_FAILURE_COUNT]: {
        description: 'Counts model routing failures.',
        valueType: ValueType.INT,
        assign: (c) => (modelRoutingFailureCounter = c),
        attributes: {},
    },
    [MODEL_SLASH_COMMAND_CALL_COUNT]: {
        description: 'Counts model slash command calls.',
        valueType: ValueType.INT,
        assign: (c) => (modelSlashCommandCallCounter = c),
        attributes: {},
    },
    [EVENT_CHAT_COMPRESSION]: {
        description: 'Counts chat compression events.',
        valueType: ValueType.INT,
        assign: (c) => (chatCompressionCounter = c),
        attributes: {},
    },
    [AGENT_RUN_COUNT]: {
        description: 'Counts agent runs, tagged by name and termination reason.',
        valueType: ValueType.INT,
        assign: (c) => (agentRunCounter = c),
        attributes: {},
    },
    [AGENT_RECOVERY_ATTEMPT_COUNT]: {
        description: 'Counts agent recovery attempts.',
        valueType: ValueType.INT,
        assign: (c) => (agentRecoveryAttemptCounter = c),
        attributes: {},
    },
    [FLICKER_FRAME_COUNT]: {
        description: 'Counts UI frames that flicker (render taller than the terminal).',
        valueType: ValueType.INT,
        assign: (c) => (flickerFrameCounter = c),
        attributes: {},
    },
    [EXIT_FAIL_COUNT]: {
        description: 'Counts CLI exit failures.',
        valueType: ValueType.INT,
        assign: (c) => (exitFailCounter = c),
        attributes: {},
    },
    [EVENT_HOOK_CALL_COUNT]: {
        description: 'Counts hook calls, tagged by hook event name and success.',
        valueType: ValueType.INT,
        assign: (c) => (hookCallCounter = c),
        attributes: {},
    },
};
const HISTOGRAM_DEFINITIONS = {
    [TOOL_CALL_LATENCY]: {
        description: 'Latency of tool calls in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (toolCallLatencyHistogram = h),
        attributes: {},
    },
    [API_REQUEST_LATENCY]: {
        description: 'Latency of API requests in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (apiRequestLatencyHistogram = h),
        attributes: {},
    },
    [MODEL_ROUTING_LATENCY]: {
        description: 'Latency of model routing decisions in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (modelRoutingLatencyHistogram = h),
        attributes: {},
    },
    [AGENT_DURATION_MS]: {
        description: 'Duration of agent runs in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (agentDurationHistogram = h),
        attributes: {},
    },
    [SLOW_RENDER_LATENCY]: {
        description: 'Counts UI frames that take too long to render.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (slowRenderHistogram = h),
        attributes: {},
    },
    [AGENT_TURNS]: {
        description: 'Number of turns taken by agents.',
        unit: 'turns',
        valueType: ValueType.INT,
        assign: (h) => (agentTurnsHistogram = h),
        attributes: {},
    },
    [AGENT_RECOVERY_ATTEMPT_DURATION]: {
        description: 'Duration of agent recovery attempts in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (agentRecoveryAttemptDurationHistogram = h),
        attributes: {},
    },
    [GEN_AI_CLIENT_TOKEN_USAGE]: {
        description: 'Number of input and output tokens used.',
        unit: 'token',
        valueType: ValueType.INT,
        assign: (h) => (genAiClientTokenUsageHistogram = h),
        attributes: {},
    },
    [GEN_AI_CLIENT_OPERATION_DURATION]: {
        description: 'GenAI operation duration.',
        unit: 's',
        valueType: ValueType.DOUBLE,
        assign: (h) => (genAiClientOperationDurationHistogram = h),
        attributes: {},
    },
    [EVENT_HOOK_CALL_LATENCY]: {
        description: 'Latency of hook calls in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (c) => (hookCallLatencyHistogram = c),
        attributes: {},
    },
};
const PERFORMANCE_COUNTER_DEFINITIONS = {
    [REGRESSION_DETECTION]: {
        description: 'Performance regression detection events.',
        valueType: ValueType.INT,
        assign: (c) => (regressionDetectionCounter = c),
        attributes: {},
    },
};
const PERFORMANCE_HISTOGRAM_DEFINITIONS = {
    [STARTUP_TIME]: {
        description: 'CLI startup time in milliseconds, broken down by initialization phase.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
        assign: (h) => (startupTimeHistogram = h),
        attributes: {},
    },
    [MEMORY_USAGE]: {
        description: 'Memory usage in bytes.',
        unit: 'bytes',
        valueType: ValueType.INT,
        assign: (h) => (memoryUsageGauge = h),
        attributes: {},
    },
    [CPU_USAGE]: {
        description: 'CPU usage percentage.',
        unit: 'percent',
        valueType: ValueType.DOUBLE,
        assign: (h) => (cpuUsageGauge = h),
        attributes: {},
    },
    [TOOL_QUEUE_DEPTH]: {
        description: 'Number of tools in execution queue.',
        unit: 'count',
        valueType: ValueType.INT,
        assign: (h) => (toolQueueDepthGauge = h),
        attributes: {},
    },
    [TOOL_EXECUTION_BREAKDOWN]: {
        description: 'Tool execution time breakdown by phase in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (toolExecutionBreakdownHistogram = h),
        attributes: {},
    },
    [TOKEN_EFFICIENCY]: {
        description: 'Token efficiency metrics (tokens per operation, cache hit rate, etc.).',
        unit: 'ratio',
        valueType: ValueType.DOUBLE,
        assign: (h) => (tokenEfficiencyHistogram = h),
        attributes: {},
    },
    [API_REQUEST_BREAKDOWN]: {
        description: 'API request time breakdown by phase in milliseconds.',
        unit: 'ms',
        valueType: ValueType.INT,
        assign: (h) => (apiRequestBreakdownHistogram = h),
        attributes: {},
    },
    [PERFORMANCE_SCORE]: {
        description: 'Composite performance score (0-100).',
        unit: 'score',
        valueType: ValueType.DOUBLE,
        assign: (h) => (performanceScoreGauge = h),
        attributes: {},
    },
    [REGRESSION_PERCENTAGE_CHANGE]: {
        description: 'Percentage change compared to baseline for detected regressions.',
        unit: 'percent',
        valueType: ValueType.DOUBLE,
        assign: (h) => (regressionPercentageChangeHistogram = h),
        attributes: {},
    },
    [BASELINE_COMPARISON]: {
        description: 'Performance comparison to established baseline (percentage change).',
        unit: 'percent',
        valueType: ValueType.DOUBLE,
        assign: (h) => (baselineComparisonHistogram = h),
        attributes: {},
    },
};
export var FileOperation;
(function (FileOperation) {
    FileOperation["CREATE"] = "create";
    FileOperation["READ"] = "read";
    FileOperation["UPDATE"] = "update";
})(FileOperation || (FileOperation = {}));
export var PerformanceMetricType;
(function (PerformanceMetricType) {
    PerformanceMetricType["STARTUP"] = "startup";
    PerformanceMetricType["MEMORY"] = "memory";
    PerformanceMetricType["CPU"] = "cpu";
    PerformanceMetricType["TOOL_EXECUTION"] = "tool_execution";
    PerformanceMetricType["API_REQUEST"] = "api_request";
    PerformanceMetricType["TOKEN_EFFICIENCY"] = "token_efficiency";
})(PerformanceMetricType || (PerformanceMetricType = {}));
export var MemoryMetricType;
(function (MemoryMetricType) {
    MemoryMetricType["HEAP_USED"] = "heap_used";
    MemoryMetricType["HEAP_TOTAL"] = "heap_total";
    MemoryMetricType["EXTERNAL"] = "external";
    MemoryMetricType["RSS"] = "rss";
})(MemoryMetricType || (MemoryMetricType = {}));
export var ToolExecutionPhase;
(function (ToolExecutionPhase) {
    ToolExecutionPhase["VALIDATION"] = "validation";
    ToolExecutionPhase["PREPARATION"] = "preparation";
    ToolExecutionPhase["EXECUTION"] = "execution";
    ToolExecutionPhase["RESULT_PROCESSING"] = "result_processing";
})(ToolExecutionPhase || (ToolExecutionPhase = {}));
export var ApiRequestPhase;
(function (ApiRequestPhase) {
    ApiRequestPhase["REQUEST_PREPARATION"] = "request_preparation";
    ApiRequestPhase["NETWORK_LATENCY"] = "network_latency";
    ApiRequestPhase["RESPONSE_PROCESSING"] = "response_processing";
    ApiRequestPhase["TOKEN_PROCESSING"] = "token_processing";
})(ApiRequestPhase || (ApiRequestPhase = {}));
export var GenAiOperationName;
(function (GenAiOperationName) {
    GenAiOperationName["GENERATE_CONTENT"] = "generate_content";
})(GenAiOperationName || (GenAiOperationName = {}));
export var GenAiProviderName;
(function (GenAiProviderName) {
    GenAiProviderName["GCP_GEN_AI"] = "gcp.gen_ai";
    GenAiProviderName["GCP_VERTEX_AI"] = "gcp.vertex_ai";
})(GenAiProviderName || (GenAiProviderName = {}));
export var GenAiTokenType;
(function (GenAiTokenType) {
    GenAiTokenType["INPUT"] = "input";
    GenAiTokenType["OUTPUT"] = "output";
})(GenAiTokenType || (GenAiTokenType = {}));
let cliMeter;
let toolCallCounter;
let toolCallLatencyHistogram;
let apiRequestCounter;
let apiRequestLatencyHistogram;
let tokenUsageCounter;
let sessionCounter;
let fileOperationCounter;
let linesChangedCounter;
let chatCompressionCounter;
let invalidChunkCounter;
let contentRetryCounter;
let contentRetryFailureCounter;
let modelRoutingLatencyHistogram;
let modelRoutingFailureCounter;
let modelSlashCommandCallCounter;
let agentRunCounter;
let agentDurationHistogram;
let agentTurnsHistogram;
let agentRecoveryAttemptCounter;
let agentRecoveryAttemptDurationHistogram;
let flickerFrameCounter;
let exitFailCounter;
let slowRenderHistogram;
let hookCallCounter;
let hookCallLatencyHistogram;
// OpenTelemetry GenAI Semantic Convention Metrics
let genAiClientTokenUsageHistogram;
let genAiClientOperationDurationHistogram;
// Performance Monitoring Metrics
let startupTimeHistogram;
let memoryUsageGauge; // Using Histogram until ObservableGauge is available
let cpuUsageGauge;
let toolQueueDepthGauge;
let toolExecutionBreakdownHistogram;
let tokenEfficiencyHistogram;
let apiRequestBreakdownHistogram;
let performanceScoreGauge;
let regressionDetectionCounter;
let regressionPercentageChangeHistogram;
let baselineComparisonHistogram;
let isMetricsInitialized = false;
let isPerformanceMonitoringEnabled = false;
export function getMeter() {
    if (!cliMeter) {
        cliMeter = metrics.getMeter(SERVICE_NAME);
    }
    return cliMeter;
}
export function initializeMetrics(config) {
    if (isMetricsInitialized)
        return;
    const meter = getMeter();
    if (!meter)
        return;
    // Initialize core metrics
    Object.entries(COUNTER_DEFINITIONS).forEach(([name, { description, valueType, assign }]) => {
        assign(meter.createCounter(name, { description, valueType }));
    });
    Object.entries(HISTOGRAM_DEFINITIONS).forEach(([name, { description, unit, valueType, assign }]) => {
        assign(meter.createHistogram(name, { description, unit, valueType }));
    });
    // Increment session counter after all metrics are initialized
    sessionCounter?.add(1, baseMetricDefinition.getCommonAttributes(config));
    // Initialize performance monitoring metrics if enabled
    initializePerformanceMonitoring(config);
    isMetricsInitialized = true;
}
export function recordChatCompressionMetrics(config, attributes) {
    if (!chatCompressionCounter || !isMetricsInitialized)
        return;
    chatCompressionCounter.add(1, {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    });
}
export function recordToolCallMetrics(config, durationMs, attributes) {
    if (!toolCallCounter || !toolCallLatencyHistogram || !isMetricsInitialized)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    toolCallCounter.add(1, metricAttributes);
    toolCallLatencyHistogram.record(durationMs, {
        ...baseMetricDefinition.getCommonAttributes(config),
        function_name: attributes.function_name,
    });
}
export function recordCustomTokenUsageMetrics(config, tokenCount, attributes) {
    if (!tokenUsageCounter || !isMetricsInitialized)
        return;
    tokenUsageCounter.add(tokenCount, {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    });
}
export function recordCustomApiResponseMetrics(config, durationMs, attributes) {
    if (!apiRequestCounter ||
        !apiRequestLatencyHistogram ||
        !isMetricsInitialized)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        model: attributes.model,
        status_code: attributes.status_code ?? 'ok',
    };
    apiRequestCounter.add(1, metricAttributes);
    apiRequestLatencyHistogram.record(durationMs, {
        ...baseMetricDefinition.getCommonAttributes(config),
        model: attributes.model,
    });
}
export function recordApiErrorMetrics(config, durationMs, attributes) {
    if (!apiRequestCounter ||
        !apiRequestLatencyHistogram ||
        !isMetricsInitialized)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        model: attributes.model,
        status_code: attributes.status_code ?? 'error',
        error_type: attributes.error_type ?? 'unknown',
    };
    apiRequestCounter.add(1, metricAttributes);
    apiRequestLatencyHistogram.record(durationMs, {
        ...baseMetricDefinition.getCommonAttributes(config),
        model: attributes.model,
    });
}
export function recordFileOperationMetric(config, attributes) {
    if (!fileOperationCounter || !isMetricsInitialized)
        return;
    fileOperationCounter.add(1, {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    });
}
export function recordLinesChanged(config, lines, changeType, attributes) {
    if (!linesChangedCounter || !isMetricsInitialized)
        return;
    if (!Number.isFinite(lines) || lines <= 0)
        return;
    linesChangedCounter.add(lines, {
        ...baseMetricDefinition.getCommonAttributes(config),
        type: changeType,
        ...(attributes ?? {}),
    });
}
// --- New Metric Recording Functions ---
/**
 * Records a metric for when a UI frame flickers.
 */
export function recordFlickerFrame(config) {
    if (!flickerFrameCounter || !isMetricsInitialized)
        return;
    flickerFrameCounter.add(1, baseMetricDefinition.getCommonAttributes(config));
}
/**
 * Records a metric for when user failed to exit
 */
export function recordExitFail(config) {
    if (!exitFailCounter || !isMetricsInitialized)
        return;
    exitFailCounter.add(1, baseMetricDefinition.getCommonAttributes(config));
}
/**
 * Records a metric for when a UI frame is slow in rendering
 */
export function recordSlowRender(config, renderLatency) {
    if (!slowRenderHistogram || !isMetricsInitialized)
        return;
    slowRenderHistogram.record(renderLatency, {
        ...baseMetricDefinition.getCommonAttributes(config),
    });
}
/**
 * Records a metric for when an invalid chunk is received from a stream.
 */
export function recordInvalidChunk(config) {
    if (!invalidChunkCounter || !isMetricsInitialized)
        return;
    invalidChunkCounter.add(1, baseMetricDefinition.getCommonAttributes(config));
}
/**
 * Records a metric for when a retry is triggered due to a content error.
 */
export function recordContentRetry(config) {
    if (!contentRetryCounter || !isMetricsInitialized)
        return;
    contentRetryCounter.add(1, baseMetricDefinition.getCommonAttributes(config));
}
/**
 * Records a metric for when all content error retries have failed for a request.
 */
export function recordContentRetryFailure(config) {
    if (!contentRetryFailureCounter || !isMetricsInitialized)
        return;
    contentRetryFailureCounter.add(1, baseMetricDefinition.getCommonAttributes(config));
}
export function recordModelSlashCommand(config, event) {
    if (!modelSlashCommandCallCounter || !isMetricsInitialized)
        return;
    modelSlashCommandCallCounter.add(1, {
        ...baseMetricDefinition.getCommonAttributes(config),
        'slash_command.model.model_name': event.model_name,
    });
}
export function recordModelRoutingMetrics(config, event) {
    if (!modelRoutingLatencyHistogram ||
        !modelRoutingFailureCounter ||
        !isMetricsInitialized)
        return;
    modelRoutingLatencyHistogram.record(event.routing_latency_ms, {
        ...baseMetricDefinition.getCommonAttributes(config),
        'routing.decision_model': event.decision_model,
        'routing.decision_source': event.decision_source,
    });
    if (event.failed) {
        modelRoutingFailureCounter.add(1, {
            ...baseMetricDefinition.getCommonAttributes(config),
            'routing.decision_source': event.decision_source,
            'routing.error_message': event.error_message,
        });
    }
}
export function recordAgentRunMetrics(config, event) {
    if (!agentRunCounter ||
        !agentDurationHistogram ||
        !agentTurnsHistogram ||
        !isMetricsInitialized)
        return;
    const commonAttributes = baseMetricDefinition.getCommonAttributes(config);
    agentRunCounter.add(1, {
        ...commonAttributes,
        agent_name: event.agent_name,
        terminate_reason: event.terminate_reason,
    });
    agentDurationHistogram.record(event.duration_ms, {
        ...commonAttributes,
        agent_name: event.agent_name,
    });
    agentTurnsHistogram.record(event.turn_count, {
        ...commonAttributes,
        agent_name: event.agent_name,
    });
}
export function recordRecoveryAttemptMetrics(config, event) {
    if (!agentRecoveryAttemptCounter ||
        !agentRecoveryAttemptDurationHistogram ||
        !isMetricsInitialized)
        return;
    const commonAttributes = baseMetricDefinition.getCommonAttributes(config);
    agentRecoveryAttemptCounter.add(1, {
        ...commonAttributes,
        agent_name: event.agent_name,
        reason: event.reason,
        success: event.success,
    });
    agentRecoveryAttemptDurationHistogram.record(event.duration_ms, {
        ...commonAttributes,
        agent_name: event.agent_name,
    });
}
// OpenTelemetry GenAI Semantic Convention Recording Functions
export function recordGenAiClientTokenUsage(config, tokenCount, attributes) {
    if (!genAiClientTokenUsageHistogram || !isMetricsInitialized)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    genAiClientTokenUsageHistogram.record(tokenCount, metricAttributes);
}
export function recordGenAiClientOperationDuration(config, durationSeconds, attributes) {
    if (!genAiClientOperationDurationHistogram || !isMetricsInitialized)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    genAiClientOperationDurationHistogram.record(durationSeconds, metricAttributes);
}
export function getConventionAttributes(event) {
    const operationName = getGenAiOperationName();
    const provider = getGenAiProvider(event.auth_type);
    return {
        'gen_ai.operation.name': operationName,
        'gen_ai.provider.name': provider,
        'gen_ai.request.model': event.model,
        'gen_ai.response.model': event.model,
    };
}
/**
 * Maps authentication type to GenAI provider name following OpenTelemetry conventions
 */
function getGenAiProvider(authType) {
    switch (authType) {
        case AuthType.USE_VERTEX_AI:
        case AuthType.COMPUTE_ADC:
        case AuthType.LOGIN_WITH_GOOGLE:
            return GenAiProviderName.GCP_VERTEX_AI;
        case AuthType.USE_GEMINI:
        default:
            return GenAiProviderName.GCP_GEN_AI;
    }
}
function getGenAiOperationName() {
    return GenAiOperationName.GENERATE_CONTENT;
}
// Performance Monitoring Functions
export function initializePerformanceMonitoring(config) {
    const meter = getMeter();
    if (!meter)
        return;
    // Check if performance monitoring is enabled in config
    // For now, enable performance monitoring when telemetry is enabled
    // TODO: Add specific performance monitoring settings to config
    isPerformanceMonitoringEnabled = config.getTelemetryEnabled();
    if (!isPerformanceMonitoringEnabled)
        return;
    Object.entries(PERFORMANCE_COUNTER_DEFINITIONS).forEach(([name, { description, valueType, assign }]) => {
        assign(meter.createCounter(name, { description, valueType }));
    });
    Object.entries(PERFORMANCE_HISTOGRAM_DEFINITIONS).forEach(([name, { description, unit, valueType, assign }]) => {
        assign(meter.createHistogram(name, { description, unit, valueType }));
    });
}
export function recordStartupPerformance(config, durationMs, attributes) {
    if (!startupTimeHistogram || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        phase: attributes.phase,
        ...attributes.details,
    };
    startupTimeHistogram.record(durationMs, metricAttributes);
}
export function recordMemoryUsage(config, bytes, attributes) {
    if (!memoryUsageGauge || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    memoryUsageGauge.record(bytes, metricAttributes);
}
export function recordCpuUsage(config, percentage, attributes) {
    if (!cpuUsageGauge || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    cpuUsageGauge.record(percentage, metricAttributes);
}
export function recordToolQueueDepth(config, queueDepth) {
    if (!toolQueueDepthGauge || !isPerformanceMonitoringEnabled)
        return;
    const attributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
    };
    toolQueueDepthGauge.record(queueDepth, attributes);
}
export function recordToolExecutionBreakdown(config, durationMs, attributes) {
    if (!toolExecutionBreakdownHistogram || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    toolExecutionBreakdownHistogram.record(durationMs, metricAttributes);
}
export function recordTokenEfficiency(config, value, attributes) {
    if (!tokenEfficiencyHistogram || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    tokenEfficiencyHistogram.record(value, metricAttributes);
}
export function recordApiRequestBreakdown(config, durationMs, attributes) {
    if (!apiRequestBreakdownHistogram || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    apiRequestBreakdownHistogram.record(durationMs, metricAttributes);
}
export function recordPerformanceScore(config, score, attributes) {
    if (!performanceScoreGauge || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    performanceScoreGauge.record(score, metricAttributes);
}
export function recordPerformanceRegression(config, attributes) {
    if (!regressionDetectionCounter || !isPerformanceMonitoringEnabled)
        return;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    regressionDetectionCounter.add(1, metricAttributes);
    if (attributes.baseline_value !== 0 && regressionPercentageChangeHistogram) {
        const percentageChange = ((attributes.current_value - attributes.baseline_value) /
            attributes.baseline_value) *
            100;
        regressionPercentageChangeHistogram.record(percentageChange, metricAttributes);
    }
}
export function recordBaselineComparison(config, attributes) {
    if (!baselineComparisonHistogram || !isPerformanceMonitoringEnabled)
        return;
    if (attributes.baseline_value === 0) {
        diag.warn('Baseline value is zero, skipping comparison.');
        return;
    }
    const percentageChange = ((attributes.current_value - attributes.baseline_value) /
        attributes.baseline_value) *
        100;
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        ...attributes,
    };
    baselineComparisonHistogram.record(percentageChange, metricAttributes);
}
// Utility function to check if performance monitoring is enabled
export function isPerformanceMonitoringActive() {
    return isPerformanceMonitoringEnabled && isMetricsInitialized;
}
/**
 * Token usage recording that emits both custom and convention metrics.
 */
export function recordTokenUsageMetrics(config, tokenCount, attributes) {
    recordCustomTokenUsageMetrics(config, tokenCount, {
        model: attributes.model,
        type: attributes.type,
    });
    if ((attributes.type === 'input' || attributes.type === 'output') &&
        attributes.genAiAttributes) {
        recordGenAiClientTokenUsage(config, tokenCount, {
            ...attributes.genAiAttributes,
            'gen_ai.token.type': attributes.type,
        });
    }
}
/**
 * Operation latency recording that emits both custom and convention metrics.
 */
export function recordApiResponseMetrics(config, durationMs, attributes) {
    recordCustomApiResponseMetrics(config, durationMs, {
        model: attributes.model,
        status_code: attributes.status_code,
    });
    if (attributes.genAiAttributes) {
        const durationSeconds = durationMs / 1000;
        recordGenAiClientOperationDuration(config, durationSeconds, {
            ...attributes.genAiAttributes,
        });
    }
}
export function recordHookCallMetrics(config, hookEventName, hookName, durationMs, success) {
    if (!hookCallCounter || !hookCallLatencyHistogram || !isMetricsInitialized)
        return;
    // Always sanitize hook names in metrics (metrics are aggregated and exposed)
    const sanitizedHookName = sanitizeHookName(hookName);
    const metricAttributes = {
        ...baseMetricDefinition.getCommonAttributes(config),
        hook_event_name: hookEventName,
        hook_name: sanitizedHookName,
        success,
    };
    hookCallCounter.add(1, metricAttributes);
    hookCallLatencyHistogram.record(durationMs, metricAttributes);
}
//# sourceMappingURL=metrics.js.map