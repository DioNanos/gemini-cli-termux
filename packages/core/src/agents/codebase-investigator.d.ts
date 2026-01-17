/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { LocalAgentDefinition } from './types.js';
import { z } from 'zod';
declare const CodebaseInvestigationReportSchema: z.ZodObject<{
    SummaryOfFindings: z.ZodString;
    ExplorationTrace: z.ZodArray<z.ZodString, "many">;
    RelevantLocations: z.ZodArray<z.ZodObject<{
        FilePath: z.ZodString;
        Reasoning: z.ZodString;
        KeySymbols: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        FilePath: string;
        Reasoning: string;
        KeySymbols: string[];
    }, {
        FilePath: string;
        Reasoning: string;
        KeySymbols: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    SummaryOfFindings: string;
    ExplorationTrace: string[];
    RelevantLocations: {
        FilePath: string;
        Reasoning: string;
        KeySymbols: string[];
    }[];
}, {
    SummaryOfFindings: string;
    ExplorationTrace: string[];
    RelevantLocations: {
        FilePath: string;
        Reasoning: string;
        KeySymbols: string[];
    }[];
}>;
/**
 * A Proof-of-Concept subagent specialized in analyzing codebase structure,
 * dependencies, and technologies.
 */
export declare const CodebaseInvestigatorAgent: LocalAgentDefinition<typeof CodebaseInvestigationReportSchema>;
export {};
