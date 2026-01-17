import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { render } from '../../test-utils/render.js';
import { Table } from './Table.js';
import { Text } from 'ink';
describe('Table', () => {
    it('should render headers and data correctly', () => {
        const columns = [
            { key: 'id', header: 'ID', width: 5 },
            { key: 'name', header: 'Name', flexGrow: 1 },
        ];
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];
        const { lastFrame } = render(_jsx(Table, { columns: columns, data: data }), 100);
        const output = lastFrame();
        expect(output).toContain('ID');
        expect(output).toContain('Name');
        expect(output).toContain('1');
        expect(output).toContain('Alice');
        expect(output).toContain('2');
        expect(output).toContain('Bob');
        expect(lastFrame()).toMatchSnapshot();
    });
    it('should support custom cell rendering', () => {
        const columns = [
            {
                key: 'value',
                header: 'Value',
                flexGrow: 1,
                renderCell: (item) => (_jsx(Text, { color: "green", children: item.value * 2 })),
            },
        ];
        const data = [{ value: 10 }];
        const { lastFrame } = render(_jsx(Table, { columns: columns, data: data }), 100);
        const output = lastFrame();
        expect(output).toContain('20');
        expect(lastFrame()).toMatchSnapshot();
    });
    it('should handle undefined values gracefully', () => {
        const columns = [{ key: 'name', header: 'Name', flexGrow: 1 }];
        const data = [{ name: undefined }];
        const { lastFrame } = render(_jsx(Table, { columns: columns, data: data }), 100);
        const output = lastFrame();
        expect(output).toContain('undefined');
    });
});
//# sourceMappingURL=Table.test.js.map