/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Config } from '../../config/config.js';
import type { BaseLlmClient } from '../../core/baseLlmClient.js';
import type { RoutingContext, RoutingDecision, RoutingStrategy } from '../routingStrategy.js';
export declare class FallbackStrategy implements RoutingStrategy {
    readonly name = "fallback";
    route(context: RoutingContext, config: Config, _baseLlmClient: BaseLlmClient): Promise<RoutingDecision | null>;
}
