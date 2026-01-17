/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
export declare class TextOutput {
    private atStartOfLine;
    private outputStream;
    constructor(outputStream?: NodeJS.WriteStream);
    /**
     * Writes a string to stdout.
     * @param str The string to write.
     */
    write(str: string): void;
    /**
     * Writes a string to stdout, ensuring it starts on a new line.
     * If the previous output did not end with a newline, one will be added.
     * This prevents adding extra blank lines if a newline already exists.
     * @param str The string to write.
     */
    writeOnNewLine(str: string): void;
    /**
     * Ensures that the output ends with a newline. If the last character
     * written was not a newline, one will be added.
     */
    ensureTrailingNewline(): void;
}
