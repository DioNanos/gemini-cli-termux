/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
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
export function convertInputConfigToJsonSchema(inputConfig) {
    const properties = {};
    const required = [];
    for (const [name, definition] of Object.entries(inputConfig.inputs)) {
        const schemaProperty = {
            description: definition.description,
        };
        switch (definition.type) {
            case 'string':
            case 'number':
            case 'integer':
            case 'boolean':
                schemaProperty.type = definition.type;
                break;
            case 'string[]':
                schemaProperty.type = 'array';
                schemaProperty.items = { type: 'string' };
                break;
            case 'number[]':
                schemaProperty.type = 'array';
                schemaProperty.items = { type: 'number' };
                break;
            default: {
                const exhaustiveCheck = definition.type;
                throw new Error(`Unsupported input type '${exhaustiveCheck}' for parameter '${name}'. ` +
                    'Supported types: string, number, integer, boolean, string[], number[]');
            }
        }
        properties[name] = schemaProperty;
        if (definition.required) {
            required.push(name);
        }
    }
    return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
    };
}
//# sourceMappingURL=schema-utils.js.map