import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { Box, Text } from 'ink';
import { theme } from '../semantic-colors.js';
import { RadioButtonSelect } from '../components/shared/RadioButtonSelect.js';
import { SettingScope } from '../../config/settings.js';
import { AuthType, clearCachedCredentialFile, } from '@google/gemini-cli-core';
import { useKeypress } from '../hooks/useKeypress.js';
import { AuthState } from '../types.js';
import { runExitCleanup } from '../../utils/cleanup.js';
import { validateAuthMethodWithSettings } from './useAuth.js';
import { RELAUNCH_EXIT_CODE } from '../../utils/processUtils.js';
export function AuthDialog({ config, settings, setAuthState, authError, onAuthError, setAuthContext, }) {
    const [exiting, setExiting] = useState(false);
    let items = [
        {
            label: 'Login with Google',
            value: AuthType.LOGIN_WITH_GOOGLE,
            key: AuthType.LOGIN_WITH_GOOGLE,
        },
        ...(process.env['CLOUD_SHELL'] === 'true'
            ? [
                {
                    label: 'Use Cloud Shell user credentials',
                    value: AuthType.COMPUTE_ADC,
                    key: AuthType.COMPUTE_ADC,
                },
            ]
            : process.env['GEMINI_CLI_USE_COMPUTE_ADC'] === 'true'
                ? [
                    {
                        label: 'Use metadata server application default credentials',
                        value: AuthType.COMPUTE_ADC,
                        key: AuthType.COMPUTE_ADC,
                    },
                ]
                : []),
        {
            label: 'Use Gemini API Key',
            value: AuthType.USE_GEMINI,
            key: AuthType.USE_GEMINI,
        },
        {
            label: 'Vertex AI',
            value: AuthType.USE_VERTEX_AI,
            key: AuthType.USE_VERTEX_AI,
        },
    ];
    if (settings.merged.security.auth.enforcedType) {
        items = items.filter((item) => item.value === settings.merged.security.auth.enforcedType);
    }
    let defaultAuthType = null;
    const defaultAuthTypeEnv = process.env['GEMINI_DEFAULT_AUTH_TYPE'];
    if (defaultAuthTypeEnv &&
        Object.values(AuthType).includes(defaultAuthTypeEnv)) {
        defaultAuthType = defaultAuthTypeEnv;
    }
    let initialAuthIndex = items.findIndex((item) => {
        if (settings.merged.security.auth.selectedType) {
            return item.value === settings.merged.security.auth.selectedType;
        }
        if (defaultAuthType) {
            return item.value === defaultAuthType;
        }
        if (process.env['GEMINI_API_KEY']) {
            return item.value === AuthType.USE_GEMINI;
        }
        return item.value === AuthType.LOGIN_WITH_GOOGLE;
    });
    if (settings.merged.security.auth.enforcedType) {
        initialAuthIndex = 0;
    }
    const onSelect = useCallback(async (authType, scope) => {
        if (exiting) {
            return;
        }
        if (authType) {
            if (authType === AuthType.LOGIN_WITH_GOOGLE) {
                setAuthContext({ requiresRestart: true });
            }
            else {
                setAuthContext({});
            }
            await clearCachedCredentialFile();
            settings.setValue(scope, 'security.auth.selectedType', authType);
            if (authType === AuthType.LOGIN_WITH_GOOGLE &&
                config.isBrowserLaunchSuppressed()) {
                setExiting(true);
                setTimeout(async () => {
                    await runExitCleanup();
                    process.exit(RELAUNCH_EXIT_CODE);
                }, 100);
                return;
            }
            if (authType === AuthType.USE_GEMINI) {
                if (process.env['GEMINI_API_KEY'] !== undefined) {
                    setAuthState(AuthState.Unauthenticated);
                    return;
                }
                else {
                    setAuthState(AuthState.AwaitingApiKeyInput);
                    return;
                }
            }
        }
        setAuthState(AuthState.Unauthenticated);
    }, [settings, config, setAuthState, exiting, setAuthContext]);
    const handleAuthSelect = (authMethod) => {
        const error = validateAuthMethodWithSettings(authMethod, settings);
        if (error) {
            onAuthError(error);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            onSelect(authMethod, SettingScope.User);
        }
    };
    useKeypress((key) => {
        if (key.name === 'escape') {
            // Prevent exit if there is an error message.
            // This means they user is not authenticated yet.
            if (authError) {
                return;
            }
            if (settings.merged.security.auth.selectedType === undefined) {
                // Prevent exiting if no auth method is set
                onAuthError('You must select an auth method to proceed. Press Ctrl+C twice to exit.');
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            onSelect(undefined, SettingScope.User);
        }
    }, { isActive: true });
    if (exiting) {
        return (_jsx(Box, { borderStyle: "round", borderColor: theme.border.focused, flexDirection: "row", padding: 1, width: "100%", alignItems: "flex-start", children: _jsx(Text, { color: theme.text.primary, children: "Logging in with Google... Restarting Gemini CLI to continue." }) }));
    }
    return (_jsxs(Box, { borderStyle: "round", borderColor: theme.border.focused, flexDirection: "row", padding: 1, width: "100%", alignItems: "flex-start", children: [_jsx(Text, { color: theme.text.accent, children: "? " }), _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Get started" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.primary, children: "How would you like to authenticate for this project?" }) }), _jsx(Box, { marginTop: 1, children: _jsx(RadioButtonSelect, { items: items, initialIndex: initialAuthIndex, onSelect: handleAuthSelect, onHighlight: () => {
                                onAuthError(null);
                            } }) }), authError && (_jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.status.error, children: authError }) })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.secondary, children: "(Use Enter to select)" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.primary, children: "Terms of Services and Privacy Notice for Gemini CLI" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.text.link, children: 'https://github.com/google-gemini/gemini-cli/blob/main/docs/tos-privacy.md' }) })] })] }));
}
//# sourceMappingURL=AuthDialog.js.map