/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as path from 'node:path';
import { inspect } from 'node:util';
import process from 'node:process';
import { AuthType, createContentGenerator, createContentGeneratorConfig, } from '../core/contentGenerator.js';
import { PromptRegistry } from '../prompts/prompt-registry.js';
import { ResourceRegistry } from '../resources/resource-registry.js';
import { ToolRegistry } from '../tools/tool-registry.js';
import { LSTool } from '../tools/ls.js';
import { ReadFileTool } from '../tools/read-file.js';
import { GrepTool } from '../tools/grep.js';
import { canUseRipgrep, RipGrepTool } from '../tools/ripGrep.js';
import { GlobTool } from '../tools/glob.js';
import { ActivateSkillTool } from '../tools/activate-skill.js';
import { EditTool } from '../tools/edit.js';
import { ShellTool } from '../tools/shell.js';
import { WriteFileTool } from '../tools/write-file.js';
import { WebFetchTool } from '../tools/web-fetch.js';
import { MemoryTool, setGeminiMdFilename } from '../tools/memoryTool.js';
import { WebSearchTool } from '../tools/web-search.js';
import { GeminiClient } from '../core/client.js';
import { BaseLlmClient } from '../core/baseLlmClient.js';
import { FileDiscoveryService } from '../services/fileDiscoveryService.js';
import { GitService } from '../services/gitService.js';
import { initializeTelemetry, DEFAULT_TELEMETRY_TARGET, DEFAULT_OTLP_ENDPOINT, uiTelemetryService, } from '../telemetry/index.js';
import { coreEvents, CoreEvent } from '../utils/events.js';
import { tokenLimit } from '../core/tokenLimits.js';
import { DEFAULT_GEMINI_EMBEDDING_MODEL, DEFAULT_GEMINI_FLASH_MODEL, DEFAULT_GEMINI_MODEL_AUTO, DEFAULT_THINKING_MODE, isPreviewModel, PREVIEW_GEMINI_MODEL, PREVIEW_GEMINI_MODEL_AUTO, } from './models.js';
import { shouldAttemptBrowserLaunch } from '../utils/browser.js';
import { ideContextStore } from '../ide/ideContext.js';
import { WriteTodosTool } from '../tools/write-todos.js';
import { StandardFileSystemService } from '../services/fileSystemService.js';
import { logRipgrepFallback, logFlashFallback } from '../telemetry/loggers.js';
import { RipgrepFallbackEvent, FlashFallbackEvent, } from '../telemetry/types.js';
import { ModelAvailabilityService } from '../availability/modelAvailabilityService.js';
import { ModelRouterService } from '../routing/modelRouterService.js';
import { OutputFormat } from '../output/types.js';
import { ModelConfigService } from '../services/modelConfigService.js';
import { DEFAULT_MODEL_CONFIGS } from './defaultModelConfigs.js';
import { ContextManager } from '../services/contextManager.js';
import { WorkspaceContext } from '../utils/workspaceContext.js';
import { Storage } from './storage.js';
import { FileExclusions } from '../utils/ignorePatterns.js';
import { MessageBus } from '../confirmation-bus/message-bus.js';
import { PolicyEngine } from '../policy/policy-engine.js';
import { ApprovalMode } from '../policy/types.js';
import { HookSystem } from '../hooks/index.js';
import { getCodeAssistServer } from '../code_assist/codeAssist.js';
import { AgentRegistry } from '../agents/registry.js';
import { setGlobalProxy } from '../utils/fetch.js';
import { DelegateToAgentTool } from '../agents/delegate-to-agent-tool.js';
import { DELEGATE_TO_AGENT_TOOL_NAME } from '../tools/tool-names.js';
import { getExperiments } from '../code_assist/experiments/experiments.js';
import { ExperimentFlags } from '../code_assist/experiments/flagNames.js';
import { debugLogger } from '../utils/debugLogger.js';
import { SkillManager } from '../skills/skillManager.js';
import { startupProfiler } from '../telemetry/startupProfiler.js';
import { fetchAdminControls } from '../code_assist/admin/admin_controls.js';
import { DEFAULT_FILE_FILTERING_OPTIONS, DEFAULT_MEMORY_FILE_FILTERING_OPTIONS, } from './constants.js';
import { SimpleExtensionLoader, } from '../utils/extensionLoader.js';
import { McpClientManager } from '../tools/mcp-client-manager.js';
export { DEFAULT_FILE_FILTERING_OPTIONS, DEFAULT_MEMORY_FILE_FILTERING_OPTIONS, };
export const DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD = 4_000_000;
export const DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES = 1000;
export class MCPServerConfig {
    command;
    args;
    env;
    cwd;
    url;
    httpUrl;
    headers;
    tcp;
    type;
    timeout;
    trust;
    description;
    includeTools;
    excludeTools;
    extension;
    oauth;
    authProviderType;
    targetAudience;
    targetServiceAccount;
    constructor(
    // For stdio transport
    command, args, env, cwd, 
    // For sse transport
    url, 
    // For streamable http transport
    httpUrl, headers, 
    // For websocket transport
    tcp, 
    // Transport type (optional, for use with 'url' field)
    // When set to 'http', uses StreamableHTTPClientTransport
    // When set to 'sse', uses SSEClientTransport
    // When omitted, auto-detects transport type
    // Note: 'httpUrl' is deprecated in favor of 'url' + 'type'
    type, 
    // Common
    timeout, trust, 
    // Metadata
    description, includeTools, excludeTools, extension, 
    // OAuth configuration
    oauth, authProviderType, 
    // Service Account Configuration
    /* targetAudience format: CLIENT_ID.apps.googleusercontent.com */
    targetAudience, 
    /* targetServiceAccount format: <service-account-name>@<project-num>.iam.gserviceaccount.com */
    targetServiceAccount) {
        this.command = command;
        this.args = args;
        this.env = env;
        this.cwd = cwd;
        this.url = url;
        this.httpUrl = httpUrl;
        this.headers = headers;
        this.tcp = tcp;
        this.type = type;
        this.timeout = timeout;
        this.trust = trust;
        this.description = description;
        this.includeTools = includeTools;
        this.excludeTools = excludeTools;
        this.extension = extension;
        this.oauth = oauth;
        this.authProviderType = authProviderType;
        this.targetAudience = targetAudience;
        this.targetServiceAccount = targetServiceAccount;
    }
}
export var AuthProviderType;
(function (AuthProviderType) {
    AuthProviderType["DYNAMIC_DISCOVERY"] = "dynamic_discovery";
    AuthProviderType["GOOGLE_CREDENTIALS"] = "google_credentials";
    AuthProviderType["SERVICE_ACCOUNT_IMPERSONATION"] = "service_account_impersonation";
})(AuthProviderType || (AuthProviderType = {}));
export class Config {
    toolRegistry;
    mcpClientManager;
    allowedMcpServers;
    blockedMcpServers;
    allowedEnvironmentVariables;
    blockedEnvironmentVariables;
    enableEnvironmentVariableRedaction;
    promptRegistry;
    resourceRegistry;
    agentRegistry;
    skillManager;
    sessionId;
    fileSystemService;
    contentGeneratorConfig;
    contentGenerator;
    modelConfigService;
    embeddingModel;
    sandbox;
    targetDir;
    workspaceContext;
    debugMode;
    question;
    coreTools;
    allowedTools;
    excludeTools;
    toolDiscoveryCommand;
    toolCallCommand;
    mcpServerCommand;
    mcpEnabled;
    extensionsEnabled;
    mcpServers;
    userMemory;
    geminiMdFileCount;
    geminiMdFilePaths;
    showMemoryUsage;
    accessibility;
    notifications;
    contextMemory;
    telemetrySettings;
    usageStatisticsEnabled;
    geminiClient;
    baseLlmClient;
    modelRouterService;
    modelAvailabilityService;
    fileFiltering;
    fileDiscoveryService = null;
    gitService = undefined;
    checkpointing;
    proxy;
    cwd;
    bugCommand;
    model;
    previewFeatures;
    hasAccessToPreviewModel = false;
    noBrowser;
    folderTrust;
    ideMode;
    _activeModel;
    maxSessionTurns;
    listSessions;
    deleteSession;
    listExtensions;
    _extensionLoader;
    _enabledExtensions;
    enableExtensionReloading;
    fallbackModelHandler;
    quotaErrorOccurred = false;
    summarizeToolOutput;
    experimentalZedIntegration = false;
    loadMemoryFromIncludeDirectories = false;
    importFormat;
    discoveryMaxDirs;
    compressionThreshold;
    interactive;
    ptyInfo;
    trustedFolder;
    useRipgrep;
    enableInteractiveShell;
    skipNextSpeakerCheck;
    shellExecutionConfig;
    extensionManagement = true;
    enablePromptCompletion = false;
    truncateToolOutputThreshold;
    truncateToolOutputLines;
    enableToolOutputTruncation;
    initialized = false;
    storage;
    fileExclusions;
    eventEmitter;
    useWriteTodos;
    messageBus;
    policyEngine;
    outputSettings;
    codebaseInvestigatorSettings;
    cliHelpAgentSettings;
    continueOnFailedApiCall;
    retryFetchErrors;
    enableShellOutputEfficiency;
    shellToolInactivityTimeout;
    fakeResponses;
    recordResponses;
    disableYoloMode;
    pendingIncludeDirectories;
    enableHooks;
    enableHooksUI;
    hooks;
    projectHooks;
    disabledHooks;
    experiments;
    experimentsPromise;
    hookSystem;
    onModelChange;
    onReload;
    enableAgents;
    agents;
    skillsSupport;
    disabledSkills;
    adminSkillsEnabled;
    experimentalJitContext;
    disableLLMCorrection;
    planEnabled;
    contextManager;
    terminalBackground = undefined;
    remoteAdminSettings;
    latestApiRequest;
    constructor(params) {
        this.sessionId = params.sessionId;
        this.embeddingModel =
            params.embeddingModel ?? DEFAULT_GEMINI_EMBEDDING_MODEL;
        this.fileSystemService = new StandardFileSystemService();
        this.sandbox = params.sandbox;
        this.targetDir = path.resolve(params.targetDir);
        this.folderTrust = params.folderTrust ?? false;
        this.workspaceContext = new WorkspaceContext(this.targetDir, []);
        this.pendingIncludeDirectories = params.includeDirectories ?? [];
        this.debugMode = params.debugMode;
        this.question = params.question;
        this.coreTools = params.coreTools;
        this.allowedTools = params.allowedTools;
        this.excludeTools = params.excludeTools;
        this.toolDiscoveryCommand = params.toolDiscoveryCommand;
        this.toolCallCommand = params.toolCallCommand;
        this.mcpServerCommand = params.mcpServerCommand;
        this.mcpServers = params.mcpServers;
        this.mcpEnabled = params.mcpEnabled ?? true;
        this.extensionsEnabled = params.extensionsEnabled ?? true;
        this.allowedMcpServers = params.allowedMcpServers ?? [];
        this.blockedMcpServers = params.blockedMcpServers ?? [];
        this.allowedEnvironmentVariables = params.allowedEnvironmentVariables ?? [];
        this.blockedEnvironmentVariables = params.blockedEnvironmentVariables ?? [];
        this.enableEnvironmentVariableRedaction =
            params.enableEnvironmentVariableRedaction ?? false;
        this.userMemory = params.userMemory ?? '';
        this.geminiMdFileCount = params.geminiMdFileCount ?? 0;
        this.geminiMdFilePaths = params.geminiMdFilePaths ?? [];
        this.showMemoryUsage = params.showMemoryUsage ?? false;
        this.accessibility = params.accessibility ?? {};
        this.notifications = params.notifications ?? {};
        this.contextMemory = params.contextMemory ?? { enabled: false };
        this.telemetrySettings = {
            enabled: params.telemetry?.enabled ?? false,
            target: params.telemetry?.target ?? DEFAULT_TELEMETRY_TARGET,
            otlpEndpoint: params.telemetry?.otlpEndpoint ?? DEFAULT_OTLP_ENDPOINT,
            otlpProtocol: params.telemetry?.otlpProtocol,
            logPrompts: params.telemetry?.logPrompts ?? true,
            outfile: params.telemetry?.outfile,
            useCollector: params.telemetry?.useCollector,
            useCliAuth: params.telemetry?.useCliAuth,
        };
        this.usageStatisticsEnabled = params.usageStatisticsEnabled ?? true;
        this.fileFiltering = {
            respectGitIgnore: params.fileFiltering?.respectGitIgnore ??
                DEFAULT_FILE_FILTERING_OPTIONS.respectGitIgnore,
            respectGeminiIgnore: params.fileFiltering?.respectGeminiIgnore ??
                DEFAULT_FILE_FILTERING_OPTIONS.respectGeminiIgnore,
            enableRecursiveFileSearch: params.fileFiltering?.enableRecursiveFileSearch ?? true,
            enableFuzzySearch: params.fileFiltering?.enableFuzzySearch ?? true,
            maxFileCount: params.fileFiltering?.maxFileCount ??
                DEFAULT_FILE_FILTERING_OPTIONS.maxFileCount ??
                20000,
            searchTimeout: params.fileFiltering?.searchTimeout ??
                DEFAULT_FILE_FILTERING_OPTIONS.searchTimeout ??
                5000,
        };
        this.checkpointing = params.checkpointing ?? false;
        this.proxy = params.proxy;
        this.cwd = params.cwd ?? process.cwd();
        this.fileDiscoveryService = params.fileDiscoveryService ?? null;
        this.bugCommand = params.bugCommand;
        this.model = params.model;
        this._activeModel = params.model;
        this.enableAgents = params.enableAgents ?? false;
        this.agents = params.agents ?? {};
        this.disableLLMCorrection = params.disableLLMCorrection ?? false;
        this.planEnabled = params.plan ?? false;
        this.skillsSupport = params.skillsSupport ?? false;
        this.disabledSkills = params.disabledSkills ?? [];
        this.adminSkillsEnabled = params.adminSkillsEnabled ?? true;
        this.modelAvailabilityService = new ModelAvailabilityService();
        this.previewFeatures = params.previewFeatures ?? undefined;
        this.experimentalJitContext = params.experimentalJitContext ?? false;
        this.maxSessionTurns = params.maxSessionTurns ?? -1;
        this.experimentalZedIntegration =
            params.experimentalZedIntegration ?? false;
        this.listSessions = params.listSessions ?? false;
        this.deleteSession = params.deleteSession;
        this.listExtensions = params.listExtensions ?? false;
        this._extensionLoader =
            params.extensionLoader ?? new SimpleExtensionLoader([]);
        this._enabledExtensions = params.enabledExtensions ?? [];
        this.noBrowser = params.noBrowser ?? false;
        this.summarizeToolOutput = params.summarizeToolOutput;
        this.folderTrust = params.folderTrust ?? false;
        this.ideMode = params.ideMode ?? false;
        this.loadMemoryFromIncludeDirectories =
            params.loadMemoryFromIncludeDirectories ?? false;
        this.importFormat = params.importFormat ?? 'tree';
        this.discoveryMaxDirs = params.discoveryMaxDirs ?? 200;
        this.compressionThreshold = params.compressionThreshold;
        this.interactive = params.interactive ?? false;
        this.ptyInfo = params.ptyInfo ?? 'child_process';
        this.trustedFolder = params.trustedFolder;
        this.useRipgrep = params.useRipgrep ?? true;
        this.enableInteractiveShell = params.enableInteractiveShell ?? false;
        this.skipNextSpeakerCheck = params.skipNextSpeakerCheck ?? true;
        this.shellExecutionConfig = {
            terminalWidth: params.shellExecutionConfig?.terminalWidth ?? 80,
            terminalHeight: params.shellExecutionConfig?.terminalHeight ?? 24,
            showColor: params.shellExecutionConfig?.showColor ?? false,
            pager: params.shellExecutionConfig?.pager ?? 'cat',
            sanitizationConfig: this.sanitizationConfig,
        };
        this.truncateToolOutputThreshold =
            params.truncateToolOutputThreshold ??
                DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD;
        this.truncateToolOutputLines =
            params.truncateToolOutputLines ?? DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES;
        this.enableToolOutputTruncation = params.enableToolOutputTruncation ?? true;
        // // TODO(joshualitt): Re-evaluate the todo tool for 3 family.
        this.useWriteTodos = isPreviewModel(this.model)
            ? false
            : (params.useWriteTodos ?? true);
        this.enableHooksUI = params.enableHooksUI ?? true;
        this.enableHooks = params.enableHooks ?? false;
        this.disabledHooks =
            (params.hooks && 'disabled' in params.hooks
                ? params.hooks.disabled
                : undefined) ?? [];
        this.codebaseInvestigatorSettings = {
            enabled: params.codebaseInvestigatorSettings?.enabled ?? true,
            maxNumTurns: params.codebaseInvestigatorSettings?.maxNumTurns ?? 10,
            maxTimeMinutes: params.codebaseInvestigatorSettings?.maxTimeMinutes ?? 3,
            thinkingBudget: params.codebaseInvestigatorSettings?.thinkingBudget ??
                DEFAULT_THINKING_MODE,
            model: params.codebaseInvestigatorSettings?.model,
        };
        this.cliHelpAgentSettings = {
            enabled: params.cliHelpAgentSettings?.enabled ?? true,
        };
        this.continueOnFailedApiCall = params.continueOnFailedApiCall ?? true;
        this.enableShellOutputEfficiency =
            params.enableShellOutputEfficiency ?? true;
        this.shellToolInactivityTimeout =
            (params.shellToolInactivityTimeout ?? 300) * 1000; // 5 minutes
        this.extensionManagement = params.extensionManagement ?? true;
        this.enableExtensionReloading = params.enableExtensionReloading ?? false;
        this.storage = new Storage(this.targetDir);
        this.fakeResponses = params.fakeResponses;
        this.recordResponses = params.recordResponses;
        this.enablePromptCompletion = params.enablePromptCompletion ?? false;
        this.fileExclusions = new FileExclusions(this);
        this.eventEmitter = params.eventEmitter;
        this.policyEngine = new PolicyEngine({
            ...params.policyEngineConfig,
            approvalMode: params.approvalMode ?? params.policyEngineConfig?.approvalMode,
        });
        this.messageBus = new MessageBus(this.policyEngine, this.debugMode);
        this.skillManager = new SkillManager();
        this.outputSettings = {
            format: params.output?.format ?? OutputFormat.TEXT,
        };
        this.retryFetchErrors = params.retryFetchErrors ?? false;
        this.disableYoloMode = params.disableYoloMode ?? false;
        if (params.hooks) {
            const { disabled: _, ...restOfHooks } = params.hooks;
            this.hooks = restOfHooks;
        }
        if (params.projectHooks) {
            this.projectHooks = params.projectHooks;
        }
        this.experiments = params.experiments;
        this.onModelChange = params.onModelChange;
        this.onReload = params.onReload;
        if (params.contextFileName) {
            setGeminiMdFilename(params.contextFileName);
        }
        if (this.telemetrySettings.enabled) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            initializeTelemetry(this);
        }
        const proxy = this.getProxy();
        if (proxy) {
            try {
                setGlobalProxy(proxy);
            }
            catch (error) {
                coreEvents.emitFeedback('error', 'Invalid proxy configuration detected. Check debug drawer for more details (F12)', error);
            }
        }
        this.geminiClient = new GeminiClient(this);
        this.modelRouterService = new ModelRouterService(this);
        // HACK: The settings loading logic doesn't currently merge the default
        // generation config with the user's settings. This means if a user provides
        // any `generation` settings (e.g., just `overrides`), the default `aliases`
        // are lost. This hack manually merges the default aliases back in if they
        // are missing from the user's config.
        // TODO(12593): Fix the settings loading logic to properly merge defaults and
        // remove this hack.
        let modelConfigServiceConfig = params.modelConfigServiceConfig;
        if (modelConfigServiceConfig) {
            if (!modelConfigServiceConfig.aliases) {
                modelConfigServiceConfig = {
                    ...modelConfigServiceConfig,
                    aliases: DEFAULT_MODEL_CONFIGS.aliases,
                };
            }
            if (!modelConfigServiceConfig.overrides) {
                modelConfigServiceConfig = {
                    ...modelConfigServiceConfig,
                    overrides: DEFAULT_MODEL_CONFIGS.overrides,
                };
            }
        }
        this.modelConfigService = new ModelConfigService(modelConfigServiceConfig ?? DEFAULT_MODEL_CONFIGS);
    }
    /**
     * Must only be called once, throws if called again.
     */
    async initialize() {
        if (this.initialized) {
            throw Error('Config was already initialized');
        }
        this.initialized = true;
        // Initialize centralized FileDiscoveryService
        const discoverToolsHandle = startupProfiler.start('discover_tools');
        this.getFileService();
        if (this.getCheckpointingEnabled()) {
            await this.getGitService();
        }
        this.promptRegistry = new PromptRegistry();
        this.resourceRegistry = new ResourceRegistry();
        this.agentRegistry = new AgentRegistry(this);
        await this.agentRegistry.initialize();
        coreEvents.on(CoreEvent.AgentsRefreshed, this.onAgentsRefreshed);
        this.toolRegistry = await this.createToolRegistry();
        discoverToolsHandle?.end();
        this.mcpClientManager = new McpClientManager(this.toolRegistry, this, this.eventEmitter);
        // We do not await this promise so that the CLI can start up even if
        // MCP servers are slow to connect.
        Promise.all([
            this.mcpClientManager.startConfiguredMcpServers(),
            this.getExtensionLoader().start(this),
        ]).catch((error) => {
            debugLogger.error('Error initializing MCP clients:', error);
        });
        if (this.skillsSupport) {
            this.getSkillManager().setAdminSettings(this.adminSkillsEnabled);
            if (this.adminSkillsEnabled) {
                await this.getSkillManager().discoverSkills(this.storage, this.getExtensions());
                this.getSkillManager().setDisabledSkills(this.disabledSkills);
                // Re-register ActivateSkillTool to update its schema with the discovered enabled skill enums
                if (this.getSkillManager().getSkills().length > 0) {
                    this.getToolRegistry().unregisterTool(ActivateSkillTool.Name);
                    this.getToolRegistry().registerTool(new ActivateSkillTool(this, this.messageBus));
                }
            }
        }
        // Initialize hook system if enabled
        if (this.getEnableHooks()) {
            this.hookSystem = new HookSystem(this);
            await this.hookSystem.initialize();
        }
        if (this.experimentalJitContext) {
            this.contextManager = new ContextManager(this);
            await this.contextManager.refresh();
        }
        await this.geminiClient.initialize();
    }
    getContentGenerator() {
        return this.contentGenerator;
    }
    async refreshAuth(authMethod) {
        // Reset availability service when switching auth
        this.modelAvailabilityService.reset();
        // Vertex and Genai have incompatible encryption and sending history with
        // thoughtSignature from Genai to Vertex will fail, we need to strip them
        if (this.contentGeneratorConfig?.authType === AuthType.USE_GEMINI &&
            authMethod !== AuthType.USE_GEMINI) {
            // Restore the conversation history to the new client
            this.geminiClient.stripThoughtsFromHistory();
        }
        // Reset availability status when switching auth (e.g. from limited key to OAuth)
        this.modelAvailabilityService.reset();
        const newContentGeneratorConfig = await createContentGeneratorConfig(this, authMethod);
        this.contentGenerator = await createContentGenerator(newContentGeneratorConfig, this, this.getSessionId());
        // Only assign to instance properties after successful initialization
        this.contentGeneratorConfig = newContentGeneratorConfig;
        // Initialize BaseLlmClient now that the ContentGenerator is available
        this.baseLlmClient = new BaseLlmClient(this.contentGenerator, this);
        const codeAssistServer = getCodeAssistServer(this);
        if (codeAssistServer?.projectId) {
            await this.refreshUserQuota();
        }
        this.experimentsPromise = getExperiments(codeAssistServer)
            .then((experiments) => {
            this.setExperiments(experiments);
            // If preview features have not been set and the user authenticated through Google, we enable preview based on remote config only if it's true
            if (this.getPreviewFeatures() === undefined) {
                const remotePreviewFeatures = experiments.flags[ExperimentFlags.ENABLE_PREVIEW]?.boolValue;
                if (remotePreviewFeatures === true) {
                    this.setPreviewFeatures(remotePreviewFeatures);
                }
            }
        })
            .catch((e) => {
            debugLogger.error('Failed to fetch experiments', e);
        });
        const authType = this.contentGeneratorConfig.authType;
        if (authType === AuthType.USE_GEMINI ||
            authType === AuthType.USE_VERTEX_AI) {
            this.setHasAccessToPreviewModel(true);
        }
        // Update model if user no longer has access to the preview model
        if (!this.hasAccessToPreviewModel && isPreviewModel(this.model)) {
            this.setModel(DEFAULT_GEMINI_MODEL_AUTO);
        }
        // Fetch admin controls
        await this.ensureExperimentsLoaded();
        const adminControlsEnabled = this.experiments?.flags[ExperimentFlags.ENABLE_ADMIN_CONTROLS]
            ?.boolValue ?? false;
        const adminControls = await fetchAdminControls(codeAssistServer, this.getRemoteAdminSettings(), adminControlsEnabled, (newSettings) => {
            this.setRemoteAdminSettings(newSettings);
            coreEvents.emitAdminSettingsChanged();
        });
        this.setRemoteAdminSettings(adminControls);
    }
    async getExperimentsAsync() {
        if (this.experiments) {
            return this.experiments;
        }
        const codeAssistServer = getCodeAssistServer(this);
        return getExperiments(codeAssistServer);
    }
    getUserTier() {
        return this.contentGenerator?.userTier;
    }
    /**
     * Provides access to the BaseLlmClient for stateless LLM operations.
     */
    getBaseLlmClient() {
        if (!this.baseLlmClient) {
            // Handle cases where initialization might be deferred or authentication failed
            if (this.contentGenerator) {
                this.baseLlmClient = new BaseLlmClient(this.getContentGenerator(), this);
            }
            else {
                throw new Error('BaseLlmClient not initialized. Ensure authentication has occurred and ContentGenerator is ready.');
            }
        }
        return this.baseLlmClient;
    }
    getSessionId() {
        return this.sessionId;
    }
    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }
    setTerminalBackground(terminalBackground) {
        this.terminalBackground = terminalBackground;
    }
    getTerminalBackground() {
        return this.terminalBackground;
    }
    getLatestApiRequest() {
        return this.latestApiRequest;
    }
    setLatestApiRequest(req) {
        this.latestApiRequest = req;
    }
    getRemoteAdminSettings() {
        return this.remoteAdminSettings;
    }
    setRemoteAdminSettings(settings) {
        this.remoteAdminSettings = settings;
    }
    shouldLoadMemoryFromIncludeDirectories() {
        return this.loadMemoryFromIncludeDirectories;
    }
    getImportFormat() {
        return this.importFormat;
    }
    getDiscoveryMaxDirs() {
        return this.discoveryMaxDirs;
    }
    getContentGeneratorConfig() {
        return this.contentGeneratorConfig;
    }
    getModel() {
        return this.model;
    }
    setModel(newModel, isTemporary = true) {
        if (this.model !== newModel || this._activeModel !== newModel) {
            this.model = newModel;
            // When the user explicitly sets a model, that becomes the active model.
            this._activeModel = newModel;
            coreEvents.emitModelChanged(newModel);
            if (this.onModelChange && !isTemporary) {
                this.onModelChange(newModel);
            }
        }
        this.modelAvailabilityService.reset();
    }
    activateFallbackMode(model) {
        this.setModel(model, true);
        const authType = this.getContentGeneratorConfig()?.authType;
        if (authType) {
            logFlashFallback(this, new FlashFallbackEvent(authType));
        }
    }
    getActiveModel() {
        return this._activeModel ?? this.model;
    }
    setActiveModel(model) {
        if (this._activeModel !== model) {
            this._activeModel = model;
        }
    }
    setFallbackModelHandler(handler) {
        this.fallbackModelHandler = handler;
    }
    getFallbackModelHandler() {
        return this.fallbackModelHandler;
    }
    resetTurn() {
        this.modelAvailabilityService.resetTurn();
    }
    getMaxSessionTurns() {
        return this.maxSessionTurns;
    }
    setQuotaErrorOccurred(value) {
        this.quotaErrorOccurred = value;
    }
    getQuotaErrorOccurred() {
        return this.quotaErrorOccurred;
    }
    getEmbeddingModel() {
        return this.embeddingModel;
    }
    getSandbox() {
        return this.sandbox;
    }
    isRestrictiveSandbox() {
        const sandboxConfig = this.getSandbox();
        const seatbeltProfile = process.env['SEATBELT_PROFILE'];
        return (!!sandboxConfig &&
            sandboxConfig.command === 'sandbox-exec' &&
            !!seatbeltProfile &&
            seatbeltProfile.startsWith('restrictive-'));
    }
    getTargetDir() {
        return this.targetDir;
    }
    getProjectRoot() {
        return this.targetDir;
    }
    getWorkspaceContext() {
        return this.workspaceContext;
    }
    getAgentRegistry() {
        return this.agentRegistry;
    }
    getToolRegistry() {
        return this.toolRegistry;
    }
    getPromptRegistry() {
        return this.promptRegistry;
    }
    getSkillManager() {
        return this.skillManager;
    }
    getResourceRegistry() {
        return this.resourceRegistry;
    }
    getDebugMode() {
        return this.debugMode;
    }
    getQuestion() {
        return this.question;
    }
    getPreviewFeatures() {
        return this.previewFeatures;
    }
    setPreviewFeatures(previewFeatures) {
        // No change in state, no action needed
        if (this.previewFeatures === previewFeatures) {
            return;
        }
        this.previewFeatures = previewFeatures;
        const currentModel = this.getModel();
        // Case 1: Disabling preview features while on a preview model
        if (!previewFeatures && isPreviewModel(currentModel)) {
            this.setModel(DEFAULT_GEMINI_MODEL_AUTO);
        }
        // Case 2: Enabling preview features while on the default auto model
        else if (previewFeatures && currentModel === DEFAULT_GEMINI_MODEL_AUTO) {
            this.setModel(PREVIEW_GEMINI_MODEL_AUTO);
        }
    }
    getHasAccessToPreviewModel() {
        return this.hasAccessToPreviewModel;
    }
    setHasAccessToPreviewModel(hasAccess) {
        this.hasAccessToPreviewModel = hasAccess;
    }
    async refreshUserQuota() {
        const codeAssistServer = getCodeAssistServer(this);
        if (!codeAssistServer || !codeAssistServer.projectId) {
            return undefined;
        }
        try {
            const quota = await codeAssistServer.retrieveUserQuota({
                project: codeAssistServer.projectId,
            });
            const hasAccess = quota.buckets?.some((b) => b.modelId === PREVIEW_GEMINI_MODEL) ?? false;
            this.setHasAccessToPreviewModel(hasAccess);
            return quota;
        }
        catch (e) {
            debugLogger.debug('Failed to retrieve user quota', e);
            return undefined;
        }
    }
    getCoreTools() {
        return this.coreTools;
    }
    getAllowedTools() {
        return this.allowedTools;
    }
    /**
     * All the excluded tools from static configuration, loaded extensions, or
     * other sources.
     *
     * May change over time.
     */
    getExcludeTools() {
        const excludeToolsSet = new Set([...(this.excludeTools ?? [])]);
        for (const extension of this.getExtensionLoader().getExtensions()) {
            if (!extension.isActive) {
                continue;
            }
            for (const tool of extension.excludeTools || []) {
                excludeToolsSet.add(tool);
            }
        }
        return excludeToolsSet;
    }
    getToolDiscoveryCommand() {
        return this.toolDiscoveryCommand;
    }
    getToolCallCommand() {
        return this.toolCallCommand;
    }
    getMcpServerCommand() {
        return this.mcpServerCommand;
    }
    /**
     * The user configured MCP servers (via gemini settings files).
     *
     * Does NOT include mcp servers configured by extensions.
     */
    getMcpServers() {
        return this.mcpServers;
    }
    getMcpEnabled() {
        return this.mcpEnabled;
    }
    getExtensionsEnabled() {
        return this.extensionsEnabled;
    }
    getMcpClientManager() {
        return this.mcpClientManager;
    }
    getAllowedMcpServers() {
        return this.allowedMcpServers;
    }
    getBlockedMcpServers() {
        return this.blockedMcpServers;
    }
    get sanitizationConfig() {
        return {
            allowedEnvironmentVariables: this.allowedEnvironmentVariables,
            blockedEnvironmentVariables: this.blockedEnvironmentVariables,
            enableEnvironmentVariableRedaction: this.enableEnvironmentVariableRedaction,
        };
    }
    setMcpServers(mcpServers) {
        this.mcpServers = mcpServers;
    }
    getUserMemory() {
        if (this.experimentalJitContext && this.contextManager) {
            return [
                this.contextManager.getGlobalMemory(),
                this.contextManager.getEnvironmentMemory(),
            ]
                .filter(Boolean)
                .join('\n\n');
        }
        return this.userMemory;
    }
    setUserMemory(newUserMemory) {
        this.userMemory = newUserMemory;
    }
    getGlobalMemory() {
        return this.contextManager?.getGlobalMemory() ?? '';
    }
    getEnvironmentMemory() {
        return this.contextManager?.getEnvironmentMemory() ?? '';
    }
    getContextManager() {
        return this.contextManager;
    }
    isJitContextEnabled() {
        return this.experimentalJitContext;
    }
    getGeminiMdFileCount() {
        if (this.experimentalJitContext && this.contextManager) {
            return this.contextManager.getLoadedPaths().size;
        }
        return this.geminiMdFileCount;
    }
    setGeminiMdFileCount(count) {
        this.geminiMdFileCount = count;
    }
    getGeminiMdFilePaths() {
        if (this.experimentalJitContext && this.contextManager) {
            return Array.from(this.contextManager.getLoadedPaths());
        }
        return this.geminiMdFilePaths;
    }
    setGeminiMdFilePaths(paths) {
        this.geminiMdFilePaths = paths;
    }
    getApprovalMode() {
        return this.policyEngine.getApprovalMode();
    }
    setApprovalMode(mode) {
        if (!this.isTrustedFolder() && mode !== ApprovalMode.DEFAULT) {
            throw new Error('Cannot enable privileged approval modes in an untrusted folder.');
        }
        this.policyEngine.setApprovalMode(mode);
    }
    isYoloModeDisabled() {
        return this.disableYoloMode || !this.isTrustedFolder();
    }
    getPendingIncludeDirectories() {
        return this.pendingIncludeDirectories;
    }
    clearPendingIncludeDirectories() {
        this.pendingIncludeDirectories = [];
    }
    getShowMemoryUsage() {
        return this.showMemoryUsage;
    }
    getAccessibility() {
        return this.accessibility;
    }
    getTelemetryEnabled() {
        return this.telemetrySettings.enabled ?? false;
    }
    getTelemetryLogPromptsEnabled() {
        return this.telemetrySettings.logPrompts ?? true;
    }
    getTelemetryOtlpEndpoint() {
        return this.telemetrySettings.otlpEndpoint ?? DEFAULT_OTLP_ENDPOINT;
    }
    getTelemetryOtlpProtocol() {
        return this.telemetrySettings.otlpProtocol ?? 'grpc';
    }
    getTelemetryTarget() {
        return this.telemetrySettings.target ?? DEFAULT_TELEMETRY_TARGET;
    }
    getTelemetryOutfile() {
        return this.telemetrySettings.outfile;
    }
    getTelemetryUseCollector() {
        return this.telemetrySettings.useCollector ?? false;
    }
    getTelemetryUseCliAuth() {
        return this.telemetrySettings.useCliAuth ?? false;
    }
    getGeminiClient() {
        return this.geminiClient;
    }
    /**
     * Updates the system instruction with the latest user memory.
     * Whenever the user memory (GEMINI.md files) is updated.
     */
    async updateSystemInstructionIfInitialized() {
        const geminiClient = this.getGeminiClient();
        if (geminiClient?.isInitialized()) {
            await geminiClient.updateSystemInstruction();
        }
    }
    getModelRouterService() {
        return this.modelRouterService;
    }
    getModelAvailabilityService() {
        return this.modelAvailabilityService;
    }
    getEnableRecursiveFileSearch() {
        return this.fileFiltering.enableRecursiveFileSearch;
    }
    getFileFilteringEnableFuzzySearch() {
        return this.fileFiltering.enableFuzzySearch;
    }
    getFileFilteringRespectGitIgnore() {
        return this.fileFiltering.respectGitIgnore;
    }
    getFileFilteringRespectGeminiIgnore() {
        return this.fileFiltering.respectGeminiIgnore;
    }
    getFileFilteringOptions() {
        return {
            respectGitIgnore: this.fileFiltering.respectGitIgnore,
            respectGeminiIgnore: this.fileFiltering.respectGeminiIgnore,
            maxFileCount: this.fileFiltering.maxFileCount,
            searchTimeout: this.fileFiltering.searchTimeout,
        };
    }
    /**
     * Gets custom file exclusion patterns from configuration.
     * TODO: This is a placeholder implementation. In the future, this could
     * read from settings files, CLI arguments, or environment variables.
     */
    getCustomExcludes() {
        // Placeholder implementation - returns empty array for now
        // Future implementation could read from:
        // - User settings file
        // - Project-specific configuration
        // - Environment variables
        // - CLI arguments
        return [];
    }
    getCheckpointingEnabled() {
        return this.checkpointing;
    }
    getProxy() {
        return this.proxy;
    }
    getWorkingDir() {
        return this.cwd;
    }
    getBugCommand() {
        return this.bugCommand;
    }
    getFileService() {
        if (!this.fileDiscoveryService) {
            this.fileDiscoveryService = new FileDiscoveryService(this.targetDir);
        }
        return this.fileDiscoveryService;
    }
    getUsageStatisticsEnabled() {
        return this.usageStatisticsEnabled;
    }
    getExperimentalZedIntegration() {
        return this.experimentalZedIntegration;
    }
    getListExtensions() {
        return this.listExtensions;
    }
    getListSessions() {
        return this.listSessions;
    }
    getDeleteSession() {
        return this.deleteSession;
    }
    getExtensionManagement() {
        return this.extensionManagement;
    }
    getExtensions() {
        return this._extensionLoader.getExtensions();
    }
    getExtensionLoader() {
        return this._extensionLoader;
    }
    // The list of explicitly enabled extensions, if any were given, may contain
    // the string "none".
    getEnabledExtensions() {
        return this._enabledExtensions;
    }
    getEnableExtensionReloading() {
        return this.enableExtensionReloading;
    }
    getDisableLLMCorrection() {
        return this.disableLLMCorrection;
    }
    isPlanEnabled() {
        return this.planEnabled;
    }
    isAgentsEnabled() {
        return this.enableAgents;
    }
    getNoBrowser() {
        return this.noBrowser;
    }
    getAgentsSettings() {
        return this.agents;
    }
    isBrowserLaunchSuppressed() {
        return this.getNoBrowser() || !shouldAttemptBrowserLaunch();
    }
    getSummarizeToolOutputConfig() {
        return this.summarizeToolOutput;
    }
    getIdeMode() {
        return this.ideMode;
    }
    /**
     * Returns 'true' if the folder trust feature is enabled.
     */
    getFolderTrust() {
        return this.folderTrust;
    }
    /**
     * Returns 'true' if the workspace is considered "trusted".
     * 'false' for untrusted.
     */
    isTrustedFolder() {
        const context = ideContextStore.get();
        if (context?.workspaceState?.isTrusted !== undefined) {
            return context.workspaceState.isTrusted;
        }
        // Default to untrusted if folder trust is enabled and no explicit value is set.
        return this.folderTrust ? (this.trustedFolder ?? false) : true;
    }
    setIdeMode(value) {
        this.ideMode = value;
    }
    /**
     * Get the current FileSystemService
     */
    getFileSystemService() {
        return this.fileSystemService;
    }
    /**
     * Set a custom FileSystemService
     */
    setFileSystemService(fileSystemService) {
        this.fileSystemService = fileSystemService;
    }
    async getCompressionThreshold() {
        if (this.compressionThreshold) {
            return this.compressionThreshold;
        }
        const remoteThreshold = this.experiments?.flags[ExperimentFlags.CONTEXT_COMPRESSION_THRESHOLD]
            ?.floatValue;
        if (remoteThreshold === 0) {
            return undefined;
        }
        return remoteThreshold;
    }
    async getUserCaching() {
        await this.ensureExperimentsLoaded();
        return this.experiments?.flags[ExperimentFlags.USER_CACHING]?.boolValue;
    }
    async getBannerTextNoCapacityIssues() {
        await this.ensureExperimentsLoaded();
        return (this.experiments?.flags[ExperimentFlags.BANNER_TEXT_NO_CAPACITY_ISSUES]
            ?.stringValue ?? '');
    }
    async getBannerTextCapacityIssues() {
        await this.ensureExperimentsLoaded();
        return (this.experiments?.flags[ExperimentFlags.BANNER_TEXT_CAPACITY_ISSUES]
            ?.stringValue ?? '');
    }
    async ensureExperimentsLoaded() {
        if (!this.experimentsPromise) {
            return;
        }
        try {
            await this.experimentsPromise;
        }
        catch (e) {
            debugLogger.debug('Failed to fetch experiments', e);
        }
    }
    isInteractiveShellEnabled() {
        return (this.interactive &&
            this.ptyInfo !== 'child_process' &&
            this.enableInteractiveShell);
    }
    isSkillsSupportEnabled() {
        return this.skillsSupport;
    }
    /**
     * Reloads skills by re-discovering them from extensions and local directories.
     */
    async reloadSkills() {
        if (!this.skillsSupport) {
            return;
        }
        if (this.onReload) {
            const refreshed = await this.onReload();
            this.disabledSkills = refreshed.disabledSkills ?? [];
            this.getSkillManager().setAdminSettings(refreshed.adminSkillsEnabled ?? this.adminSkillsEnabled);
        }
        if (this.getSkillManager().isAdminEnabled()) {
            await this.getSkillManager().discoverSkills(this.storage, this.getExtensions());
            this.getSkillManager().setDisabledSkills(this.disabledSkills);
            // Re-register ActivateSkillTool to update its schema with the newly discovered skills
            if (this.getSkillManager().getSkills().length > 0) {
                this.getToolRegistry().unregisterTool(ActivateSkillTool.Name);
                this.getToolRegistry().registerTool(new ActivateSkillTool(this, this.messageBus));
            }
            else {
                this.getToolRegistry().unregisterTool(ActivateSkillTool.Name);
            }
        }
        else {
            this.getSkillManager().clearSkills();
            this.getToolRegistry().unregisterTool(ActivateSkillTool.Name);
        }
        // Notify the client that system instructions might need updating
        await this.updateSystemInstructionIfInitialized();
    }
    /**
     * Reloads agent settings.
     */
    async reloadAgents() {
        if (this.onReload) {
            const refreshed = await this.onReload();
            if (refreshed.agents) {
                this.agents = refreshed.agents;
            }
        }
    }
    isInteractive() {
        return this.interactive;
    }
    getUseRipgrep() {
        return this.useRipgrep;
    }
    getEnableInteractiveShell() {
        return this.enableInteractiveShell;
    }
    getSkipNextSpeakerCheck() {
        return this.skipNextSpeakerCheck;
    }
    getContinueOnFailedApiCall() {
        return this.continueOnFailedApiCall;
    }
    getRetryFetchErrors() {
        return this.retryFetchErrors;
    }
    getEnableShellOutputEfficiency() {
        return this.enableShellOutputEfficiency;
    }
    getShellToolInactivityTimeout() {
        return this.shellToolInactivityTimeout;
    }
    getShellExecutionConfig() {
        return this.shellExecutionConfig;
    }
    setShellExecutionConfig(config) {
        this.shellExecutionConfig = {
            terminalWidth: config.terminalWidth ?? this.shellExecutionConfig.terminalWidth,
            terminalHeight: config.terminalHeight ?? this.shellExecutionConfig.terminalHeight,
            showColor: config.showColor ?? this.shellExecutionConfig.showColor,
            pager: config.pager ?? this.shellExecutionConfig.pager,
            sanitizationConfig: config.sanitizationConfig ??
                this.shellExecutionConfig.sanitizationConfig,
        };
    }
    getScreenReader() {
        return this.accessibility.screenReader ?? false;
    }
    getEnablePromptCompletion() {
        return this.enablePromptCompletion;
    }
    getEnableToolOutputTruncation() {
        return this.enableToolOutputTruncation;
    }
    getTruncateToolOutputThreshold() {
        return Math.min(
        // Estimate remaining context window in characters (1 token ~= 4 chars).
        4 *
            (tokenLimit(this.model) - uiTelemetryService.getLastPromptTokenCount()), this.truncateToolOutputThreshold);
    }
    getTruncateToolOutputLines() {
        return this.truncateToolOutputLines;
    }
    getUseWriteTodos() {
        return this.useWriteTodos;
    }
    getOutputFormat() {
        return this.outputSettings?.format
            ? this.outputSettings.format
            : OutputFormat.TEXT;
    }
    async getGitService() {
        if (!this.gitService) {
            this.gitService = new GitService(this.targetDir, this.storage);
            await this.gitService.initialize();
        }
        return this.gitService;
    }
    getFileExclusions() {
        return this.fileExclusions;
    }
    getMessageBus() {
        return this.messageBus;
    }
    getPolicyEngine() {
        return this.policyEngine;
    }
    getEnableHooks() {
        return this.enableHooks;
    }
    getEnableHooksUI() {
        return this.enableHooksUI;
    }
    getCodebaseInvestigatorSettings() {
        return this.codebaseInvestigatorSettings;
    }
    getCliHelpAgentSettings() {
        return this.cliHelpAgentSettings;
    }
    async createToolRegistry() {
        const registry = new ToolRegistry(this, this.messageBus);
        // helper to create & register core tools that are enabled
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const registerCoreTool = (ToolClass, ...args) => {
            const className = ToolClass.name;
            const toolName = ToolClass.Name || className;
            const coreTools = this.getCoreTools();
            // On some platforms, the className can be minified to _ClassName.
            const normalizedClassName = className.replace(/^_+/, '');
            let isEnabled = true; // Enabled by default if coreTools is not set.
            if (coreTools) {
                isEnabled = coreTools.some((tool) => tool === toolName ||
                    tool === normalizedClassName ||
                    tool.startsWith(`${toolName}(`) ||
                    tool.startsWith(`${normalizedClassName}(`));
            }
            if (isEnabled) {
                // Pass message bus to tools (required for policy engine integration)
                const toolArgs = [...args, this.getMessageBus()];
                registry.registerTool(new ToolClass(...toolArgs));
            }
        };
        registerCoreTool(LSTool, this);
        registerCoreTool(ReadFileTool, this);
        if (this.getUseRipgrep()) {
            let useRipgrep = false;
            let errorString = undefined;
            try {
                useRipgrep = await canUseRipgrep();
            }
            catch (error) {
                errorString = String(error);
            }
            if (useRipgrep) {
                registerCoreTool(RipGrepTool, this);
            }
            else {
                logRipgrepFallback(this, new RipgrepFallbackEvent(errorString));
                registerCoreTool(GrepTool, this);
            }
        }
        else {
            registerCoreTool(GrepTool, this);
        }
        registerCoreTool(GlobTool, this);
        registerCoreTool(ActivateSkillTool, this);
        registerCoreTool(EditTool, this);
        registerCoreTool(WriteFileTool, this);
        registerCoreTool(WebFetchTool, this);
        registerCoreTool(ShellTool, this);
        registerCoreTool(MemoryTool);
        registerCoreTool(WebSearchTool, this);
        if (this.getUseWriteTodos()) {
            registerCoreTool(WriteTodosTool);
        }
        // Register Subagents as Tools
        // Register DelegateToAgentTool if agents are enabled
        this.registerDelegateToAgentTool(registry);
        await registry.discoverAllTools();
        registry.sortTools();
        return registry;
    }
    /**
     * Registers the DelegateToAgentTool if agents or related features are enabled.
     */
    registerDelegateToAgentTool(registry) {
        if (this.isAgentsEnabled() ||
            this.getCodebaseInvestigatorSettings().enabled ||
            this.getCliHelpAgentSettings().enabled) {
            // Check if the delegate tool itself is allowed (if allowedTools is set)
            const allowedTools = this.getAllowedTools();
            const isAllowed = !allowedTools || allowedTools.includes(DELEGATE_TO_AGENT_TOOL_NAME);
            if (isAllowed) {
                const delegateTool = new DelegateToAgentTool(this.agentRegistry, this, this.getMessageBus());
                registry.registerTool(delegateTool);
            }
        }
    }
    /**
     * Get the hook system instance
     */
    getHookSystem() {
        return this.hookSystem;
    }
    /**
     * Get hooks configuration
     */
    getHooks() {
        return this.hooks;
    }
    /**
     * Get project-specific hooks configuration
     */
    getProjectHooks() {
        return this.projectHooks;
    }
    /**
     * Update the list of disabled hooks dynamically.
     * This is used to keep the running system in sync with settings changes
     * without risk of loading new hook definitions into memory.
     */
    updateDisabledHooks(disabledHooks) {
        this.disabledHooks = disabledHooks;
    }
    /**
     * Get disabled hooks list
     */
    getDisabledHooks() {
        return this.disabledHooks;
    }
    /**
     * Get experiments configuration
     */
    getExperiments() {
        return this.experiments;
    }
    /**
     * Set experiments configuration
     */
    setExperiments(experiments) {
        this.experiments = experiments;
        const flagSummaries = Object.entries(experiments.flags ?? {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([flagId, flag]) => {
            const summary = { flagId };
            if (flag.boolValue !== undefined) {
                summary['boolValue'] = flag.boolValue;
            }
            if (flag.floatValue !== undefined) {
                summary['floatValue'] = flag.floatValue;
            }
            if (flag.intValue !== undefined) {
                summary['intValue'] = flag.intValue;
            }
            if (flag.stringValue !== undefined) {
                summary['stringValue'] = flag.stringValue;
            }
            const int32Length = flag.int32ListValue?.values?.length ?? 0;
            if (int32Length > 0) {
                summary['int32ListLength'] = int32Length;
            }
            const stringListLength = flag.stringListValue?.values?.length ?? 0;
            if (stringListLength > 0) {
                summary['stringListLength'] = stringListLength;
            }
            return summary;
        });
        const summary = {
            experimentIds: experiments.experimentIds ?? [],
            flags: flagSummaries,
        };
        const summaryString = inspect(summary, {
            depth: null,
            maxArrayLength: null,
            maxStringLength: null,
            breakLength: 80,
            compact: false,
        });
        debugLogger.debug('Experiments loaded', summaryString);
    }
    onAgentsRefreshed = async () => {
        if (this.toolRegistry) {
            this.registerDelegateToAgentTool(this.toolRegistry);
        }
        // Propagate updates to the active chat session
        const client = this.getGeminiClient();
        if (client?.isInitialized()) {
            await client.setTools();
            await client.updateSystemInstruction();
        }
        else {
            debugLogger.debug('[Config] GeminiClient not initialized; skipping live prompt/tool refresh.');
        }
    };
    /**
     * Get context memory options from settings.
     */
    getContextMemoryOptions() {
        return this.contextMemory;
    }
    /**
     * Check if TTS (Text-to-Speech) is enabled.
     */
    isTtsEnabled() {
        return this.notifications.ttsEnabled ?? false;
    }
    /**
     * Disposes of resources and removes event listeners.
     */
    async dispose() {
        coreEvents.off(CoreEvent.AgentsRefreshed, this.onAgentsRefreshed);
        if (this.agentRegistry) {
            this.agentRegistry.dispose();
        }
        if (this.mcpClientManager) {
            await this.mcpClientManager.stop();
        }
    }
}
// Export model constants for use in CLI
export { DEFAULT_GEMINI_FLASH_MODEL };
//# sourceMappingURL=config.js.map