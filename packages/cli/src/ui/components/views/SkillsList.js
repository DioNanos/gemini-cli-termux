import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { theme } from '../../semantic-colors.js';
import {} from '../../types.js';
export const SkillsList = ({ skills, showDescriptions, }) => {
    const sortSkills = (a, b) => {
        if (a.isBuiltin === b.isBuiltin) {
            return a.name.localeCompare(b.name);
        }
        return a.isBuiltin ? 1 : -1;
    };
    const enabledSkills = skills.filter((s) => !s.disabled).sort(sortSkills);
    const disabledSkills = skills.filter((s) => s.disabled).sort(sortSkills);
    const renderSkill = (skill) => (_jsxs(Box, { flexDirection: "row", children: [_jsxs(Text, { color: theme.text.primary, children: ['  ', "- "] }), _jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", children: [_jsx(Text, { bold: true, color: skill.disabled ? theme.text.secondary : theme.text.link, children: skill.name }), skill.isBuiltin && (_jsx(Text, { color: theme.text.secondary, children: ' [Built-in]' }))] }), showDescriptions && skill.description && (_jsx(Box, { marginLeft: 2, children: _jsx(Text, { color: skill.disabled ? theme.text.secondary : theme.text.primary, children: skill.description }) }))] })] }, skill.name));
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [enabledSkills.length > 0 && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: theme.text.primary, children: "Available Agent Skills:" }), _jsx(Box, { height: 1 }), enabledSkills.map(renderSkill)] })), enabledSkills.length > 0 && disabledSkills.length > 0 && (_jsx(Box, { marginY: 1, children: _jsx(Text, { color: theme.text.secondary, children: '-'.repeat(20) }) })), disabledSkills.length > 0 && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: theme.text.secondary, children: "Disabled Skills:" }), _jsx(Box, { height: 1 }), disabledSkills.map(renderSkill)] })), skills.length === 0 && (_jsx(Text, { color: theme.text.primary, children: " No skills available" }))] }));
};
//# sourceMappingURL=SkillsList.js.map