import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { ThemedGradient } from './ThemedGradient.js';
import { theme } from '../semantic-colors.js';
import { formatDuration } from '../utils/formatters.js';
import { useSessionStats } from '../contexts/SessionContext.js';
import { getStatusColor, TOOL_SUCCESS_RATE_HIGH, TOOL_SUCCESS_RATE_MEDIUM, USER_AGREEMENT_RATE_HIGH, USER_AGREEMENT_RATE_MEDIUM, CACHE_EFFICIENCY_HIGH, CACHE_EFFICIENCY_MEDIUM, } from '../utils/displayUtils.js';
import { computeSessionStats } from '../utils/computeStats.js';
import { VALID_GEMINI_MODELS, } from '@google/gemini-cli-core';
const StatRow = ({ title, children }) => (_jsxs(Box, { children: [_jsx(Box, { width: 28, children: _jsx(Text, { color: theme.text.link, children: title }) }), children] }));
const SubStatRow = ({ title, children }) => (_jsxs(Box, { paddingLeft: 2, children: [_jsx(Box, { width: 26, children: _jsxs(Text, { color: theme.text.secondary, children: ["\u00BB ", title] }) }), children] }));
const Section = ({ title, children }) => (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: title }), children] }));
// Logic for building the unified list of table rows
const buildModelRows = (models, quotas) => {
    const getBaseModelName = (name) => name.replace('-001', '');
    const usedModelNames = new Set(Object.keys(models).map(getBaseModelName));
    // 1. Models with active usage
    const activeRows = Object.entries(models).map(([name, metrics]) => {
        const modelName = getBaseModelName(name);
        const cachedTokens = metrics.tokens.cached;
        const inputTokens = metrics.tokens.input;
        return {
            key: name,
            modelName,
            requests: metrics.api.totalRequests,
            cachedTokens: cachedTokens.toLocaleString(),
            inputTokens: inputTokens.toLocaleString(),
            outputTokens: metrics.tokens.candidates.toLocaleString(),
            bucket: quotas?.buckets?.find((b) => b.modelId === modelName),
            isActive: true,
        };
    });
    // 2. Models with quota only
    const quotaRows = quotas?.buckets
        ?.filter((b) => b.modelId &&
        VALID_GEMINI_MODELS.has(b.modelId) &&
        !usedModelNames.has(b.modelId))
        .map((bucket) => ({
        key: bucket.modelId,
        modelName: bucket.modelId,
        requests: '-',
        cachedTokens: '-',
        inputTokens: '-',
        outputTokens: '-',
        bucket,
        isActive: false,
    })) || [];
    return [...activeRows, ...quotaRows];
};
const formatResetTime = (resetTime) => {
    const diff = new Date(resetTime).getTime() - Date.now();
    if (diff <= 0)
        return '';
    const totalMinutes = Math.ceil(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const fmt = (val, unit) => new Intl.NumberFormat('en', {
        style: 'unit',
        unit,
        unitDisplay: 'narrow',
    }).format(val);
    if (hours > 0 && minutes > 0) {
        return `(Resets in ${fmt(hours, 'hour')} ${fmt(minutes, 'minute')})`;
    }
    else if (hours > 0) {
        return `(Resets in ${fmt(hours, 'hour')})`;
    }
    return `(Resets in ${fmt(minutes, 'minute')})`;
};
const ModelUsageTable = ({ models, quotas, cacheEfficiency, totalCachedTokens }) => {
    const rows = buildModelRows(models, quotas);
    if (rows.length === 0) {
        return null;
    }
    const showQuotaColumn = !!quotas && rows.some((row) => !!row.bucket);
    const nameWidth = 25;
    const requestsWidth = 7;
    const uncachedWidth = 15;
    const cachedWidth = 14;
    const outputTokensWidth = 15;
    const usageLimitWidth = showQuotaColumn ? 28 : 0;
    const cacheEfficiencyColor = getStatusColor(cacheEfficiency, {
        green: CACHE_EFFICIENCY_HIGH,
        yellow: CACHE_EFFICIENCY_MEDIUM,
    });
    const totalWidth = nameWidth +
        requestsWidth +
        (showQuotaColumn
            ? usageLimitWidth
            : uncachedWidth + cachedWidth + outputTokensWidth);
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsxs(Box, { alignItems: "flex-end", children: [_jsx(Box, { width: nameWidth, children: _jsx(Text, { bold: true, color: theme.text.primary, wrap: "truncate-end", children: "Model Usage" }) }), _jsx(Box, { width: requestsWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { bold: true, color: theme.text.primary, children: "Reqs" }) }), !showQuotaColumn && (_jsxs(_Fragment, { children: [_jsx(Box, { width: uncachedWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { bold: true, color: theme.text.primary, children: "Input Tokens" }) }), _jsx(Box, { width: cachedWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { bold: true, color: theme.text.primary, children: "Cache Reads" }) }), _jsx(Box, { width: outputTokensWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { bold: true, color: theme.text.primary, children: "Output Tokens" }) })] })), showQuotaColumn && (_jsx(Box, { width: usageLimitWidth, flexDirection: "column", alignItems: "flex-end", children: _jsx(Text, { bold: true, color: theme.text.primary, children: "Usage left" }) }))] }), _jsx(Box, { borderStyle: "round", borderBottom: true, borderTop: false, borderLeft: false, borderRight: false, borderColor: theme.border.default, width: totalWidth }), rows.map((row) => (_jsxs(Box, { children: [_jsx(Box, { width: nameWidth, children: _jsx(Text, { color: theme.text.primary, wrap: "truncate-end", children: row.modelName }) }), _jsx(Box, { width: requestsWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { color: row.isActive ? theme.text.primary : theme.text.secondary, children: row.requests }) }), !showQuotaColumn && (_jsxs(_Fragment, { children: [_jsx(Box, { width: uncachedWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { color: row.isActive ? theme.text.primary : theme.text.secondary, children: row.inputTokens }) }), _jsx(Box, { width: cachedWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { color: theme.text.secondary, children: row.cachedTokens }) }), _jsx(Box, { width: outputTokensWidth, flexDirection: "column", alignItems: "flex-end", flexShrink: 0, children: _jsx(Text, { color: row.isActive ? theme.text.primary : theme.text.secondary, children: row.outputTokens }) })] })), _jsx(Box, { width: usageLimitWidth, flexDirection: "column", alignItems: "flex-end", children: row.bucket &&
                            row.bucket.remainingFraction != null &&
                            row.bucket.resetTime && (_jsxs(Text, { color: theme.text.secondary, wrap: "truncate-end", children: [(row.bucket.remainingFraction * 100).toFixed(1), "%", ' ', formatResetTime(row.bucket.resetTime)] })) })] }, row.key))), cacheEfficiency > 0 && !showQuotaColumn && (_jsx(Box, { flexDirection: "column", marginTop: 1, children: _jsxs(Text, { color: theme.text.primary, children: [_jsx(Text, { color: theme.status.success, children: "Savings Highlight:" }), ' ', totalCachedTokens.toLocaleString(), " (", _jsxs(Text, { color: cacheEfficiencyColor, children: [cacheEfficiency.toFixed(1), "%"] }), ") of input tokens were served from the cache, reducing costs."] }) })), showQuotaColumn && (_jsxs(_Fragment, { children: [_jsx(Box, { marginTop: 1, marginBottom: 2, children: _jsx(Text, { color: theme.text.primary, children: `Usage limits span all sessions and reset daily.\n/auth to upgrade or switch to API key.` }) }), _jsx(Text, { color: theme.text.secondary, children: "\u00BB Tip: For a full token breakdown, run `/stats model`." })] }))] }));
};
export const StatsDisplay = ({ duration, title, quotas, }) => {
    const { stats } = useSessionStats();
    const { metrics } = stats;
    const { models, tools, files } = metrics;
    const computed = computeSessionStats(metrics);
    const successThresholds = {
        green: TOOL_SUCCESS_RATE_HIGH,
        yellow: TOOL_SUCCESS_RATE_MEDIUM,
    };
    const agreementThresholds = {
        green: USER_AGREEMENT_RATE_HIGH,
        yellow: USER_AGREEMENT_RATE_MEDIUM,
    };
    const successColor = getStatusColor(computed.successRate, successThresholds);
    const agreementColor = getStatusColor(computed.agreementRate, agreementThresholds);
    const renderTitle = () => {
        if (title) {
            return _jsx(ThemedGradient, { bold: true, children: title });
        }
        return (_jsx(Text, { bold: true, color: theme.text.accent, children: "Session Stats" }));
    };
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", paddingY: 1, paddingX: 2, overflow: "hidden", children: [renderTitle(), _jsx(Box, { height: 1 }), _jsxs(Section, { title: "Interaction Summary", children: [_jsx(StatRow, { title: "Session ID:", children: _jsx(Text, { color: theme.text.primary, children: stats.sessionId }) }), _jsx(StatRow, { title: "Tool Calls:", children: _jsxs(Text, { color: theme.text.primary, children: [tools.totalCalls, " (", ' ', _jsxs(Text, { color: theme.status.success, children: ["\u2713 ", tools.totalSuccess] }), ' ', _jsxs(Text, { color: theme.status.error, children: ["x ", tools.totalFail] }), " )"] }) }), _jsx(StatRow, { title: "Success Rate:", children: _jsxs(Text, { color: successColor, children: [computed.successRate.toFixed(1), "%"] }) }), computed.totalDecisions > 0 && (_jsx(StatRow, { title: "User Agreement:", children: _jsxs(Text, { color: agreementColor, children: [computed.agreementRate.toFixed(1), "%", ' ', _jsxs(Text, { color: theme.text.secondary, children: ["(", computed.totalDecisions, " reviewed)"] })] }) })), files &&
                        (files.totalLinesAdded > 0 || files.totalLinesRemoved > 0) && (_jsx(StatRow, { title: "Code Changes:", children: _jsxs(Text, { color: theme.text.primary, children: [_jsxs(Text, { color: theme.status.success, children: ["+", files.totalLinesAdded] }), ' ', _jsxs(Text, { color: theme.status.error, children: ["-", files.totalLinesRemoved] })] }) }))] }), _jsxs(Section, { title: "Performance", children: [_jsx(StatRow, { title: "Wall Time:", children: _jsx(Text, { color: theme.text.primary, children: duration }) }), _jsx(StatRow, { title: "Agent Active:", children: _jsx(Text, { color: theme.text.primary, children: formatDuration(computed.agentActiveTime) }) }), _jsx(SubStatRow, { title: "API Time:", children: _jsxs(Text, { color: theme.text.primary, children: [formatDuration(computed.totalApiTime), ' ', _jsxs(Text, { color: theme.text.secondary, children: ["(", computed.apiTimePercent.toFixed(1), "%)"] })] }) }), _jsx(SubStatRow, { title: "Tool Time:", children: _jsxs(Text, { color: theme.text.primary, children: [formatDuration(computed.totalToolTime), ' ', _jsxs(Text, { color: theme.text.secondary, children: ["(", computed.toolTimePercent.toFixed(1), "%)"] })] }) })] }), _jsx(ModelUsageTable, { models: models, quotas: quotas, cacheEfficiency: computed.cacheEfficiency, totalCachedTokens: computed.totalCachedTokens })] }));
};
//# sourceMappingURL=StatsDisplay.js.map