/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../../config/config.js';
import type { BaseLlmClient } from '../../core/baseLlmClient.js';
import type { RoutingContext, RoutingDecision, RoutingStrategy } from '../routingStrategy.js';
/**
 * Handles cases where the user explicitly specifies a model (override).
 */
export declare class OverrideStrategy implements RoutingStrategy {
    readonly name = "override";
    route(context: RoutingContext, config: Config, _baseLlmClient: BaseLlmClient): Promise<RoutingDecision | null>;
}
