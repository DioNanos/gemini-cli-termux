/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { InputConfig } from './types.js';
/**
 * Defines the structure for a JSON Schema object, used for tool function
 * declarations.
 */
interface JsonSchemaObject {
    type: 'object';
    properties: Record<string, JsonSchemaProperty>;
    required?: string[];
}
/**
 * Defines the structure for a property within a {@link JsonSchemaObject}.
 */
interface JsonSchemaProperty {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array';
    description: string;
    items?: {
        type: 'string' | 'number';
    };
}
/**
 * Converts an internal `InputConfig` definition into a standard JSON Schema
 * object suitable for a tool's `FunctionDeclaration`.
 *
 * This utility ensures that the configuration for a subagent's inputs is
 * correctly translated into the format expected by the generative model.
 *
 * @param inputConfig The internal `InputConfig` to convert.
 * @returns A JSON Schema object representing the inputs.
 * @throws An `Error` if an unsupported input type is encountered, ensuring
 * configuration errors are caught early.
 */
export declare function convertInputConfigToJsonSchema(inputConfig: InputConfig): JsonSchemaObject;
export {};
