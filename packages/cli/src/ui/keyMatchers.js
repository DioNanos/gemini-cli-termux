/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Command, defaultKeyBindings } from '../config/keyBindings.js';
/**
 * Matches a KeyBinding against an actual Key press
 * Pure data-driven matching logic
 */
function matchKeyBinding(keyBinding, key) {
    if (keyBinding.key !== key.name) {
        return false;
    }
    // Check modifiers - follow original logic:
    // undefined = ignore this modifier (original behavior)
    // true = modifier must be pressed
    // false = modifier must NOT be pressed
    if (keyBinding.ctrl !== undefined && key.ctrl !== keyBinding.ctrl) {
        return false;
    }
    if (keyBinding.shift !== undefined && key.shift !== keyBinding.shift) {
        return false;
    }
    if (keyBinding.command !== undefined && key.meta !== keyBinding.command) {
        return false;
    }
    return true;
}
/**
 * Checks if a key matches any of the bindings for a command
 */
function matchCommand(command, key, config = defaultKeyBindings) {
    const bindings = config[command];
    return bindings.some((binding) => matchKeyBinding(binding, key));
}
/**
 * Creates key matchers from a key binding configuration
 */
export function createKeyMatchers(config = defaultKeyBindings) {
    const matchers = {};
    for (const command of Object.values(Command)) {
        matchers[command] = (key) => matchCommand(command, key, config);
    }
    return matchers;
}
/**
 * Default key binding matchers using the default configuration
 */
export const keyMatchers = createKeyMatchers(defaultKeyBindings);
// Re-export Command for convenience
export { Command };
//# sourceMappingURL=keyMatchers.js.map