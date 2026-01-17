/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { AgentDefinitionJson } from '../../types.js';
interface AgentsStatusProps {
    agents: AgentDefinitionJson[];
    terminalWidth: number;
}
export declare const AgentsStatus: React.FC<AgentsStatusProps>;
export {};
