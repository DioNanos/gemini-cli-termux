/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ClientMetadata } from '../types.js';
/**
 * Returns the client metadata.
 *
 * The client metadata is cached so that it is only computed once per session.
 */
export declare function getClientMetadata(): Promise<ClientMetadata>;
