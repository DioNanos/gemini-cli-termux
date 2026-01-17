/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PartUnion } from '@google/genai';
import type { FileSystemService } from '../services/fileSystemService.js';
import { ToolErrorType } from '../tools/tool-error.js';
export declare function readWasmBinaryFromDisk(specifier: string): Promise<Uint8Array>;
export declare function loadWasmBinary(dynamicImport: () => Promise<{
    default: Uint8Array;
}>, fallbackSpecifier: string): Promise<Uint8Array>;
export declare const DEFAULT_ENCODING: BufferEncoding;
type UnicodeEncoding = 'utf8' | 'utf16le' | 'utf16be' | 'utf32le' | 'utf32be';
interface BOMInfo {
    encoding: UnicodeEncoding;
    bomLength: number;
}
/**
 * Detect a Unicode BOM (Byte Order Mark) if present.
 * Reads up to the first 4 bytes and returns encoding + BOM length, else null.
 */
export declare function detectBOM(buf: Buffer): BOMInfo | null;
/**
 * Read a file as text, honoring BOM encodings (UTF‑8/16/32) and stripping the BOM.
 * Falls back to utf8 when no BOM is present.
 */
export declare function readFileWithEncoding(filePath: string): Promise<string>;
/**
 * Looks up the specific MIME type for a file path.
 * @param filePath Path to the file.
 * @returns The specific MIME type string (e.g., 'text/python', 'application/javascript') or undefined if not found or ambiguous.
 */
export declare function getSpecificMimeType(filePath: string): string | undefined;
/**
 * Checks if a path is within a given root directory.
 * @param pathToCheck The absolute path to check.
 * @param rootDirectory The absolute root directory.
 * @returns True if the path is within the root directory, false otherwise.
 */
export declare function isWithinRoot(pathToCheck: string, rootDirectory: string): boolean;
/**
 * Heuristic: determine if a file is likely binary.
 * Now BOM-aware: if a Unicode BOM is detected, we treat it as text.
 * For non-BOM files, retain the existing null-byte and non-printable ratio checks.
 */
export declare function isBinaryFile(filePath: string): Promise<boolean>;
/**
 * Detects the type of file based on extension and content.
 * @param filePath Path to the file.
 * @returns Promise that resolves to 'text', 'image', 'pdf', 'audio', 'video', 'binary' or 'svg'.
 */
export declare function detectFileType(filePath: string): Promise<'text' | 'image' | 'pdf' | 'audio' | 'video' | 'binary' | 'svg'>;
export interface ProcessedFileReadResult {
    llmContent: PartUnion;
    returnDisplay: string;
    error?: string;
    errorType?: ToolErrorType;
    isTruncated?: boolean;
    originalLineCount?: number;
    linesShown?: [number, number];
}
/**
 * Reads and processes a single file, handling text, images, and PDFs.
 * @param filePath Absolute path to the file.
 * @param rootDirectory Absolute path to the project root for relative path display.
 * @param offset Optional offset for text files (0-based line number).
 * @param limit Optional limit for text files (number of lines to read).
 * @returns ProcessedFileReadResult object.
 */
export declare function processSingleFileContent(filePath: string, rootDirectory: string, fileSystemService: FileSystemService, offset?: number, limit?: number): Promise<ProcessedFileReadResult>;
export declare function fileExists(filePath: string): Promise<boolean>;
/**
 * Formats a truncated message for tool output, handling multi-line and single-line (elephant) cases.
 */
export declare function formatTruncatedToolOutput(contentStr: string, outputFile: string, truncateLines?: number): string;
/**
 * Saves tool output to a temporary file for later retrieval.
 */
export declare function saveTruncatedToolOutput(content: string, toolName: string, id: string | number, // Accept string (callId) or number (truncationId)
projectTempDir: string): Promise<{
    outputFile: string;
    totalLines: number;
}>;
export {};
