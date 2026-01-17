/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../../config/config.js';
import type { BaseLlmClient } from '../../core/baseLlmClient.js';
import type { RoutingContext, RoutingDecision, RoutingStrategy, TerminalStrategy } from '../routingStrategy.js';
/**
 * A strategy that attempts a list of child strategies in order (Chain of Responsibility).
 */
export declare class CompositeStrategy implements TerminalStrategy {
    readonly name: string;
    private strategies;
    /**
     * Initializes the CompositeStrategy.
     * @param strategies The strategies to try, in order of priority. The last strategy must be terminal.
     * @param name The name of this composite configuration (e.g., 'router' or 'composite').
     */
    constructor(strategies: [...RoutingStrategy[], TerminalStrategy], name?: string);
    route(context: RoutingContext, config: Config, baseLlmClient: BaseLlmClient): Promise<RoutingDecision>;
    /**
     * Helper function to enhance the decision metadata with composite information.
     */
    private finalizeDecision;
}
