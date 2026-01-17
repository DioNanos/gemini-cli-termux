/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Interface for file system operations that may be delegated to different implementations
 */
export interface FileSystemService {
    /**
     * Read text content from a file
     *
     * @param filePath - The path to the file to read
     * @returns The file content as a string
     */
    readTextFile(filePath: string): Promise<string>;
    /**
     * Write text content to a file
     *
     * @param filePath - The path to the file to write
     * @param content - The content to write
     */
    writeTextFile(filePath: string, content: string): Promise<void>;
}
/**
 * Standard file system implementation
 */
export declare class StandardFileSystemService implements FileSystemService {
    readTextFile(filePath: string): Promise<string>;
    writeTextFile(filePath: string, content: string): Promise<void>;
}
