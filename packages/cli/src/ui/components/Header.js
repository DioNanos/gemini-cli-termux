import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box } from 'ink';
import { ThemedGradient } from './ThemedGradient.js';
import { shortAsciiLogo, longAsciiLogo, tinyAsciiLogo, shortAsciiLogoIde, longAsciiLogoIde, tinyAsciiLogoIde, } from './AsciiArt.js';
import { getAsciiArtWidth } from '../utils/textUtils.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { getTerminalProgram } from '../utils/terminalSetup.js';
import { useSnowfall } from '../hooks/useSnowfall.js';
export const Header = ({ customAsciiArt, version, nightly, }) => {
    const { columns: terminalWidth } = useTerminalSize();
    const isIde = getTerminalProgram();
    let displayTitle;
    const widthOfLongLogo = getAsciiArtWidth(longAsciiLogo);
    const widthOfShortLogo = getAsciiArtWidth(shortAsciiLogo);
    if (customAsciiArt) {
        displayTitle = customAsciiArt;
    }
    else if (terminalWidth >= widthOfLongLogo) {
        displayTitle = isIde ? longAsciiLogoIde : longAsciiLogo;
    }
    else if (terminalWidth >= widthOfShortLogo) {
        displayTitle = isIde ? shortAsciiLogoIde : shortAsciiLogo;
    }
    else {
        displayTitle = isIde ? tinyAsciiLogoIde : tinyAsciiLogo;
    }
    const artWidth = getAsciiArtWidth(displayTitle);
    const title = useSnowfall(displayTitle);
    return (_jsxs(Box, { alignItems: "flex-start", width: artWidth, flexShrink: 0, flexDirection: "column", children: [_jsx(ThemedGradient, { children: title }), nightly && (_jsx(Box, { width: "100%", flexDirection: "row", justifyContent: "flex-end", children: _jsxs(ThemedGradient, { children: ["v", version] }) }))] }));
};
//# sourceMappingURL=Header.js.map