import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { useKeypress } from '../hooks/useKeypress.js';
import path from 'node:path';
import { cleanMessage, formatRelativeTime, getSessionFiles, } from '../../utils/sessionUtils.js';
const SESSIONS_PER_PAGE = 20;
// Approximate total width reserved for non-message columns and separators
// (prefix, index, message count, age, pipes, and padding) in a session row.
// If the SessionItem layout changes, update this accordingly.
const FIXED_SESSION_COLUMNS_WIDTH = 30;
const Kbd = ({ name, shortcut }) => (_jsxs(_Fragment, { children: [name, ": ", _jsx(Text, { bold: true, children: shortcut })] }));
/**
 * Loading state component displayed while sessions are being loaded.
 */
const SessionBrowserLoading = () => (_jsx(Box, { flexDirection: "column", paddingX: 1, children: _jsx(Text, { color: Colors.Gray, children: "Loading sessions\u2026" }) }));
/**
 * Error state component displayed when session loading fails.
 */
const SessionBrowserError = ({ state, }) => (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsxs(Text, { color: Colors.AccentRed, children: ["Error: ", state.error] }), _jsx(Text, { color: Colors.Gray, children: "Press q to exit" })] }));
/**
 * Empty state component displayed when no sessions are found.
 */
const SessionBrowserEmpty = () => (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsx(Text, { color: Colors.Gray, children: "No auto-saved conversations found." }), _jsx(Text, { color: Colors.Gray, children: "Press q to exit" })] }));
/**
 * Sorts an array of sessions by the specified criteria.
 * @param sessions - Array of sessions to sort
 * @param sortBy - Sort criteria: 'date' (lastUpdated), 'messages' (messageCount), or 'name' (displayName)
 * @param reverse - Whether to reverse the sort order (ascending instead of descending)
 * @returns New sorted array of sessions
 */
const sortSessions = (sessions, sortBy, reverse) => {
    const sorted = [...sessions].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return (new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
            case 'messages':
                return b.messageCount - a.messageCount;
            case 'name':
                return a.displayName.localeCompare(b.displayName);
            default:
                return 0;
        }
    });
    return reverse ? sorted.reverse() : sorted;
};
/**
 * Finds all text matches for a search query within conversation messages.
 * Creates TextMatch objects with context (10 chars before/after) and role information.
 * @param messages - Array of messages to search through
 * @param query - Search query string (case-insensitive)
 * @returns Array of TextMatch objects containing match context and metadata
 */
const findTextMatches = (messages, query) => {
    if (!query.trim())
        return [];
    const lowerQuery = query.toLowerCase();
    const matches = [];
    for (const message of messages) {
        const m = cleanMessage(message.content);
        const lowerContent = m.toLowerCase();
        let startIndex = 0;
        while (true) {
            const matchIndex = lowerContent.indexOf(lowerQuery, startIndex);
            if (matchIndex === -1)
                break;
            const contextStart = Math.max(0, matchIndex - 10);
            const contextEnd = Math.min(m.length, matchIndex + query.length + 10);
            const snippet = m.slice(contextStart, contextEnd);
            const relativeMatchStart = matchIndex - contextStart;
            const relativeMatchEnd = relativeMatchStart + query.length;
            let before = snippet.slice(0, relativeMatchStart);
            const match = snippet.slice(relativeMatchStart, relativeMatchEnd);
            let after = snippet.slice(relativeMatchEnd);
            if (contextStart > 0)
                before = '…' + before;
            if (contextEnd < m.length)
                after = after + '…';
            matches.push({ before, match, after, role: message.role });
            startIndex = matchIndex + 1;
        }
    }
    return matches;
};
/**
 * Filters sessions based on a search query, checking titles, IDs, and full content.
 * Also populates matchSnippets and matchCount for sessions with content matches.
 * @param sessions - Array of sessions to filter
 * @param query - Search query string (case-insensitive)
 * @returns Filtered array of sessions that match the query
 */
const filterSessions = (sessions, query) => {
    if (!query.trim()) {
        return sessions.map((session) => ({
            ...session,
            matchSnippets: undefined,
            matchCount: undefined,
        }));
    }
    const lowerQuery = query.toLowerCase();
    return sessions.filter((session) => {
        const titleMatch = session.displayName.toLowerCase().includes(lowerQuery) ||
            session.id.toLowerCase().includes(lowerQuery) ||
            session.firstUserMessage.toLowerCase().includes(lowerQuery);
        const contentMatch = session.fullContent
            ?.toLowerCase()
            .includes(lowerQuery);
        if (titleMatch || contentMatch) {
            if (session.messages) {
                session.matchSnippets = findTextMatches(session.messages, query);
                session.matchCount = session.matchSnippets.length;
            }
            return true;
        }
        return false;
    });
};
/**
 * Search input display component.
 */
const SearchModeDisplay = ({ state, }) => (_jsxs(Box, { marginTop: 1, children: [_jsx(Text, { color: Colors.Gray, children: "Search: " }), _jsx(Text, { color: Colors.AccentPurple, children: state.searchQuery }), _jsx(Text, { color: Colors.Gray, children: " (Esc to cancel)" })] }));
/**
 * Header component showing session count and sort information.
 */
const SessionListHeader = ({ state, }) => (_jsxs(Box, { flexDirection: "row", justifyContent: "space-between", children: [_jsxs(Text, { color: Colors.AccentPurple, children: ["Chat Sessions (", state.totalSessions, " total", state.searchQuery ? `, filtered` : '', ")"] }), _jsxs(Text, { color: Colors.Gray, children: ["sorted by ", state.sortOrder, " ", state.sortReverse ? 'asc' : 'desc'] })] }));
/**
 * Navigation help component showing keyboard shortcuts.
 */
const NavigationHelp = () => (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: Colors.Gray, children: [_jsx(Kbd, { name: "Navigate", shortcut: "\u2191/\u2193" }), '   ', _jsx(Kbd, { name: "Resume", shortcut: "Enter" }), '   ', _jsx(Kbd, { name: "Search", shortcut: "/" }), '   ', _jsx(Kbd, { name: "Delete", shortcut: "x" }), '   ', _jsx(Kbd, { name: "Quit", shortcut: "q" })] }), _jsxs(Text, { color: Colors.Gray, children: [_jsx(Kbd, { name: "Sort", shortcut: "s" }), '         ', _jsx(Kbd, { name: "Reverse", shortcut: "r" }), '      ', _jsx(Kbd, { name: "First/Last", shortcut: "g/G" })] })] }));
/**
 * Table header component with column labels and scroll indicators.
 */
const SessionTableHeader = ({ state, }) => (_jsxs(Box, { flexDirection: "row", marginTop: 1, children: [_jsx(Text, { children: state.scrollOffset > 0 ? _jsx(Text, { children: "\u25B2 " }) : '  ' }), _jsx(Box, { width: 5, flexShrink: 0, children: _jsx(Text, { color: Colors.Gray, bold: true, children: "Index" }) }), _jsx(Text, { color: Colors.Gray, children: " \u2502 " }), _jsx(Box, { width: 4, flexShrink: 0, children: _jsx(Text, { color: Colors.Gray, bold: true, children: "Msgs" }) }), _jsx(Text, { color: Colors.Gray, children: " \u2502 " }), _jsx(Box, { width: 4, flexShrink: 0, children: _jsx(Text, { color: Colors.Gray, bold: true, children: "Age" }) }), _jsx(Text, { color: Colors.Gray, children: " \u2502 " }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: Colors.Gray, bold: true, children: state.searchQuery ? 'Match' : 'Name' }) })] }));
/**
 * No results display component for empty search results.
 */
const NoResultsDisplay = ({ state, }) => (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: Colors.Gray, dimColor: true, children: ["No sessions found matching '", state.searchQuery, "'."] }) }));
/**
 * Match snippet display component for search results.
 */
const MatchSnippetDisplay = ({ session, textColor, }) => {
    if (!session.matchSnippets || session.matchSnippets.length === 0) {
        return null;
    }
    const firstMatch = session.matchSnippets[0];
    const rolePrefix = firstMatch.role === 'user' ? 'You:   ' : 'Gemini:';
    const roleColor = textColor(firstMatch.role === 'user' ? Colors.AccentGreen : Colors.AccentBlue);
    return (_jsxs(_Fragment, { children: [_jsxs(Text, { color: roleColor, bold: true, children: [rolePrefix, ' '] }), firstMatch.before, _jsx(Text, { color: textColor(Colors.AccentRed), bold: true, children: firstMatch.match }), firstMatch.after] }));
};
/**
 * Individual session row component.
 */
const SessionItem = ({ session, state, terminalWidth, formatRelativeTime, }) => {
    const originalIndex = state.startIndex + state.visibleSessions.indexOf(session);
    const isActive = originalIndex === state.activeIndex;
    const isDisabled = session.isCurrentSession;
    const textColor = (c = Colors.Foreground) => {
        if (isDisabled) {
            return Colors.Gray;
        }
        return isActive ? Colors.AccentPurple : c;
    };
    const prefix = isActive ? '❯ ' : '  ';
    let additionalInfo = '';
    let matchDisplay = null;
    // Add "(current)" label for the current session
    if (session.isCurrentSession) {
        additionalInfo = ' (current)';
    }
    // Show match snippets if searching and matches exist
    if (state.searchQuery &&
        session.matchSnippets &&
        session.matchSnippets.length > 0) {
        matchDisplay = (_jsx(MatchSnippetDisplay, { session: session, textColor: textColor }));
        if (session.matchCount && session.matchCount > 1) {
            additionalInfo += ` (+${session.matchCount - 1} more)`;
        }
    }
    // Reserve a few characters for metadata like " (current)" so the name doesn't wrap awkwardly.
    const reservedForMeta = additionalInfo ? additionalInfo.length + 1 : 0;
    const availableMessageWidth = Math.max(20, terminalWidth - FIXED_SESSION_COLUMNS_WIDTH - reservedForMeta);
    const truncatedMessage = matchDisplay ||
        (session.displayName.length === 0 ? (_jsx(Text, { color: textColor(Colors.Gray), dimColor: true, children: "(No messages)" })) : session.displayName.length > availableMessageWidth ? (session.displayName.slice(0, availableMessageWidth - 1) + '…') : (session.displayName));
    return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Text, { color: textColor(), dimColor: isDisabled, children: prefix }), _jsx(Box, { width: 5, children: _jsxs(Text, { color: textColor(), dimColor: isDisabled, children: ["#", originalIndex + 1] }) }), _jsxs(Text, { color: textColor(Colors.Gray), dimColor: isDisabled, children: [' ', "\u2502", ' '] }), _jsx(Box, { width: 4, children: _jsx(Text, { color: textColor(), dimColor: isDisabled, children: session.messageCount }) }), _jsxs(Text, { color: textColor(Colors.Gray), dimColor: isDisabled, children: [' ', "\u2502", ' '] }), _jsx(Box, { width: 4, children: _jsx(Text, { color: textColor(), dimColor: isDisabled, children: formatRelativeTime(session.lastUpdated, 'short') }) }), _jsxs(Text, { color: textColor(Colors.Gray), dimColor: isDisabled, children: [' ', "\u2502", ' '] }), _jsx(Box, { flexGrow: 1, children: _jsxs(Text, { color: textColor(Colors.Comment), dimColor: isDisabled, children: [truncatedMessage, additionalInfo && (_jsx(Text, { color: textColor(Colors.Gray), dimColor: true, bold: false, children: additionalInfo }))] }) })] }));
};
/**
 * Session list container component.
 */
const SessionList = ({ state, formatRelativeTime, }) => (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "column", children: [!state.isSearchMode && _jsx(NavigationHelp, {}), _jsx(SessionTableHeader, { state: state })] }), state.visibleSessions.map((session) => (_jsx(SessionItem, { session: session, state: state, terminalWidth: state.terminalWidth, formatRelativeTime: formatRelativeTime }, session.id))), _jsx(Text, { color: Colors.Gray, children: state.endIndex < state.totalSessions ? _jsx(_Fragment, { children: "\u25BC" }) : _jsx(Text, { dimColor: true, children: "\u25BC" }) })] }));
/**
 * Hook to manage all SessionBrowser state.
 */
export const useSessionBrowserState = (initialSessions = [], initialLoading = true, initialError = null) => {
    const { columns: terminalWidth } = useTerminalSize();
    const [sessions, setSessions] = useState(initialSessions);
    const [loading, setLoading] = useState(initialLoading);
    const [error, setError] = useState(initialError);
    const [activeIndex, setActiveIndex] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [sortOrder, setSortOrder] = useState('date');
    const [sortReverse, setSortReverse] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [hasLoadedFullContent, setHasLoadedFullContent] = useState(false);
    const loadingFullContentRef = useRef(false);
    const filteredAndSortedSessions = useMemo(() => {
        const filtered = filterSessions(sessions, searchQuery);
        return sortSessions(filtered, sortOrder, sortReverse);
    }, [sessions, searchQuery, sortOrder, sortReverse]);
    // Reset full content flag when search is cleared
    useEffect(() => {
        if (!searchQuery) {
            setHasLoadedFullContent(false);
            loadingFullContentRef.current = false;
        }
    }, [searchQuery]);
    const totalSessions = filteredAndSortedSessions.length;
    const startIndex = scrollOffset;
    const endIndex = Math.min(scrollOffset + SESSIONS_PER_PAGE, totalSessions);
    const visibleSessions = filteredAndSortedSessions.slice(startIndex, endIndex);
    const state = {
        sessions,
        setSessions,
        loading,
        setLoading,
        error,
        setError,
        activeIndex,
        setActiveIndex,
        scrollOffset,
        setScrollOffset,
        searchQuery,
        setSearchQuery,
        isSearchMode,
        setIsSearchMode,
        hasLoadedFullContent,
        setHasLoadedFullContent,
        sortOrder,
        setSortOrder,
        sortReverse,
        setSortReverse,
        terminalWidth,
        filteredAndSortedSessions,
        totalSessions,
        startIndex,
        endIndex,
        visibleSessions,
    };
    return state;
};
/**
 * Hook to load sessions on mount.
 */
const useLoadSessions = (config, state) => {
    const { setSessions, setLoading, setError, isSearchMode, hasLoadedFullContent, setHasLoadedFullContent, } = state;
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const chatsDir = path.join(config.storage.getProjectTempDir(), 'chats');
                const sessionData = await getSessionFiles(chatsDir, config.getSessionId());
                setSessions(sessionData);
                setLoading(false);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load sessions');
                setLoading(false);
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        loadSessions();
    }, [config, setSessions, setLoading, setError]);
    useEffect(() => {
        const loadFullContent = async () => {
            if (isSearchMode && !hasLoadedFullContent) {
                try {
                    const chatsDir = path.join(config.storage.getProjectTempDir(), 'chats');
                    const sessionData = await getSessionFiles(chatsDir, config.getSessionId(), { includeFullContent: true });
                    setSessions(sessionData);
                    setHasLoadedFullContent(true);
                }
                catch (err) {
                    setError(err instanceof Error
                        ? err.message
                        : 'Failed to load full session content');
                }
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        loadFullContent();
    }, [
        isSearchMode,
        hasLoadedFullContent,
        config,
        setSessions,
        setHasLoadedFullContent,
        setError,
    ]);
};
/**
 * Hook to handle selection movement.
 */
export const useMoveSelection = (state) => {
    const { totalSessions, activeIndex, scrollOffset, setActiveIndex, setScrollOffset, } = state;
    return useCallback((delta) => {
        const newIndex = Math.max(0, Math.min(totalSessions - 1, activeIndex + delta));
        setActiveIndex(newIndex);
        // Adjust scroll offset if needed
        if (newIndex < scrollOffset) {
            setScrollOffset(newIndex);
        }
        else if (newIndex >= scrollOffset + SESSIONS_PER_PAGE) {
            setScrollOffset(newIndex - SESSIONS_PER_PAGE + 1);
        }
    }, [totalSessions, activeIndex, scrollOffset, setActiveIndex, setScrollOffset]);
};
/**
 * Hook to handle sort order cycling.
 */
export const useCycleSortOrder = (state) => {
    const { sortOrder, setSortOrder } = state;
    return useCallback(() => {
        const orders = [
            'date',
            'messages',
            'name',
        ];
        const currentIndex = orders.indexOf(sortOrder);
        const nextIndex = (currentIndex + 1) % orders.length;
        setSortOrder(orders[nextIndex]);
    }, [sortOrder, setSortOrder]);
};
/**
 * Hook to handle SessionBrowser input.
 */
export const useSessionBrowserInput = (state, moveSelection, cycleSortOrder, onResumeSession, onDeleteSession, onExit) => {
    useKeypress((key) => {
        if (state.isSearchMode) {
            // Search-specific input handling.  Only control/symbols here.
            if (key.name === 'escape') {
                state.setIsSearchMode(false);
                state.setSearchQuery('');
                state.setActiveIndex(0);
                state.setScrollOffset(0);
            }
            else if (key.name === 'backspace') {
                state.setSearchQuery((prev) => prev.slice(0, -1));
                state.setActiveIndex(0);
                state.setScrollOffset(0);
            }
            else if (key.sequence &&
                !key.ctrl &&
                !key.meta &&
                key.sequence.length === 1) {
                state.setSearchQuery((prev) => prev + key.sequence);
                state.setActiveIndex(0);
                state.setScrollOffset(0);
            }
        }
        else {
            // Navigation mode input handling.  We're keeping the letter-based controls for non-search
            // mode only, because the letters need to act as input for the search.
            if (key.sequence === 'g') {
                state.setActiveIndex(0);
                state.setScrollOffset(0);
            }
            else if (key.sequence === 'G') {
                state.setActiveIndex(state.totalSessions - 1);
                state.setScrollOffset(Math.max(0, state.totalSessions - SESSIONS_PER_PAGE));
            }
            // Sorting controls.
            else if (key.sequence === 's') {
                cycleSortOrder();
            }
            else if (key.sequence === 'r') {
                state.setSortReverse(!state.sortReverse);
            }
            // Searching and exit controls.
            else if (key.sequence === '/') {
                state.setIsSearchMode(true);
            }
            else if (key.sequence === 'q' ||
                key.sequence === 'Q' ||
                key.name === 'escape') {
                onExit();
            }
            // Delete session control.
            else if (key.sequence === 'x' || key.sequence === 'X') {
                const selectedSession = state.filteredAndSortedSessions[state.activeIndex];
                if (selectedSession && !selectedSession.isCurrentSession) {
                    onDeleteSession(selectedSession)
                        .then(() => {
                        // Remove the session from the state
                        state.setSessions(state.sessions.filter((s) => s.id !== selectedSession.id));
                        // Adjust active index if needed
                        if (state.activeIndex >=
                            state.filteredAndSortedSessions.length - 1) {
                            state.setActiveIndex(Math.max(0, state.filteredAndSortedSessions.length - 2));
                        }
                    })
                        .catch((error) => {
                        state.setError(`Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    });
                }
            }
            // less-like u/d controls.
            else if (key.sequence === 'u') {
                moveSelection(-Math.round(SESSIONS_PER_PAGE / 2));
            }
            else if (key.sequence === 'd') {
                moveSelection(Math.round(SESSIONS_PER_PAGE / 2));
            }
        }
        // Handling regardless of search mode.
        if (key.name === 'return' &&
            state.filteredAndSortedSessions[state.activeIndex]) {
            const selectedSession = state.filteredAndSortedSessions[state.activeIndex];
            // Don't allow resuming the current session
            if (!selectedSession.isCurrentSession) {
                onResumeSession(selectedSession);
            }
        }
        else if (key.name === 'up') {
            moveSelection(-1);
        }
        else if (key.name === 'down') {
            moveSelection(1);
        }
        else if (key.name === 'pageup') {
            moveSelection(-SESSIONS_PER_PAGE);
        }
        else if (key.name === 'pagedown') {
            moveSelection(SESSIONS_PER_PAGE);
        }
    }, { isActive: true });
};
export function SessionBrowserView({ state, }) {
    if (state.loading) {
        return _jsx(SessionBrowserLoading, {});
    }
    if (state.error) {
        return _jsx(SessionBrowserError, { state: state });
    }
    if (state.sessions.length === 0) {
        return _jsx(SessionBrowserEmpty, {});
    }
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsx(SessionListHeader, { state: state }), state.isSearchMode && _jsx(SearchModeDisplay, { state: state }), state.totalSessions === 0 ? (_jsx(NoResultsDisplay, { state: state })) : (_jsx(SessionList, { state: state, formatRelativeTime: formatRelativeTime }))] }));
}
export function SessionBrowser({ config, onResumeSession, onDeleteSession, onExit, }) {
    // Use all our custom hooks
    const state = useSessionBrowserState();
    useLoadSessions(config, state);
    const moveSelection = useMoveSelection(state);
    const cycleSortOrder = useCycleSortOrder(state);
    useSessionBrowserInput(state, moveSelection, cycleSortOrder, onResumeSession, onDeleteSession, onExit);
    return _jsx(SessionBrowserView, { state: state });
}
//# sourceMappingURL=SessionBrowser.js.map