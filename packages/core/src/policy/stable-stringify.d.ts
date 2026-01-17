/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Produces a stable, deterministic JSON string representation with sorted keys.
 *
 * This method is critical for security policy matching. It ensures that the same
 * object always produces the same string representation, regardless of property
 * insertion order, which could vary across different JavaScript engines or
 * runtime conditions.
 *
 * Key behaviors:
 * 1. **Sorted Keys**: Object properties are always serialized in alphabetical order,
 *    ensuring deterministic output for pattern matching.
 *
 * 2. **Circular Reference Protection**: Uses ancestor chain tracking (not just
 *    object identity) to detect true circular references while correctly handling
 *    repeated non-circular object references. Circular references are replaced
 *    with "[Circular]" to prevent stack overflow attacks.
 *
 * 3. **JSON Spec Compliance**:
 *    - undefined values: Omitted from objects, converted to null in arrays
 *    - Functions: Omitted from objects, converted to null in arrays
 *    - toJSON methods: Respected and called when present (per JSON.stringify spec)
 *
 * 4. **Security Considerations**:
 *    - Prevents DoS via circular references that would cause infinite recursion
 *    - Ensures consistent policy rule matching by normalizing property order
 *    - Respects toJSON for objects that sanitize their output
 *    - Handles toJSON methods that throw errors gracefully
 *
 * @param obj - The object to stringify (typically toolCall.args)
 * @returns A deterministic JSON string representation
 *
 * @example
 * // Different property orders produce the same output:
 * stableStringify({b: 2, a: 1}) === stableStringify({a: 1, b: 2})
 * // Returns: '{"a":1,"b":2}'
 *
 * @example
 * // Circular references are handled safely:
 * const obj = {a: 1};
 * obj.self = obj;
 * stableStringify(obj)
 * // Returns: '{"a":1,"self":"[Circular]"}'
 *
 * @example
 * // toJSON methods are respected:
 * const obj = {
 *   sensitive: 'secret',
 *   toJSON: () => ({ safe: 'data' })
 * };
 * stableStringify(obj)
 * // Returns: '{"safe":"data"}'
 */
export declare function stableStringify(obj: unknown): string;
