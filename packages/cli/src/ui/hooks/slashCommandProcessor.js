/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { useCallback, useMemo, useEffect, useState, createElement, } from 'react';
import {} from '@google/genai';
import process from 'node:process';
import { GitService, Logger, logSlashCommand, makeSlashCommandEvent, SlashCommandStatus, ToolConfirmationOutcome, Storage, IdeClient, addMCPStatusChangeListener, removeMCPStatusChangeListener, MCPDiscoveryState, } from '@google/gemini-cli-core';
import { useSessionStats } from '../contexts/SessionContext.js';
import { MessageType, ToolCallStatus } from '../types.js';
import {} from '../commands/types.js';
import { CommandService } from '../../services/CommandService.js';
import { BuiltinCommandLoader } from '../../services/BuiltinCommandLoader.js';
import { FileCommandLoader } from '../../services/FileCommandLoader.js';
import { McpPromptLoader } from '../../services/McpPromptLoader.js';
import { parseSlashCommand } from '../../utils/commands.js';
import {} from '../state/extensions.js';
import { appEvents } from '../../utils/events.js';
import { LogoutConfirmationDialog, LogoutChoice, } from '../components/LogoutConfirmationDialog.js';
import { runExitCleanup } from '../../utils/cleanup.js';
/**
 * Hook to define and process slash commands (e.g., /help, /clear).
 */
export const useSlashCommandProcessor = (config, settings, addItem, clearItems, loadHistory, refreshStatic, toggleVimEnabled, setIsProcessing, actions, extensionsUpdateState, isConfigInitialized, setBannerVisible, setCustomDialog) => {
    const session = useSessionStats();
    const [commands, setCommands] = useState(undefined);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const reloadCommands = useCallback(() => {
        setReloadTrigger((v) => v + 1);
    }, []);
    const [confirmationRequest, setConfirmationRequest] = useState(null);
    const [sessionShellAllowlist, setSessionShellAllowlist] = useState(new Set());
    const gitService = useMemo(() => {
        if (!config?.getProjectRoot()) {
            return;
        }
        return new GitService(config.getProjectRoot(), config.storage);
    }, [config]);
    const logger = useMemo(() => {
        const l = new Logger(config?.getSessionId() || '', config?.storage ?? new Storage(process.cwd()));
        // The logger's initialize is async, but we can create the instance
        // synchronously. Commands that use it will await its initialization.
        return l;
    }, [config]);
    const [pendingItem, setPendingItem] = useState(null);
    const pendingHistoryItems = useMemo(() => {
        const items = [];
        if (pendingItem != null) {
            items.push(pendingItem);
        }
        return items;
    }, [pendingItem]);
    const addMessage = useCallback((message) => {
        // Convert Message to HistoryItemWithoutId
        let historyItemContent;
        if (message.type === MessageType.ABOUT) {
            historyItemContent = {
                type: 'about',
                cliVersion: message.cliVersion,
                osVersion: message.osVersion,
                sandboxEnv: message.sandboxEnv,
                modelVersion: message.modelVersion,
                selectedAuthType: message.selectedAuthType,
                gcpProject: message.gcpProject,
                ideClient: message.ideClient,
            };
        }
        else if (message.type === MessageType.HELP) {
            historyItemContent = {
                type: 'help',
                timestamp: message.timestamp,
            };
        }
        else if (message.type === MessageType.STATS) {
            historyItemContent = {
                type: 'stats',
                duration: message.duration,
            };
        }
        else if (message.type === MessageType.MODEL_STATS) {
            historyItemContent = {
                type: 'model_stats',
            };
        }
        else if (message.type === MessageType.TOOL_STATS) {
            historyItemContent = {
                type: 'tool_stats',
            };
        }
        else if (message.type === MessageType.QUIT) {
            historyItemContent = {
                type: 'quit',
                duration: message.duration,
            };
        }
        else if (message.type === MessageType.COMPRESSION) {
            historyItemContent = {
                type: 'compression',
                compression: message.compression,
            };
        }
        else {
            historyItemContent = {
                type: message.type,
                text: message.content,
            };
        }
        addItem(historyItemContent, message.timestamp.getTime());
    }, [addItem]);
    const commandContext = useMemo(() => ({
        services: {
            config,
            settings,
            git: gitService,
            logger,
        },
        ui: {
            addItem,
            clear: () => {
                clearItems();
                refreshStatic();
                setBannerVisible(false);
            },
            loadHistory,
            setDebugMessage: actions.setDebugMessage,
            pendingItem,
            setPendingItem,
            toggleCorgiMode: actions.toggleCorgiMode,
            toggleDebugProfiler: actions.toggleDebugProfiler,
            toggleVimEnabled,
            reloadCommands,
            extensionsUpdateState,
            dispatchExtensionStateUpdate: actions.dispatchExtensionStateUpdate,
            addConfirmUpdateExtensionRequest: actions.addConfirmUpdateExtensionRequest,
            removeComponent: () => setCustomDialog(null),
        },
        session: {
            stats: session.stats,
            sessionShellAllowlist,
        },
    }), [
        config,
        settings,
        gitService,
        logger,
        loadHistory,
        addItem,
        clearItems,
        refreshStatic,
        session.stats,
        actions,
        pendingItem,
        setPendingItem,
        toggleVimEnabled,
        sessionShellAllowlist,
        reloadCommands,
        extensionsUpdateState,
        setBannerVisible,
        setCustomDialog,
    ]);
    useEffect(() => {
        if (!config) {
            return;
        }
        const listener = () => {
            reloadCommands();
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
            const ideClient = await IdeClient.getInstance();
            ideClient.addStatusChangeListener(listener);
        })();
        // Listen for MCP server status changes (e.g. connection, discovery completion)
        // to reload slash commands (since they may include MCP prompts).
        addMCPStatusChangeListener(listener);
        // TODO: Ideally this would happen more directly inside the ExtensionLoader,
        // but the CommandService today is not conducive to that since it isn't a
        // long lived service but instead gets fully re-created based on reload
        // events within this hook.
        const extensionEventListener = (_event) => {
            // We only care once at least one extension has completed
            // starting/stopping
            reloadCommands();
        };
        appEvents.on('extensionsStarting', extensionEventListener);
        appEvents.on('extensionsStopping', extensionEventListener);
        return () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            (async () => {
                const ideClient = await IdeClient.getInstance();
                ideClient.removeStatusChangeListener(listener);
            })();
            removeMCPStatusChangeListener(listener);
            appEvents.off('extensionsStarting', extensionEventListener);
            appEvents.off('extensionsStopping', extensionEventListener);
        };
    }, [config, reloadCommands]);
    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
            const commandService = await CommandService.create([
                new McpPromptLoader(config),
                new BuiltinCommandLoader(config),
                new FileCommandLoader(config),
            ], controller.signal);
            setCommands(commandService.getCommands());
        })();
        return () => {
            controller.abort();
        };
    }, [config, reloadTrigger, isConfigInitialized]);
    const handleSlashCommand = useCallback(async (rawQuery, oneTimeShellAllowlist, overwriteConfirmed, addToHistory = true) => {
        if (!commands) {
            return false;
        }
        if (typeof rawQuery !== 'string') {
            return false;
        }
        const trimmed = rawQuery.trim();
        if (!trimmed.startsWith('/') && !trimmed.startsWith('?')) {
            return false;
        }
        setIsProcessing(true);
        if (addToHistory) {
            const userMessageTimestamp = Date.now();
            addItem({ type: MessageType.USER, text: trimmed }, userMessageTimestamp);
        }
        let hasError = false;
        const { commandToExecute, args, canonicalPath: resolvedCommandPath, } = parseSlashCommand(trimmed, commands);
        const subcommand = resolvedCommandPath.length > 1
            ? resolvedCommandPath.slice(1).join(' ')
            : undefined;
        try {
            if (commandToExecute) {
                if (commandToExecute.action) {
                    const fullCommandContext = {
                        ...commandContext,
                        invocation: {
                            raw: trimmed,
                            name: commandToExecute.name,
                            args,
                        },
                        overwriteConfirmed,
                    };
                    // If a one-time list is provided for a "Proceed" action, temporarily
                    // augment the session allowlist for this single execution.
                    if (oneTimeShellAllowlist && oneTimeShellAllowlist.size > 0) {
                        fullCommandContext.session = {
                            ...fullCommandContext.session,
                            sessionShellAllowlist: new Set([
                                ...fullCommandContext.session.sessionShellAllowlist,
                                ...oneTimeShellAllowlist,
                            ]),
                        };
                    }
                    const result = await commandToExecute.action(fullCommandContext, args);
                    if (result) {
                        switch (result.type) {
                            case 'tool':
                                return {
                                    type: 'schedule_tool',
                                    toolName: result.toolName,
                                    toolArgs: result.toolArgs,
                                };
                            case 'message':
                                addItem({
                                    type: result.messageType === 'error'
                                        ? MessageType.ERROR
                                        : MessageType.INFO,
                                    text: result.content,
                                }, Date.now());
                                return { type: 'handled' };
                            case 'logout':
                                // Show logout confirmation dialog with Login/Exit options
                                setCustomDialog(createElement(LogoutConfirmationDialog, {
                                    onSelect: async (choice) => {
                                        setCustomDialog(null);
                                        if (choice === LogoutChoice.LOGIN) {
                                            actions.openAuthDialog();
                                        }
                                        else {
                                            await runExitCleanup();
                                            process.exit(0);
                                        }
                                    },
                                }));
                                return { type: 'handled' };
                            case 'dialog':
                                switch (result.dialog) {
                                    case 'auth':
                                        actions.openAuthDialog();
                                        return { type: 'handled' };
                                    case 'theme':
                                        actions.openThemeDialog();
                                        return { type: 'handled' };
                                    case 'editor':
                                        actions.openEditorDialog();
                                        return { type: 'handled' };
                                    case 'privacy':
                                        actions.openPrivacyNotice();
                                        return { type: 'handled' };
                                    case 'sessionBrowser':
                                        actions.openSessionBrowser();
                                        return { type: 'handled' };
                                    case 'settings':
                                        actions.openSettingsDialog();
                                        return { type: 'handled' };
                                    case 'model':
                                        actions.openModelDialog();
                                        return { type: 'handled' };
                                    case 'permissions':
                                        actions.openPermissionsDialog(result.props);
                                        return { type: 'handled' };
                                    case 'help':
                                        return { type: 'handled' };
                                    default: {
                                        const unhandled = result.dialog;
                                        throw new Error(`Unhandled slash command result: ${unhandled}`);
                                    }
                                }
                            case 'load_history': {
                                config?.getGeminiClient()?.setHistory(result.clientHistory);
                                fullCommandContext.ui.clear();
                                result.history.forEach((item, index) => {
                                    fullCommandContext.ui.addItem(item, index);
                                });
                                return { type: 'handled' };
                            }
                            case 'quit':
                                actions.quit(result.messages);
                                return { type: 'handled' };
                            case 'submit_prompt':
                                return {
                                    type: 'submit_prompt',
                                    content: result.content,
                                };
                            case 'confirm_shell_commands': {
                                const callId = `expansion-${Date.now()}`;
                                const { outcome, approvedCommands } = await new Promise((resolve) => {
                                    const confirmationDetails = {
                                        type: 'exec',
                                        title: `Confirm Shell Expansion`,
                                        command: result.commandsToConfirm[0] || '',
                                        rootCommand: result.commandsToConfirm[0] || '',
                                        rootCommands: result.commandsToConfirm,
                                        commands: result.commandsToConfirm,
                                        onConfirm: async (resolvedOutcome) => {
                                            // Close the pending tool display by resolving
                                            resolve({
                                                outcome: resolvedOutcome,
                                                approvedCommands: resolvedOutcome === ToolConfirmationOutcome.Cancel
                                                    ? []
                                                    : result.commandsToConfirm,
                                            });
                                        },
                                    };
                                    const toolDisplay = {
                                        callId,
                                        name: 'Expansion',
                                        description: 'Command expansion needs shell access',
                                        status: ToolCallStatus.Confirming,
                                        resultDisplay: undefined,
                                        confirmationDetails,
                                    };
                                    setPendingItem({
                                        type: 'tool_group',
                                        tools: [toolDisplay],
                                    });
                                });
                                setPendingItem(null);
                                if (outcome === ToolConfirmationOutcome.Cancel ||
                                    !approvedCommands ||
                                    approvedCommands.length === 0) {
                                    addItem({
                                        type: MessageType.INFO,
                                        text: 'Slash command shell execution declined.',
                                    }, Date.now());
                                    return { type: 'handled' };
                                }
                                if (outcome === ToolConfirmationOutcome.ProceedAlways) {
                                    setSessionShellAllowlist((prev) => new Set([...prev, ...approvedCommands]));
                                }
                                return await handleSlashCommand(result.originalInvocation.raw, 
                                // Pass the approved commands as a one-time grant for this execution.
                                new Set(approvedCommands), undefined, false);
                            }
                            case 'confirm_action': {
                                const { confirmed } = await new Promise((resolve) => {
                                    setConfirmationRequest({
                                        prompt: result.prompt,
                                        onConfirm: (resolvedConfirmed) => {
                                            setConfirmationRequest(null);
                                            resolve({ confirmed: resolvedConfirmed });
                                        },
                                    });
                                });
                                if (!confirmed) {
                                    addItem({
                                        type: MessageType.INFO,
                                        text: 'Operation cancelled.',
                                    }, Date.now());
                                    return { type: 'handled' };
                                }
                                return await handleSlashCommand(result.originalInvocation.raw, undefined, true);
                            }
                            case 'custom_dialog': {
                                setCustomDialog(result.component);
                                return { type: 'handled' };
                            }
                            default: {
                                const unhandled = result;
                                throw new Error(`Unhandled slash command result: ${unhandled}`);
                            }
                        }
                    }
                    return { type: 'handled' };
                }
                else if (commandToExecute.subCommands) {
                    const helpText = `Command '/${commandToExecute.name}' requires a subcommand. Available:\n${commandToExecute.subCommands
                        .map((sc) => `  - ${sc.name}: ${sc.description || ''}`)
                        .join('\n')}`;
                    addMessage({
                        type: MessageType.INFO,
                        content: helpText,
                        timestamp: new Date(),
                    });
                    return { type: 'handled' };
                }
            }
            const isMcpLoading = config?.getMcpClientManager()?.getDiscoveryState() ===
                MCPDiscoveryState.IN_PROGRESS;
            const errorMessage = isMcpLoading
                ? `Unknown command: ${trimmed}. Command might have been from an MCP server but MCP servers are not done loading.`
                : `Unknown command: ${trimmed}`;
            addMessage({
                type: MessageType.ERROR,
                content: errorMessage,
                timestamp: new Date(),
            });
            return { type: 'handled' };
        }
        catch (e) {
            hasError = true;
            if (config) {
                const event = makeSlashCommandEvent({
                    command: resolvedCommandPath[0],
                    subcommand,
                    status: SlashCommandStatus.ERROR,
                    extension_id: commandToExecute?.extensionId,
                });
                logSlashCommand(config, event);
            }
            addItem({
                type: MessageType.ERROR,
                text: e instanceof Error ? e.message : String(e),
            }, Date.now());
            return { type: 'handled' };
        }
        finally {
            if (config && resolvedCommandPath[0] && !hasError) {
                const event = makeSlashCommandEvent({
                    command: resolvedCommandPath[0],
                    subcommand,
                    status: SlashCommandStatus.SUCCESS,
                    extension_id: commandToExecute?.extensionId,
                });
                logSlashCommand(config, event);
            }
            setIsProcessing(false);
        }
    }, [
        config,
        addItem,
        actions,
        commands,
        commandContext,
        addMessage,
        setSessionShellAllowlist,
        setIsProcessing,
        setConfirmationRequest,
        setCustomDialog,
    ]);
    return {
        handleSlashCommand,
        slashCommands: commands,
        pendingHistoryItems,
        commandContext,
        confirmationRequest,
    };
};
//# sourceMappingURL=slashCommandProcessor.js.map