/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const PREVIEW_GEMINI_MODEL = "gemini-3-pro-preview";
export declare const PREVIEW_GEMINI_FLASH_MODEL = "gemini-3-flash-preview";
export declare const DEFAULT_GEMINI_MODEL = "gemini-2.5-pro";
export declare const DEFAULT_GEMINI_FLASH_MODEL = "gemini-2.5-flash";
export declare const DEFAULT_GEMINI_FLASH_LITE_MODEL = "gemini-2.5-flash-lite";
export declare const VALID_GEMINI_MODELS: Set<string>;
export declare const PREVIEW_GEMINI_MODEL_AUTO = "auto-gemini-3";
export declare const DEFAULT_GEMINI_MODEL_AUTO = "auto-gemini-2.5";
export declare const GEMINI_MODEL_ALIAS_AUTO = "auto";
export declare const GEMINI_MODEL_ALIAS_PRO = "pro";
export declare const GEMINI_MODEL_ALIAS_FLASH = "flash";
export declare const GEMINI_MODEL_ALIAS_FLASH_LITE = "flash-lite";
export declare const DEFAULT_GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
export declare const DEFAULT_THINKING_MODE = 8192;
/**
 * Resolves the requested model alias (e.g., 'auto-gemini-3', 'pro', 'flash', 'flash-lite')
 * to a concrete model name, considering preview features.
 *
 * @param requestedModel The model alias or concrete model name requested by the user.
 * @param previewFeaturesEnabled A boolean indicating if preview features are enabled.
 * @returns The resolved concrete model name.
 */
export declare function resolveModel(requestedModel: string, previewFeaturesEnabled?: boolean): string;
/**
 * Resolves the appropriate model based on the classifier's decision.
 *
 * @param requestedModel The current requested model (e.g. auto-gemini-2.5).
 * @param modelAlias The alias selected by the classifier ('flash' or 'pro').
 * @param previewFeaturesEnabled Whether preview features are enabled.
 * @returns The resolved concrete model name.
 */
export declare function resolveClassifierModel(requestedModel: string, modelAlias: string, previewFeaturesEnabled?: boolean): string;
export declare function getDisplayString(model: string, previewFeaturesEnabled?: boolean): string;
/**
 * Checks if the model is a preview model.
 *
 * @param model The model name to check.
 * @returns True if the model is a preview model.
 */
export declare function isPreviewModel(model: string): boolean;
/**
 * Checks if the model is a Gemini 2.x model.
 *
 * @param model The model name to check.
 * @returns True if the model is a Gemini-2.x model.
 */
export declare function isGemini2Model(model: string): boolean;
/**
 * Checks if the model is an auto model.
 *
 * @param model The model name to check.
 * @returns True if the model is an auto model.
 */
export declare function isAutoModel(model: string): boolean;
/**
 * Checks if the model supports multimodal function responses (multimodal data nested within function response).
 * This is supported in Gemini 3.
 *
 * @param model The model name to check.
 * @returns True if the model supports multimodal function responses.
 */
export declare function supportsMultimodalFunctionResponse(model: string): boolean;
