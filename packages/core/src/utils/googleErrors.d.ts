/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview
 * This file contains types and functions for parsing structured Google API errors.
 */
/**
 * Based on google/rpc/error_details.proto
 */
export interface ErrorInfo {
    '@type': 'type.googleapis.com/google.rpc.ErrorInfo';
    reason: string;
    domain: string;
    metadata: {
        [key: string]: string;
    };
}
export interface RetryInfo {
    '@type': 'type.googleapis.com/google.rpc.RetryInfo';
    retryDelay: string;
}
export interface DebugInfo {
    '@type': 'type.googleapis.com/google.rpc.DebugInfo';
    stackEntries: string[];
    detail: string;
}
export interface QuotaFailure {
    '@type': 'type.googleapis.com/google.rpc.QuotaFailure';
    violations: Array<{
        subject?: string;
        description?: string;
        apiService?: string;
        quotaMetric?: string;
        quotaId?: string;
        quotaDimensions?: {
            [key: string]: string;
        };
        quotaValue?: string | number;
        futureQuotaValue?: number;
    }>;
}
export interface PreconditionFailure {
    '@type': 'type.googleapis.com/google.rpc.PreconditionFailure';
    violations: Array<{
        type: string;
        subject: string;
        description: string;
    }>;
}
export interface LocalizedMessage {
    '@type': 'type.googleapis.com/google.rpc.LocalizedMessage';
    locale: string;
    message: string;
}
export interface BadRequest {
    '@type': 'type.googleapis.com/google.rpc.BadRequest';
    fieldViolations: Array<{
        field: string;
        description: string;
        reason?: string;
        localizedMessage?: LocalizedMessage;
    }>;
}
export interface RequestInfo {
    '@type': 'type.googleapis.com/google.rpc.RequestInfo';
    requestId: string;
    servingData: string;
}
export interface ResourceInfo {
    '@type': 'type.googleapis.com/google.rpc.ResourceInfo';
    resourceType: string;
    resourceName: string;
    owner: string;
    description: string;
}
export interface Help {
    '@type': 'type.googleapis.com/google.rpc.Help';
    links: Array<{
        description: string;
        url: string;
    }>;
}
export type GoogleApiErrorDetail = ErrorInfo | RetryInfo | DebugInfo | QuotaFailure | PreconditionFailure | BadRequest | RequestInfo | ResourceInfo | Help | LocalizedMessage;
export interface GoogleApiError {
    code: number;
    message: string;
    details: GoogleApiErrorDetail[];
}
/**
 * Parses an error object to check if it's a structured Google API error
 * and extracts all details.
 *
 * This function can handle two formats:
 * 1. Standard Google API errors where `details` is a top-level field.
 * 2. Errors where the entire structured error object is stringified inside
 *    the `message` field of a wrapper error.
 *
 * @param error The error object to inspect.
 * @returns A GoogleApiError object if the error matches, otherwise null.
 */
export declare function parseGoogleApiError(error: unknown): GoogleApiError | null;
