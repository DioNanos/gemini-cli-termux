/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Attributes, Meter, Counter, Histogram } from '@opentelemetry/api';
import { ValueType } from '@opentelemetry/api';
import type { Config } from '../config/config.js';
import type { ModelRoutingEvent, ModelSlashCommandEvent, AgentFinishEvent, RecoveryAttemptEvent } from './types.js';
declare const EVENT_CHAT_COMPRESSION = "gemini_cli.chat_compression";
declare const TOOL_CALL_COUNT = "gemini_cli.tool.call.count";
declare const API_REQUEST_COUNT = "gemini_cli.api.request.count";
declare const TOKEN_USAGE = "gemini_cli.token.usage";
declare const FILE_OPERATION_COUNT = "gemini_cli.file.operation.count";
declare const GEN_AI_CLIENT_TOKEN_USAGE = "gen_ai.client.token.usage";
declare const GEN_AI_CLIENT_OPERATION_DURATION = "gen_ai.client.operation.duration";
declare const STARTUP_TIME = "gemini_cli.startup.duration";
declare const MEMORY_USAGE = "gemini_cli.memory.usage";
declare const CPU_USAGE = "gemini_cli.cpu.usage";
declare const TOOL_EXECUTION_BREAKDOWN = "gemini_cli.tool.execution.breakdown";
declare const TOKEN_EFFICIENCY = "gemini_cli.token.efficiency";
declare const API_REQUEST_BREAKDOWN = "gemini_cli.api.request.breakdown";
declare const PERFORMANCE_SCORE = "gemini_cli.performance.score";
declare const REGRESSION_DETECTION = "gemini_cli.performance.regression";
declare const BASELINE_COMPARISON = "gemini_cli.performance.baseline.comparison";
declare const COUNTER_DEFINITIONS: {
    readonly "gemini_cli.tool.call.count": {
        readonly description: "Counts tool calls, tagged by function name and success.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            function_name: string;
            success: boolean;
            decision?: "accept" | "reject" | "modify" | "auto_accept";
            tool_type?: "native" | "mcp";
        };
    };
    readonly "gemini_cli.api.request.count": {
        readonly description: "Counts API requests, tagged by model and status.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            model: string;
            status_code?: number | string;
            error_type?: string;
        };
    };
    readonly "gemini_cli.token.usage": {
        readonly description: "Counts the total number of tokens used.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            model: string;
            type: "input" | "output" | "thought" | "cache" | "tool";
        };
    };
    readonly "gemini_cli.session.count": {
        readonly description: "Count of CLI sessions started.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.file.operation.count": {
        readonly description: "Counts file operations (create, read, update).";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            operation: FileOperation;
            lines?: number;
            mimetype?: string;
            extension?: string;
            programming_language?: string;
        };
    };
    readonly "gemini_cli.lines.changed": {
        readonly description: "Number of lines changed (from file diffs).";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            function_name?: string;
            type: "added" | "removed";
        };
    };
    readonly "gemini_cli.chat.invalid_chunk.count": {
        readonly description: "Counts invalid chunks received from a stream.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.chat.content_retry.count": {
        readonly description: "Counts retries due to content errors (e.g., empty stream).";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.chat.content_retry_failure.count": {
        readonly description: "Counts occurrences of all content retries failing.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.model_routing.failure.count": {
        readonly description: "Counts model routing failures.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            "routing.decision_source": string;
            "routing.error_message": string;
        };
    };
    readonly "gemini_cli.slash_command.model.call_count": {
        readonly description: "Counts model slash command calls.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            "slash_command.model.model_name": string;
        };
    };
    readonly "gemini_cli.chat_compression": {
        readonly description: "Counts chat compression events.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            tokens_before: number;
            tokens_after: number;
        };
    };
    readonly "gemini_cli.agent.run.count": {
        readonly description: "Counts agent runs, tagged by name and termination reason.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            agent_name: string;
            terminate_reason: string;
        };
    };
    readonly "gemini_cli.agent.recovery_attempt.count": {
        readonly description: "Counts agent recovery attempts.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            agent_name: string;
            reason: string;
            success: boolean;
        };
    };
    readonly "gemini_cli.ui.flicker.count": {
        readonly description: "Counts UI frames that flicker (render taller than the terminal).";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.exit.fail.count": {
        readonly description: "Counts CLI exit failures.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.hook_call.count": {
        readonly description: "Counts hook calls, tagged by hook event name and success.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            hook_event_name: string;
            hook_name: string;
            success: boolean;
        };
    };
};
declare const HISTOGRAM_DEFINITIONS: {
    readonly "gemini_cli.tool.call.latency": {
        readonly description: "Latency of tool calls in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            function_name: string;
        };
    };
    readonly "gemini_cli.api.request.latency": {
        readonly description: "Latency of API requests in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            model: string;
        };
    };
    readonly "gemini_cli.model_routing.latency": {
        readonly description: "Latency of model routing decisions in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            "routing.decision_model": string;
            "routing.decision_source": string;
        };
    };
    readonly "gemini_cli.agent.duration": {
        readonly description: "Duration of agent runs in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            agent_name: string;
        };
    };
    readonly "gemini_cli.ui.slow_render.latency": {
        readonly description: "Counts UI frames that take too long to render.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.agent.turns": {
        readonly description: "Number of turns taken by agents.";
        readonly unit: "turns";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            agent_name: string;
        };
    };
    readonly "gemini_cli.agent.recovery_attempt.duration": {
        readonly description: "Duration of agent recovery attempts in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            agent_name: string;
        };
    };
    readonly "gen_ai.client.token.usage": {
        readonly description: "Number of input and output tokens used.";
        readonly unit: "token";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            "gen_ai.operation.name": string;
            "gen_ai.provider.name": string;
            "gen_ai.token.type": "input" | "output";
            "gen_ai.request.model"?: string;
            "gen_ai.response.model"?: string;
            "server.address"?: string;
            "server.port"?: number;
        };
    };
    readonly "gen_ai.client.operation.duration": {
        readonly description: "GenAI operation duration.";
        readonly unit: "s";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            "gen_ai.operation.name": string;
            "gen_ai.provider.name": string;
            "gen_ai.request.model"?: string;
            "gen_ai.response.model"?: string;
            "server.address"?: string;
            "server.port"?: number;
            "error.type"?: string;
        };
    };
    readonly "gemini_cli.hook_call.latency": {
        readonly description: "Latency of hook calls in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            hook_event_name: string;
            hook_name: string;
            success: boolean;
        };
    };
};
declare const PERFORMANCE_COUNTER_DEFINITIONS: {
    readonly "gemini_cli.performance.regression": {
        readonly description: "Performance regression detection events.";
        readonly valueType: ValueType.INT;
        readonly assign: (c: Counter) => Counter<Attributes>;
        readonly attributes: {
            metric: string;
            severity: "low" | "medium" | "high";
            current_value: number;
            baseline_value: number;
        };
    };
};
declare const PERFORMANCE_HISTOGRAM_DEFINITIONS: {
    readonly "gemini_cli.startup.duration": {
        readonly description: "CLI startup time in milliseconds, broken down by initialization phase.";
        readonly unit: "ms";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            phase: string;
            details?: Record<string, string | number | boolean>;
        };
    };
    readonly "gemini_cli.memory.usage": {
        readonly description: "Memory usage in bytes.";
        readonly unit: "bytes";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            memory_type: MemoryMetricType;
            component?: string;
        };
    };
    readonly "gemini_cli.cpu.usage": {
        readonly description: "CPU usage percentage.";
        readonly unit: "percent";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            component?: string;
        };
    };
    readonly "gemini_cli.tool.queue.depth": {
        readonly description: "Number of tools in execution queue.";
        readonly unit: "count";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: Record<string, never>;
    };
    readonly "gemini_cli.tool.execution.breakdown": {
        readonly description: "Tool execution time breakdown by phase in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            function_name: string;
            phase: ToolExecutionPhase;
        };
    };
    readonly "gemini_cli.token.efficiency": {
        readonly description: "Token efficiency metrics (tokens per operation, cache hit rate, etc.).";
        readonly unit: "ratio";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            model: string;
            metric: string;
            context?: string;
        };
    };
    readonly "gemini_cli.api.request.breakdown": {
        readonly description: "API request time breakdown by phase in milliseconds.";
        readonly unit: "ms";
        readonly valueType: ValueType.INT;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            model: string;
            phase: ApiRequestPhase;
        };
    };
    readonly "gemini_cli.performance.score": {
        readonly description: "Composite performance score (0-100).";
        readonly unit: "score";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            category: string;
            baseline?: number;
        };
    };
    readonly "gemini_cli.performance.regression.percentage_change": {
        readonly description: "Percentage change compared to baseline for detected regressions.";
        readonly unit: "percent";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            metric: string;
            severity: "low" | "medium" | "high";
            current_value: number;
            baseline_value: number;
        };
    };
    readonly "gemini_cli.performance.baseline.comparison": {
        readonly description: "Performance comparison to established baseline (percentage change).";
        readonly unit: "percent";
        readonly valueType: ValueType.DOUBLE;
        readonly assign: (h: Histogram) => Histogram<Attributes>;
        readonly attributes: {
            metric: string;
            category: string;
            current_value: number;
            baseline_value: number;
        };
    };
};
type AllMetricDefs = typeof COUNTER_DEFINITIONS & typeof HISTOGRAM_DEFINITIONS & typeof PERFORMANCE_COUNTER_DEFINITIONS & typeof PERFORMANCE_HISTOGRAM_DEFINITIONS;
export type MetricDefinitions = {
    [K in keyof AllMetricDefs]: {
        attributes: AllMetricDefs[K]['attributes'];
    };
};
export declare enum FileOperation {
    CREATE = "create",
    READ = "read",
    UPDATE = "update"
}
export declare enum PerformanceMetricType {
    STARTUP = "startup",
    MEMORY = "memory",
    CPU = "cpu",
    TOOL_EXECUTION = "tool_execution",
    API_REQUEST = "api_request",
    TOKEN_EFFICIENCY = "token_efficiency"
}
export declare enum MemoryMetricType {
    HEAP_USED = "heap_used",
    HEAP_TOTAL = "heap_total",
    EXTERNAL = "external",
    RSS = "rss"
}
export declare enum ToolExecutionPhase {
    VALIDATION = "validation",
    PREPARATION = "preparation",
    EXECUTION = "execution",
    RESULT_PROCESSING = "result_processing"
}
export declare enum ApiRequestPhase {
    REQUEST_PREPARATION = "request_preparation",
    NETWORK_LATENCY = "network_latency",
    RESPONSE_PROCESSING = "response_processing",
    TOKEN_PROCESSING = "token_processing"
}
export declare enum GenAiOperationName {
    GENERATE_CONTENT = "generate_content"
}
export declare enum GenAiProviderName {
    GCP_GEN_AI = "gcp.gen_ai",
    GCP_VERTEX_AI = "gcp.vertex_ai"
}
export declare enum GenAiTokenType {
    INPUT = "input",
    OUTPUT = "output"
}
export declare function getMeter(): Meter | undefined;
export declare function initializeMetrics(config: Config): void;
export declare function recordChatCompressionMetrics(config: Config, attributes: MetricDefinitions[typeof EVENT_CHAT_COMPRESSION]['attributes']): void;
export declare function recordToolCallMetrics(config: Config, durationMs: number, attributes: MetricDefinitions[typeof TOOL_CALL_COUNT]['attributes']): void;
export declare function recordCustomTokenUsageMetrics(config: Config, tokenCount: number, attributes: MetricDefinitions[typeof TOKEN_USAGE]['attributes']): void;
export declare function recordCustomApiResponseMetrics(config: Config, durationMs: number, attributes: MetricDefinitions[typeof API_REQUEST_COUNT]['attributes']): void;
export declare function recordApiErrorMetrics(config: Config, durationMs: number, attributes: MetricDefinitions[typeof API_REQUEST_COUNT]['attributes']): void;
export declare function recordFileOperationMetric(config: Config, attributes: MetricDefinitions[typeof FILE_OPERATION_COUNT]['attributes']): void;
export declare function recordLinesChanged(config: Config, lines: number, changeType: 'added' | 'removed', attributes?: {
    function_name?: string;
}): void;
/**
 * Records a metric for when a UI frame flickers.
 */
export declare function recordFlickerFrame(config: Config): void;
/**
 * Records a metric for when user failed to exit
 */
export declare function recordExitFail(config: Config): void;
/**
 * Records a metric for when a UI frame is slow in rendering
 */
export declare function recordSlowRender(config: Config, renderLatency: number): void;
/**
 * Records a metric for when an invalid chunk is received from a stream.
 */
export declare function recordInvalidChunk(config: Config): void;
/**
 * Records a metric for when a retry is triggered due to a content error.
 */
export declare function recordContentRetry(config: Config): void;
/**
 * Records a metric for when all content error retries have failed for a request.
 */
export declare function recordContentRetryFailure(config: Config): void;
export declare function recordModelSlashCommand(config: Config, event: ModelSlashCommandEvent): void;
export declare function recordModelRoutingMetrics(config: Config, event: ModelRoutingEvent): void;
export declare function recordAgentRunMetrics(config: Config, event: AgentFinishEvent): void;
export declare function recordRecoveryAttemptMetrics(config: Config, event: RecoveryAttemptEvent): void;
export declare function recordGenAiClientTokenUsage(config: Config, tokenCount: number, attributes: MetricDefinitions[typeof GEN_AI_CLIENT_TOKEN_USAGE]['attributes']): void;
export declare function recordGenAiClientOperationDuration(config: Config, durationSeconds: number, attributes: MetricDefinitions[typeof GEN_AI_CLIENT_OPERATION_DURATION]['attributes']): void;
export declare function getConventionAttributes(event: {
    model: string;
    auth_type?: string;
}): {
    'gen_ai.operation.name': GenAiOperationName;
    'gen_ai.provider.name': GenAiProviderName;
    'gen_ai.request.model': string;
    'gen_ai.response.model': string;
};
export declare function initializePerformanceMonitoring(config: Config): void;
export declare function recordStartupPerformance(config: Config, durationMs: number, attributes: MetricDefinitions[typeof STARTUP_TIME]['attributes']): void;
export declare function recordMemoryUsage(config: Config, bytes: number, attributes: MetricDefinitions[typeof MEMORY_USAGE]['attributes']): void;
export declare function recordCpuUsage(config: Config, percentage: number, attributes: MetricDefinitions[typeof CPU_USAGE]['attributes']): void;
export declare function recordToolQueueDepth(config: Config, queueDepth: number): void;
export declare function recordToolExecutionBreakdown(config: Config, durationMs: number, attributes: MetricDefinitions[typeof TOOL_EXECUTION_BREAKDOWN]['attributes']): void;
export declare function recordTokenEfficiency(config: Config, value: number, attributes: MetricDefinitions[typeof TOKEN_EFFICIENCY]['attributes']): void;
export declare function recordApiRequestBreakdown(config: Config, durationMs: number, attributes: MetricDefinitions[typeof API_REQUEST_BREAKDOWN]['attributes']): void;
export declare function recordPerformanceScore(config: Config, score: number, attributes: MetricDefinitions[typeof PERFORMANCE_SCORE]['attributes']): void;
export declare function recordPerformanceRegression(config: Config, attributes: MetricDefinitions[typeof REGRESSION_DETECTION]['attributes']): void;
export declare function recordBaselineComparison(config: Config, attributes: MetricDefinitions[typeof BASELINE_COMPARISON]['attributes']): void;
export declare function isPerformanceMonitoringActive(): boolean;
/**
 * Token usage recording that emits both custom and convention metrics.
 */
export declare function recordTokenUsageMetrics(config: Config, tokenCount: number, attributes: {
    model: string;
    type: 'input' | 'output' | 'thought' | 'cache' | 'tool';
    genAiAttributes?: {
        'gen_ai.operation.name': string;
        'gen_ai.provider.name': string;
        'gen_ai.request.model'?: string;
        'gen_ai.response.model'?: string;
        'server.address'?: string;
        'server.port'?: number;
    };
}): void;
/**
 * Operation latency recording that emits both custom and convention metrics.
 */
export declare function recordApiResponseMetrics(config: Config, durationMs: number, attributes: {
    model: string;
    status_code?: number | string;
    genAiAttributes?: {
        'gen_ai.operation.name': string;
        'gen_ai.provider.name': string;
        'gen_ai.request.model'?: string;
        'gen_ai.response.model'?: string;
        'server.address'?: string;
        'server.port'?: number;
        'error.type'?: string;
    };
}): void;
export declare function recordHookCallMetrics(config: Config, hookEventName: string, hookName: string, durationMs: number, success: boolean): void;
export {};
