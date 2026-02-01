/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TERMUX PATCH: TTS Notification Tool
// This tool allows the AI to proactively send text-to-speech notifications
// when tasks complete or require attention, instead of relying on shell commands.

import { exec } from 'node:child_process';
import type { Config } from '../config/config.js';
import { debugLogger } from '../index.js';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  type ToolResult,
  Kind,
} from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import {
  TTS_NOTIFICATION_TOOL_NAME,
  TTS_NOTIFICATION_DISPLAY_NAME,
} from './tool-names.js';

export interface TtsNotificationParams {
  message: string;
}

const MAX_MESSAGE_LENGTH = 200;

export class TtsNotificationTool extends BaseDeclarativeTool<
  TtsNotificationParams,
  ToolResult
> {
  constructor(
    private readonly config: Config,
    messageBus: MessageBus,
  ) {
    super(
      TTS_NOTIFICATION_TOOL_NAME,
      TTS_NOTIFICATION_DISPLAY_NAME,
      'Speak a notification message using text-to-speech. Use this to audibly alert the user when a task completes or requires attention.',
      Kind.Communicate,
      {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            maxLength: MAX_MESSAGE_LENGTH,
            description:
              'The message to speak aloud. Keep it brief and clear (max 200 chars). Examples: "Task completed", "Build finished successfully", "Attention required"',
          },
        },
      },
      messageBus,
    );
  }

  protected override validateToolParamValues(
    params: TtsNotificationParams,
  ): string | null {
    if (!params.message || !params.message.trim()) {
      return 'Message cannot be empty.';
    }

    if (params.message.length > MAX_MESSAGE_LENGTH) {
      return `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`;
    }

    return null;
  }

  protected createInvocation(
    params: TtsNotificationParams,
    messageBus: MessageBus,
    toolName: string,
    toolDisplayName: string,
  ): TtsNotificationInvocation {
    return new TtsNotificationInvocation(
      this.config,
      params,
      messageBus,
      toolName,
      toolDisplayName,
    );
  }
}

export class TtsNotificationInvocation extends BaseToolInvocation<
  TtsNotificationParams,
  ToolResult
> {
  constructor(
    private readonly config: Config,
    params: TtsNotificationParams,
    messageBus: MessageBus,
    toolName?: string,
    toolDisplayName?: string,
  ) {
    super(params, messageBus, toolName, toolDisplayName);
  }

  getDescription(): string {
    const truncated =
      this.params.message.length > 50
        ? this.params.message.substring(0, 47) + '...'
        : this.params.message;
    return `TTS: "${truncated}"`;
  }

  override async shouldConfirmExecute(): Promise<false> {
    // TTS notifications are non-intrusive, no confirmation needed
    return false;
  }

  async execute(_signal: AbortSignal): Promise<ToolResult> {
    // Check if TTS is enabled in settings
    if (!this.config.isTtsEnabled()) {
      const msg = 'TTS notifications are disabled in settings.';
      debugLogger.log('[TTS] Notification skipped:', msg);
      return {
        llmContent: msg,
        returnDisplay: msg,
      };
    }

    const message = this.params.message.trim();
    const cmd = `echo "${message.replace(/"/g, '\\"')}" | termux-tts-speak`;

    return new Promise<ToolResult>((resolve) => {
      exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          // Log but don't fail - TTS is best-effort
          debugLogger.warn('[TTS] Failed to speak:', {
            message,
            error: error.message,
            stderr,
          });
          resolve({
            llmContent: `TTS notification attempted: "${message}"`,
            returnDisplay: `[TTS] "${message}" (failed silently)`,
          });
          return;
        }

        debugLogger.log('[TTS] Spoke:', message);
        resolve({
          llmContent: `TTS notification sent: "${message}"`,
          returnDisplay: `[TTS] "${message}"`,
        });
      });
    });
  }
}
