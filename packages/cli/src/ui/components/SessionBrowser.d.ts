/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type React from 'react';
import type { Config } from '@google/gemini-cli-core';
import type { SessionInfo } from '../../utils/sessionUtils.js';
/**
 * Props for the main SessionBrowser component.
 */
export interface SessionBrowserProps {
    /** Application configuration object */
    config: Config;
    /** Callback when user selects a session to resume */
    onResumeSession: (session: SessionInfo) => void;
    /** Callback when user deletes a session */
    onDeleteSession: (session: SessionInfo) => Promise<void>;
    /** Callback when user exits the session browser */
    onExit: () => void;
}
/**
 * Centralized state interface for SessionBrowser component.
 * Eliminates prop drilling by providing all state in a single object.
 */
export interface SessionBrowserState {
    /** All loaded sessions */
    sessions: SessionInfo[];
    /** Sessions after filtering and sorting */
    filteredAndSortedSessions: SessionInfo[];
    /** Whether sessions are currently loading */
    loading: boolean;
    /** Error message if loading failed */
    error: string | null;
    /** Index of currently selected session */
    activeIndex: number;
    /** Current scroll offset for pagination */
    scrollOffset: number;
    /** Terminal width for layout calculations */
    terminalWidth: number;
    /** Current search query string */
    searchQuery: string;
    /** Whether user is in search input mode */
    isSearchMode: boolean;
    /** Whether full content has been loaded for search */
    hasLoadedFullContent: boolean;
    /** Current sort criteria */
    sortOrder: 'date' | 'messages' | 'name';
    /** Whether sort order is reversed */
    sortReverse: boolean;
    /** Total number of filtered sessions */
    totalSessions: number;
    /** Start index for current page */
    startIndex: number;
    /** End index for current page */
    endIndex: number;
    /** Sessions visible on current page */
    visibleSessions: SessionInfo[];
    /** Update sessions array */
    setSessions: React.Dispatch<React.SetStateAction<SessionInfo[]>>;
    /** Update loading state */
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    /** Update error state */
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    /** Update active session index */
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
    /** Update scroll offset */
    setScrollOffset: React.Dispatch<React.SetStateAction<number>>;
    /** Update search query */
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    /** Update search mode state */
    setIsSearchMode: React.Dispatch<React.SetStateAction<boolean>>;
    /** Update sort order */
    setSortOrder: React.Dispatch<React.SetStateAction<'date' | 'messages' | 'name'>>;
    /** Update sort reverse flag */
    setSortReverse: React.Dispatch<React.SetStateAction<boolean>>;
    setHasLoadedFullContent: React.Dispatch<React.SetStateAction<boolean>>;
}
/**
 * Hook to manage all SessionBrowser state.
 */
export declare const useSessionBrowserState: (initialSessions?: SessionInfo[], initialLoading?: boolean, initialError?: string | null) => SessionBrowserState;
/**
 * Hook to handle selection movement.
 */
export declare const useMoveSelection: (state: SessionBrowserState) => (delta: number) => void;
/**
 * Hook to handle sort order cycling.
 */
export declare const useCycleSortOrder: (state: SessionBrowserState) => () => void;
/**
 * Hook to handle SessionBrowser input.
 */
export declare const useSessionBrowserInput: (state: SessionBrowserState, moveSelection: (delta: number) => void, cycleSortOrder: () => void, onResumeSession: (session: SessionInfo) => void, onDeleteSession: (session: SessionInfo) => Promise<void>, onExit: () => void) => void;
export declare function SessionBrowserView({ state, }: {
    state: SessionBrowserState;
}): React.JSX.Element;
export declare function SessionBrowser({ config, onResumeSession, onDeleteSession, onExit, }: SessionBrowserProps): React.JSX.Element;
