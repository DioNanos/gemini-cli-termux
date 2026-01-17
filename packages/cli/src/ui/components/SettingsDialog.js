import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import { AsyncFzf } from 'fzf';
import { theme } from '../semantic-colors.js';
import { SettingScope } from '../../config/settings.js';
import { getScopeItems, getScopeMessageForSetting, } from '../../utils/dialogScopeUtils.js';
import { RadioButtonSelect } from './shared/RadioButtonSelect.js';
import { getDialogSettingKeys, setPendingSettingValue, getDisplayValue, hasRestartRequiredSettings, saveModifiedSettings, getSettingDefinition, isDefaultValue, requiresRestart, getRestartRequiredFromModified, getEffectiveDefaultValue, setPendingSettingValueAny, getNestedValue, getEffectiveValue, } from '../../utils/settingsUtils.js';
import { useVimMode } from '../contexts/VimModeContext.js';
import { useKeypress } from '../hooks/useKeypress.js';
import chalk from 'chalk';
import { cpSlice, cpLen, stripUnsafeCharacters } from '../utils/textUtils.js';
import { TOGGLE_TYPES, } from '../../config/settingsSchema.js';
import { debugLogger } from '@google/gemini-cli-core';
import { keyMatchers, Command } from '../keyMatchers.js';
import { useUIState } from '../contexts/UIStateContext.js';
import { useTextBuffer } from './shared/text-buffer.js';
import { TextInput } from './shared/TextInput.js';
const maxItemsToShow = 8;
export function SettingsDialog({ settings, onSelect, onRestartRequest, availableTerminalHeight, config, }) {
    const columns = process.stdout.columns ?? 80;
    const mobileMode = (settings.merged.general?.mobileSettings ?? true) || columns < 80;
    // Get vim mode context to sync vim mode changes
    const { vimEnabled, toggleVimEnabled } = useVimMode();
    // Focus state: 'settings' or 'scope'
    const [focusSection, setFocusSection] = useState('settings');
    // Scope selector state (User by default)
    const [selectedScope, setSelectedScope] = useState(SettingScope.User);
    // Active indices
    const [activeSettingIndex, setActiveSettingIndex] = useState(0);
    // Scroll offset for settings
    const [scrollOffset, setScrollOffset] = useState(0);
    const [showRestartPrompt, setShowRestartPrompt] = useState(false);
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredKeys, setFilteredKeys] = useState(() => getDialogSettingKeys());
    const { fzfInstance, searchMap } = useMemo(() => {
        const keys = getDialogSettingKeys();
        const map = new Map();
        const searchItems = [];
        keys.forEach((key) => {
            const def = getSettingDefinition(key);
            if (def?.label) {
                searchItems.push(def.label);
                map.set(def.label.toLowerCase(), key);
            }
        });
        const fzf = new AsyncFzf(searchItems, {
            fuzzy: 'v2',
            casing: 'case-insensitive',
        });
        return { fzfInstance: fzf, searchMap: map };
    }, []);
    // Perform search
    useEffect(() => {
        let active = true;
        if (!searchQuery.trim() || !fzfInstance) {
            setFilteredKeys(getDialogSettingKeys());
            return;
        }
        const doSearch = async () => {
            const results = await fzfInstance.find(searchQuery);
            if (!active)
                return;
            const matchedKeys = new Set();
            results.forEach((res) => {
                const key = searchMap.get(res.item.toLowerCase());
                if (key)
                    matchedKeys.add(key);
            });
            setFilteredKeys(Array.from(matchedKeys));
            setActiveSettingIndex(0); // Reset cursor
            setScrollOffset(0);
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        doSearch();
        return () => {
            active = false;
        };
    }, [searchQuery, fzfInstance, searchMap]);
    // Local pending settings state for the selected scope
    const [pendingSettings, setPendingSettings] = useState(() => 
    // Deep clone to avoid mutation
    structuredClone(settings.forScope(selectedScope).settings));
    // Track which settings have been modified by the user
    const [modifiedSettings, setModifiedSettings] = useState(new Set());
    const [globalPendingChanges, setGlobalPendingChanges] = useState(new Map());
    // Track restart-required settings across scope changes
    const [_restartRequiredSettings, setRestartRequiredSettings] = useState(new Set());
    useEffect(() => {
        // Base settings for selected scope
        let updated = structuredClone(settings.forScope(selectedScope).settings);
        // Overlay globally pending (unsaved) changes so user sees their modifications in any scope
        const newModified = new Set();
        const newRestartRequired = new Set();
        for (const [key, value] of globalPendingChanges.entries()) {
            const def = getSettingDefinition(key);
            if (def?.type === 'boolean' && typeof value === 'boolean') {
                updated = setPendingSettingValue(key, value, updated);
            }
            else if ((def?.type === 'number' && typeof value === 'number') ||
                ((def?.type === 'string' || def?.type === 'enum') &&
                    typeof value === 'string')) {
                updated = setPendingSettingValueAny(key, value, updated);
            }
            newModified.add(key);
            if (requiresRestart(key))
                newRestartRequired.add(key);
        }
        setPendingSettings(updated);
        setModifiedSettings(newModified);
        setRestartRequiredSettings(newRestartRequired);
        setShowRestartPrompt(newRestartRequired.size > 0);
    }, [selectedScope, settings, globalPendingChanges]);
    const generateSettingsItems = () => {
        const settingKeys = searchQuery ? filteredKeys : getDialogSettingKeys();
        return settingKeys.map((key) => {
            const definition = getSettingDefinition(key);
            return {
                label: definition?.label || key,
                value: key,
                type: definition?.type,
                toggle: () => {
                    if (!TOGGLE_TYPES.has(definition?.type)) {
                        return;
                    }
                    const currentValue = getEffectiveValue(key, pendingSettings, {});
                    let newValue;
                    if (definition?.type === 'boolean') {
                        newValue = !currentValue;
                        setPendingSettings((prev) => setPendingSettingValue(key, newValue, prev));
                    }
                    else if (definition?.type === 'enum' && definition.options) {
                        const options = definition.options;
                        const currentIndex = options?.findIndex((opt) => opt.value === currentValue);
                        if (currentIndex !== -1 && currentIndex < options.length - 1) {
                            newValue = options[currentIndex + 1].value;
                        }
                        else {
                            newValue = options[0].value; // loop back to start.
                        }
                        setPendingSettings((prev) => setPendingSettingValueAny(key, newValue, prev));
                    }
                    if (!requiresRestart(key)) {
                        const immediateSettings = new Set([key]);
                        const currentScopeSettings = settings.forScope(selectedScope).settings;
                        const immediateSettingsObject = setPendingSettingValueAny(key, newValue, currentScopeSettings);
                        debugLogger.log(`[DEBUG SettingsDialog] Saving ${key} immediately with value:`, newValue);
                        saveModifiedSettings(immediateSettings, immediateSettingsObject, settings, selectedScope);
                        // Special handling for vim mode to sync with VimModeContext
                        if (key === 'general.vimMode' && newValue !== vimEnabled) {
                            // Call toggleVimEnabled to sync the VimModeContext local state
                            toggleVimEnabled().catch(() => {
                                // Silently ignore vim mode toggle errors
                            });
                        }
                        // Remove from modifiedSettings since it's now saved
                        setModifiedSettings((prev) => {
                            const updated = new Set(prev);
                            updated.delete(key);
                            return updated;
                        });
                        // Also remove from restart-required settings if it was there
                        setRestartRequiredSettings((prev) => {
                            const updated = new Set(prev);
                            updated.delete(key);
                            return updated;
                        });
                        // Remove from global pending changes if present
                        setGlobalPendingChanges((prev) => {
                            if (!prev.has(key))
                                return prev;
                            const next = new Map(prev);
                            next.delete(key);
                            return next;
                        });
                        if (key === 'general.previewFeatures') {
                            config?.setPreviewFeatures(newValue);
                        }
                    }
                    else {
                        // For restart-required settings, track as modified
                        setModifiedSettings((prev) => {
                            const updated = new Set(prev).add(key);
                            const needsRestart = hasRestartRequiredSettings(updated);
                            debugLogger.log(`[DEBUG SettingsDialog] Modified settings:`, Array.from(updated), 'Needs restart:', needsRestart);
                            if (needsRestart) {
                                setShowRestartPrompt(true);
                                setRestartRequiredSettings((prevRestart) => new Set(prevRestart).add(key));
                            }
                            return updated;
                        });
                        // Add/update pending change globally so it persists across scopes
                        setGlobalPendingChanges((prev) => {
                            const next = new Map(prev);
                            next.set(key, newValue);
                            return next;
                        });
                    }
                },
            };
        });
    };
    const items = generateSettingsItems();
    // Generic edit state
    const [editingKey, setEditingKey] = useState(null);
    const [editBuffer, setEditBuffer] = useState('');
    const [editCursorPos, setEditCursorPos] = useState(0); // Cursor position within edit buffer
    const [cursorVisible, setCursorVisible] = useState(true);
    useEffect(() => {
        if (!editingKey) {
            setCursorVisible(true);
            return;
        }
        const id = setInterval(() => setCursorVisible((v) => !v), 500);
        return () => clearInterval(id);
    }, [editingKey]);
    const startEditing = (key, initial) => {
        setEditingKey(key);
        const initialValue = initial ?? '';
        setEditBuffer(initialValue);
        setEditCursorPos(cpLen(initialValue)); // Position cursor at end of initial value
    };
    const commitEdit = (key) => {
        const definition = getSettingDefinition(key);
        const type = definition?.type;
        if (editBuffer.trim() === '' && type === 'number') {
            // Nothing entered for a number; cancel edit
            setEditingKey(null);
            setEditBuffer('');
            setEditCursorPos(0);
            return;
        }
        let parsed;
        if (type === 'number') {
            const numParsed = Number(editBuffer.trim());
            if (Number.isNaN(numParsed)) {
                // Invalid number; cancel edit
                setEditingKey(null);
                setEditBuffer('');
                setEditCursorPos(0);
                return;
            }
            parsed = numParsed;
        }
        else {
            // For strings, use the buffer as is.
            parsed = editBuffer;
        }
        // Update pending
        setPendingSettings((prev) => setPendingSettingValueAny(key, parsed, prev));
        if (!requiresRestart(key)) {
            const immediateSettings = new Set([key]);
            const currentScopeSettings = settings.forScope(selectedScope).settings;
            const immediateSettingsObject = setPendingSettingValueAny(key, parsed, currentScopeSettings);
            saveModifiedSettings(immediateSettings, immediateSettingsObject, settings, selectedScope);
            // Remove from modified sets if present
            setModifiedSettings((prev) => {
                const updated = new Set(prev);
                updated.delete(key);
                return updated;
            });
            setRestartRequiredSettings((prev) => {
                const updated = new Set(prev);
                updated.delete(key);
                return updated;
            });
            // Remove from global pending since it's immediately saved
            setGlobalPendingChanges((prev) => {
                if (!prev.has(key))
                    return prev;
                const next = new Map(prev);
                next.delete(key);
                return next;
            });
        }
        else {
            // Mark as modified and needing restart
            setModifiedSettings((prev) => {
                const updated = new Set(prev).add(key);
                const needsRestart = hasRestartRequiredSettings(updated);
                if (needsRestart) {
                    setShowRestartPrompt(true);
                    setRestartRequiredSettings((prevRestart) => new Set(prevRestart).add(key));
                }
                return updated;
            });
            // Record pending change globally for persistence across scopes
            setGlobalPendingChanges((prev) => {
                const next = new Map(prev);
                next.set(key, parsed);
                return next;
            });
        }
        setEditingKey(null);
        setEditBuffer('');
        setEditCursorPos(0);
    };
    // Scope selector items
    const scopeItems = getScopeItems().map((item) => ({
        ...item,
        key: item.value,
    }));
    const handleScopeHighlight = (scope) => {
        setSelectedScope(scope);
    };
    const handleScopeSelect = (scope) => {
        handleScopeHighlight(scope);
        setFocusSection('settings');
    };
    // Height constraint calculations similar to ThemeDialog
    const DIALOG_PADDING = 5;
    const SETTINGS_TITLE_HEIGHT = 2; // "Settings" title + spacing
    const SCROLL_ARROWS_HEIGHT = 2; // Up and down arrows
    const SPACING_HEIGHT = 1; // Space between settings list and scope
    const SCOPE_SELECTION_HEIGHT = 4; // Apply To section height
    const BOTTOM_HELP_TEXT_HEIGHT = 1; // Help text
    const RESTART_PROMPT_HEIGHT = showRestartPrompt ? 1 : 0;
    let currentAvailableTerminalHeight = availableTerminalHeight ?? Number.MAX_SAFE_INTEGER;
    currentAvailableTerminalHeight -= 2; // Top and bottom borders
    // Start with basic fixed height (without scope selection)
    let totalFixedHeight = DIALOG_PADDING +
        SETTINGS_TITLE_HEIGHT +
        SCROLL_ARROWS_HEIGHT +
        SPACING_HEIGHT +
        BOTTOM_HELP_TEXT_HEIGHT +
        RESTART_PROMPT_HEIGHT;
    // Calculate how much space we have for settings
    let availableHeightForSettings = Math.max(1, currentAvailableTerminalHeight - totalFixedHeight);
    // Each setting item takes 2 lines (the setting row + spacing)
    let maxVisibleItems = Math.max(1, Math.floor(availableHeightForSettings / 2));
    // Decide whether to show scope selection based on remaining space
    let showScopeSelection = true;
    // If we have limited height, prioritize showing more settings over scope selection
    if (availableTerminalHeight && availableTerminalHeight < 25) {
        // For very limited height, hide scope selection to show more settings
        const totalWithScope = totalFixedHeight + SCOPE_SELECTION_HEIGHT;
        const availableWithScope = Math.max(1, currentAvailableTerminalHeight - totalWithScope);
        const maxItemsWithScope = Math.max(1, Math.floor(availableWithScope / 2));
        // If hiding scope selection allows us to show significantly more settings, do it
        if (maxVisibleItems > maxItemsWithScope + 1) {
            showScopeSelection = false;
        }
        else {
            // Otherwise include scope selection and recalculate
            totalFixedHeight += SCOPE_SELECTION_HEIGHT;
            availableHeightForSettings = Math.max(1, currentAvailableTerminalHeight - totalFixedHeight);
            maxVisibleItems = Math.max(1, Math.floor(availableHeightForSettings / 2));
        }
    }
    else {
        // For normal height, include scope selection
        totalFixedHeight += SCOPE_SELECTION_HEIGHT;
        availableHeightForSettings = Math.max(1, currentAvailableTerminalHeight - totalFixedHeight);
        maxVisibleItems = Math.max(1, Math.floor(availableHeightForSettings / 2));
    }
    // Use the calculated maxVisibleItems or fall back to the original maxItemsToShow
    const effectiveMaxItemsToShow = availableTerminalHeight
        ? Math.min(maxVisibleItems, items.length)
        : maxItemsToShow;
    // Ensure focus stays on settings when scope selection is hidden
    React.useEffect(() => {
        if (!showScopeSelection && focusSection === 'scope') {
            setFocusSection('settings');
        }
    }, [showScopeSelection, focusSection]);
    // Scroll logic for settings
    const visibleItems = items.slice(scrollOffset, scrollOffset + effectiveMaxItemsToShow);
    // Show arrows if there are more items than can be displayed
    const showScrollUp = items.length > effectiveMaxItemsToShow;
    const showScrollDown = items.length > effectiveMaxItemsToShow;
    const saveRestartRequiredSettings = () => {
        const restartRequiredSettings = getRestartRequiredFromModified(modifiedSettings);
        const restartRequiredSet = new Set(restartRequiredSettings);
        if (restartRequiredSet.size > 0) {
            saveModifiedSettings(restartRequiredSet, pendingSettings, settings, selectedScope);
            // Remove saved keys from global pending changes
            setGlobalPendingChanges((prev) => {
                if (prev.size === 0)
                    return prev;
                const next = new Map(prev);
                for (const key of restartRequiredSet) {
                    next.delete(key);
                }
                return next;
            });
        }
    };
    useKeypress((key) => {
        const { name } = key;
        if (name === 'tab' && showScopeSelection) {
            setFocusSection((prev) => (prev === 'settings' ? 'scope' : 'settings'));
        }
        if (focusSection === 'settings') {
            // If editing, capture input and control keys
            if (editingKey) {
                const definition = getSettingDefinition(editingKey);
                const type = definition?.type;
                if (key.name === 'paste' && key.sequence) {
                    let pasted = key.sequence;
                    if (type === 'number') {
                        pasted = key.sequence.replace(/[^0-9\-+.]/g, '');
                    }
                    if (pasted) {
                        setEditBuffer((b) => {
                            const before = cpSlice(b, 0, editCursorPos);
                            const after = cpSlice(b, editCursorPos);
                            return before + pasted + after;
                        });
                        setEditCursorPos((pos) => pos + cpLen(pasted));
                    }
                    return;
                }
                if (name === 'backspace' || name === 'delete') {
                    if (name === 'backspace' && editCursorPos > 0) {
                        setEditBuffer((b) => {
                            const before = cpSlice(b, 0, editCursorPos - 1);
                            const after = cpSlice(b, editCursorPos);
                            return before + after;
                        });
                        setEditCursorPos((pos) => pos - 1);
                    }
                    else if (name === 'delete' && editCursorPos < cpLen(editBuffer)) {
                        setEditBuffer((b) => {
                            const before = cpSlice(b, 0, editCursorPos);
                            const after = cpSlice(b, editCursorPos + 1);
                            return before + after;
                        });
                        // Cursor position stays the same for delete
                    }
                    return;
                }
                if (keyMatchers[Command.ESCAPE](key)) {
                    commitEdit(editingKey);
                    return;
                }
                if (keyMatchers[Command.RETURN](key)) {
                    commitEdit(editingKey);
                    return;
                }
                let ch = key.sequence;
                let isValidChar = false;
                if (type === 'number') {
                    // Allow digits, minus, plus, and dot.
                    isValidChar = /[0-9\-+.]/.test(ch);
                }
                else {
                    ch = stripUnsafeCharacters(ch);
                    // For strings, allow any single character that isn't a control
                    // sequence.
                    isValidChar = ch.length === 1;
                }
                if (isValidChar) {
                    setEditBuffer((currentBuffer) => {
                        const beforeCursor = cpSlice(currentBuffer, 0, editCursorPos);
                        const afterCursor = cpSlice(currentBuffer, editCursorPos);
                        return beforeCursor + ch + afterCursor;
                    });
                    setEditCursorPos((pos) => pos + 1);
                    return;
                }
                // Arrow key navigation
                if (name === 'left') {
                    setEditCursorPos((pos) => Math.max(0, pos - 1));
                    return;
                }
                if (name === 'right') {
                    setEditCursorPos((pos) => Math.min(cpLen(editBuffer), pos + 1));
                    return;
                }
                // Home and End keys
                if (keyMatchers[Command.HOME](key)) {
                    setEditCursorPos(0);
                    return;
                }
                if (keyMatchers[Command.END](key)) {
                    setEditCursorPos(cpLen(editBuffer));
                    return;
                }
                // Block other keys while editing
                return;
            }
            if (keyMatchers[Command.DIALOG_NAVIGATION_UP](key)) {
                // If editing, commit first
                if (editingKey) {
                    commitEdit(editingKey);
                }
                const newIndex = activeSettingIndex > 0 ? activeSettingIndex - 1 : items.length - 1;
                setActiveSettingIndex(newIndex);
                // Adjust scroll offset for wrap-around
                if (newIndex === items.length - 1) {
                    setScrollOffset(Math.max(0, items.length - effectiveMaxItemsToShow));
                }
                else if (newIndex < scrollOffset) {
                    setScrollOffset(newIndex);
                }
            }
            else if (keyMatchers[Command.DIALOG_NAVIGATION_DOWN](key)) {
                // If editing, commit first
                if (editingKey) {
                    commitEdit(editingKey);
                }
                const newIndex = activeSettingIndex < items.length - 1 ? activeSettingIndex + 1 : 0;
                setActiveSettingIndex(newIndex);
                // Adjust scroll offset for wrap-around
                if (newIndex === 0) {
                    setScrollOffset(0);
                }
                else if (newIndex >= scrollOffset + effectiveMaxItemsToShow) {
                    setScrollOffset(newIndex - effectiveMaxItemsToShow + 1);
                }
            }
            else if (keyMatchers[Command.RETURN](key)) {
                const currentItem = items[activeSettingIndex];
                if (currentItem?.type === 'number' ||
                    currentItem?.type === 'string') {
                    startEditing(currentItem.value);
                }
                else {
                    currentItem?.toggle();
                }
            }
            else if (/^[0-9]$/.test(key.sequence || '') && !editingKey) {
                const currentItem = items[activeSettingIndex];
                if (currentItem?.type === 'number') {
                    startEditing(currentItem.value, key.sequence);
                }
            }
            else if (keyMatchers[Command.CLEAR_INPUT](key) ||
                keyMatchers[Command.CLEAR_SCREEN](key)) {
                // Ctrl+C or Ctrl+L: Clear current setting and reset to default
                const currentSetting = items[activeSettingIndex];
                if (currentSetting) {
                    const defaultValue = getEffectiveDefaultValue(currentSetting.value, config);
                    const defType = currentSetting.type;
                    if (defType === 'boolean') {
                        const booleanDefaultValue = typeof defaultValue === 'boolean' ? defaultValue : false;
                        setPendingSettings((prev) => setPendingSettingValue(currentSetting.value, booleanDefaultValue, prev));
                    }
                    else if (defType === 'number' || defType === 'string') {
                        if (typeof defaultValue === 'number' ||
                            typeof defaultValue === 'string') {
                            setPendingSettings((prev) => setPendingSettingValueAny(currentSetting.value, defaultValue, prev));
                        }
                    }
                    // Remove from modified settings since it's now at default
                    setModifiedSettings((prev) => {
                        const updated = new Set(prev);
                        updated.delete(currentSetting.value);
                        return updated;
                    });
                    // Remove from restart-required settings if it was there
                    setRestartRequiredSettings((prev) => {
                        const updated = new Set(prev);
                        updated.delete(currentSetting.value);
                        return updated;
                    });
                    // If this setting doesn't require restart, save it immediately
                    if (!requiresRestart(currentSetting.value)) {
                        const immediateSettings = new Set([currentSetting.value]);
                        const toSaveValue = currentSetting.type === 'boolean'
                            ? typeof defaultValue === 'boolean'
                                ? defaultValue
                                : false
                            : typeof defaultValue === 'number' ||
                                typeof defaultValue === 'string'
                                ? defaultValue
                                : undefined;
                        const currentScopeSettings = settings.forScope(selectedScope).settings;
                        const immediateSettingsObject = toSaveValue !== undefined
                            ? setPendingSettingValueAny(currentSetting.value, toSaveValue, currentScopeSettings)
                            : currentScopeSettings;
                        saveModifiedSettings(immediateSettings, immediateSettingsObject, settings, selectedScope);
                        // Remove from global pending changes if present
                        setGlobalPendingChanges((prev) => {
                            if (!prev.has(currentSetting.value))
                                return prev;
                            const next = new Map(prev);
                            next.delete(currentSetting.value);
                            return next;
                        });
                    }
                    else {
                        // Track default reset as a pending change if restart required
                        if ((currentSetting.type === 'boolean' &&
                            typeof defaultValue === 'boolean') ||
                            (currentSetting.type === 'number' &&
                                typeof defaultValue === 'number') ||
                            (currentSetting.type === 'string' &&
                                typeof defaultValue === 'string')) {
                            setGlobalPendingChanges((prev) => {
                                const next = new Map(prev);
                                next.set(currentSetting.value, defaultValue);
                                return next;
                            });
                        }
                    }
                }
            }
        }
        if (showRestartPrompt && name === 'r') {
            // Only save settings that require restart (non-restart settings were already saved immediately)
            saveRestartRequiredSettings();
            setShowRestartPrompt(false);
            setRestartRequiredSettings(new Set()); // Clear restart-required settings
            if (onRestartRequest)
                onRestartRequest();
        }
        if (keyMatchers[Command.ESCAPE](key)) {
            if (editingKey) {
                commitEdit(editingKey);
            }
            else {
                // Save any restart-required settings before closing
                saveRestartRequiredSettings();
                onSelect(undefined, selectedScope);
            }
        }
    }, { isActive: true });
    const { mainAreaWidth } = useUIState();
    const viewportWidth = mainAreaWidth - 8;
    const buffer = useTextBuffer({
        initialText: '',
        initialCursorOffset: 0,
        viewport: {
            width: viewportWidth,
            height: 1,
        },
        isValidPath: () => false,
        singleLine: true,
        onChange: (text) => setSearchQuery(text),
    });
    return (_jsx(Box, { borderStyle: "round", borderColor: theme.border.default, flexDirection: "row", padding: 1, width: "100%", height: "100%", children: _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsx(Box, { marginX: 1, children: _jsxs(Text, { bold: focusSection === 'settings' && !editingKey, wrap: "truncate", children: [focusSection === 'settings' ? '> ' : '  ', "Settings", ' '] }) }), _jsx(Box, { borderStyle: "round", borderColor: editingKey
                        ? theme.border.default
                        : focusSection === 'settings'
                            ? theme.border.focused
                            : theme.border.default, paddingX: 1, height: 3, marginTop: 1, children: _jsx(TextInput, { focus: focusSection === 'settings' && !editingKey, buffer: buffer, placeholder: "Search to filter" }) }), _jsx(Box, { height: 1 }), visibleItems.length === 0 ? (_jsx(Box, { marginX: 1, height: 1, flexDirection: "column", children: _jsx(Text, { color: theme.text.secondary, children: "No matches found." }) })) : (_jsxs(_Fragment, { children: [showScrollUp && (_jsx(Box, { marginX: 1, children: _jsx(Text, { color: theme.text.secondary, children: "\u25B2" }) })), visibleItems.map((item, idx) => {
                            const isActive = focusSection === 'settings' &&
                                activeSettingIndex === idx + scrollOffset;
                            const scopeSettings = settings.forScope(selectedScope).settings;
                            const mergedSettings = settings.merged;
                            let displayValue;
                            if (editingKey === item.value) {
                                // Show edit buffer with advanced cursor highlighting
                                if (cursorVisible && editCursorPos < cpLen(editBuffer)) {
                                    // Cursor is in the middle or at start of text
                                    const beforeCursor = cpSlice(editBuffer, 0, editCursorPos);
                                    const atCursor = cpSlice(editBuffer, editCursorPos, editCursorPos + 1);
                                    const afterCursor = cpSlice(editBuffer, editCursorPos + 1);
                                    displayValue =
                                        beforeCursor + chalk.inverse(atCursor) + afterCursor;
                                }
                                else if (cursorVisible &&
                                    editCursorPos >= cpLen(editBuffer)) {
                                    // Cursor is at the end - show inverted space
                                    displayValue = editBuffer + chalk.inverse(' ');
                                }
                                else {
                                    // Cursor not visible
                                    displayValue = editBuffer;
                                }
                            }
                            else if (item.type === 'number' || item.type === 'string') {
                                // For numbers/strings, get the actual current value from pending settings
                                const path = item.value.split('.');
                                const currentValue = getNestedValue(pendingSettings, path);
                                const defaultValue = getEffectiveDefaultValue(item.value, config);
                                if (currentValue !== undefined && currentValue !== null) {
                                    displayValue = String(currentValue);
                                }
                                else {
                                    displayValue =
                                        defaultValue !== undefined && defaultValue !== null
                                            ? String(defaultValue)
                                            : '';
                                }
                                // Add * if value differs from default OR if currently being modified
                                const isModified = modifiedSettings.has(item.value);
                                const effectiveCurrentValue = currentValue !== undefined && currentValue !== null
                                    ? currentValue
                                    : defaultValue;
                                const isDifferentFromDefault = effectiveCurrentValue !== defaultValue;
                                if (isDifferentFromDefault || isModified) {
                                    displayValue += '*';
                                }
                            }
                            else {
                                // For booleans and other types, use existing logic
                                displayValue = getDisplayValue(item.value, scopeSettings, mergedSettings, modifiedSettings, pendingSettings);
                            }
                            const shouldBeGreyedOut = isDefaultValue(item.value, scopeSettings);
                            // Generate scope message for this setting
                            const scopeMessage = getScopeMessageForSetting(item.value, selectedScope, settings);
                            return (_jsxs(React.Fragment, { children: [_jsxs(Box, { marginX: 1, flexDirection: "row", alignItems: "center", children: [_jsx(Box, { minWidth: 2, flexShrink: 0, children: _jsx(Text, { color: isActive ? theme.status.success : theme.text.secondary, children: isActive ? '●' : '' }) }), _jsx(Box, { minWidth: mobileMode ? 24 : 50, children: _jsxs(Text, { color: isActive ? theme.status.success : theme.text.primary, children: [item.label, scopeMessage && (_jsxs(Text, { color: theme.text.secondary, children: [' ', scopeMessage] }))] }) }), _jsx(Box, { minWidth: 3 }), _jsx(Text, { wrap: "truncate", color: isActive
                                                    ? theme.status.success
                                                    : shouldBeGreyedOut
                                                        ? theme.text.secondary
                                                        : theme.text.primary, children: mobileMode && typeof displayValue === 'string'
                                                    ? displayValue.length > columns - 30
                                                        ? displayValue.slice(0, columns - 33) + '…'
                                                        : displayValue
                                                    : displayValue })] }), _jsx(Box, { height: 1 })] }, item.value));
                        }), showScrollDown && (_jsx(Box, { marginX: 1, children: _jsx(Text, { color: theme.text.secondary, children: "\u25BC" }) }))] })), _jsx(Box, { height: 1 }), showScopeSelection && (_jsxs(Box, { marginX: 1, flexDirection: "column", children: [_jsxs(Text, { bold: focusSection === 'scope', wrap: "truncate", children: [focusSection === 'scope' ? '> ' : '  ', "Apply To"] }), _jsx(RadioButtonSelect, { items: scopeItems, initialIndex: scopeItems.findIndex((item) => item.value === selectedScope), onSelect: handleScopeSelect, onHighlight: handleScopeHighlight, isFocused: focusSection === 'scope', showNumbers: focusSection === 'scope' })] })), _jsx(Box, { height: 1 }), _jsx(Box, { marginX: 1, children: _jsxs(Text, { color: theme.text.secondary, children: ["(Use Enter to select", showScopeSelection ? ', Tab to change focus' : '', ", Esc to close)"] }) }), showRestartPrompt && (_jsx(Box, { marginX: 1, children: _jsx(Text, { color: theme.status.warning, children: "To see changes, Gemini CLI must be restarted. Press r to exit and apply changes now." }) }))] }) }));
}
//# sourceMappingURL=SettingsDialog.js.map