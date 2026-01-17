import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { formatDuration } from '../utils/formatters.js';
import { calculateAverageLatency, calculateCacheHitRate, calculateErrorRate, } from '../utils/computeStats.js';
import { useSessionStats } from '../contexts/SessionContext.js';
import { Table } from './Table.js';
export const ModelStatsDisplay = () => {
    const { stats } = useSessionStats();
    const { models } = stats.metrics;
    const activeModels = Object.entries(models).filter(([, metrics]) => metrics.api.totalRequests > 0);
    if (activeModels.length === 0) {
        return (_jsx(Box, { borderStyle: "round", borderColor: theme.border.default, paddingY: 1, paddingX: 2, children: _jsx(Text, { color: theme.text.primary, children: "No API calls have been made in this session." }) }));
    }
    const modelNames = activeModels.map(([name]) => name);
    const hasThoughts = activeModels.some(([, metrics]) => metrics.tokens.thoughts > 0);
    const hasTool = activeModels.some(([, metrics]) => metrics.tokens.tool > 0);
    const hasCached = activeModels.some(([, metrics]) => metrics.tokens.cached > 0);
    // Helper to create a row with values for each model
    const createRow = (metric, getValue, options = {}) => {
        const row = {
            metric,
            isSection: options.isSection,
            isSubtle: options.isSubtle,
        };
        activeModels.forEach(([name, metrics]) => {
            row[name] = getValue(metrics);
        });
        return row;
    };
    const rows = [
        // API Section
        { metric: 'API', isSection: true },
        createRow('Requests', (m) => m.api.totalRequests.toLocaleString()),
        createRow('Errors', (m) => {
            const errorRate = calculateErrorRate(m);
            return (_jsxs(Text, { color: m.api.totalErrors > 0 ? theme.status.error : theme.text.primary, children: [m.api.totalErrors.toLocaleString(), " (", errorRate.toFixed(1), "%)"] }));
        }),
        createRow('Avg Latency', (m) => formatDuration(calculateAverageLatency(m))),
        // Spacer
        { metric: '' },
        // Tokens Section
        { metric: 'Tokens', isSection: true },
        createRow('Total', (m) => (_jsx(Text, { color: theme.text.secondary, children: m.tokens.total.toLocaleString() }))),
        createRow('Input', (m) => (_jsx(Text, { color: theme.text.primary, children: m.tokens.input.toLocaleString() })), { isSubtle: true }),
    ];
    if (hasCached) {
        rows.push(createRow('Cache Reads', (m) => {
            const cacheHitRate = calculateCacheHitRate(m);
            return (_jsxs(Text, { color: theme.text.secondary, children: [m.tokens.cached.toLocaleString(), " (", cacheHitRate.toFixed(1), "%)"] }));
        }, { isSubtle: true }));
    }
    if (hasThoughts) {
        rows.push(createRow('Thoughts', (m) => (_jsx(Text, { color: theme.text.primary, children: m.tokens.thoughts.toLocaleString() })), { isSubtle: true }));
    }
    if (hasTool) {
        rows.push(createRow('Tool', (m) => (_jsx(Text, { color: theme.text.primary, children: m.tokens.tool.toLocaleString() })), { isSubtle: true }));
    }
    rows.push(createRow('Output', (m) => (_jsx(Text, { color: theme.text.primary, children: m.tokens.candidates.toLocaleString() })), { isSubtle: true }));
    const columns = [
        {
            key: 'metric',
            header: 'Metric',
            width: 28,
            renderCell: (row) => (_jsx(Text, { bold: row.isSection, color: row.isSection ? theme.text.primary : theme.text.link, children: row.isSubtle ? `  ↳ ${row.metric}` : row.metric })),
        },
        ...modelNames.map((name) => ({
            key: name,
            header: name,
            flexGrow: 1,
            renderCell: (row) => {
                // Don't render anything for section headers in model columns
                if (row.isSection)
                    return null;
                const val = row[name];
                if (val === undefined || val === null)
                    return null;
                if (typeof val === 'string' || typeof val === 'number') {
                    return _jsx(Text, { color: theme.text.primary, children: val });
                }
                return val;
            },
        })),
    ];
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "column", paddingY: 1, paddingX: 2, children: [_jsx(Text, { bold: true, color: theme.text.accent, children: "Model Stats For Nerds" }), _jsx(Box, { height: 1 }), _jsx(Table, { data: rows, columns: columns })] }));
};
//# sourceMappingURL=ModelStatsDisplay.js.map