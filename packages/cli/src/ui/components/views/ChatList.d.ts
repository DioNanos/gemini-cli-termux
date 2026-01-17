/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { ChatDetail } from '../../types.js';
interface ChatListProps {
    chats: readonly ChatDetail[];
}
export declare const ChatList: React.FC<ChatListProps>;
export {};
