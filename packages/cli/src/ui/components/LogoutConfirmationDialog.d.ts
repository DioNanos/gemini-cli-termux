/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
export declare enum LogoutChoice {
    LOGIN = "login",
    EXIT = "exit"
}
interface LogoutConfirmationDialogProps {
    onSelect: (choice: LogoutChoice) => void;
}
export declare const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps>;
export {};
