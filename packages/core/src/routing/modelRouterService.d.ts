/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../config/config.js';
import type { RoutingContext, RoutingDecision } from './routingStrategy.js';
/**
 * A centralized service for making model routing decisions.
 */
export declare class ModelRouterService {
    private config;
    private strategy;
    constructor(config: Config);
    private initializeDefaultStrategy;
    /**
     * Determines which model to use for a given request context.
     *
     * @param context The full context of the request.
     * @returns A promise that resolves to a RoutingDecision.
     */
    route(context: RoutingContext): Promise<RoutingDecision>;
}
