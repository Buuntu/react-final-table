# React Final Table ![CI](https://github.com/Buuntu/react-final-table/workflows/tests/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A headless UI for React tables, inspired by [react-table](https://github.com/tannerlinsley/react-table) but with Typescript
support built in.

## Features

- Global sorting
- Row selection
- Custom row render function
- Hidden row attributes
- Data memoization

## Install

```bash
npm install react-final-table
```

## [CodeSandbox Demo](https://codesandbox.io/s/react-final-table-with-selection-zcodc)

## Hooks

### useTable

### Basic example:

```tsx
import { useTable, ColumnType[] } from 'react-final-table';

const columns: ColumnType[] = [
  {
    name: 'firstName',
    label: 'First Name',
    render: ({value}) => <h1>{value}</h1> // optional
  },
  {
    name: 'lastName',
    label: 'Last Name',
  },
];

const data = [
  {
    firstName: 'Frodo',
    lastName: 'Baggins',
  },
  {
    firstName: 'Samwise',
    lastName: 'Gamgee',
  },
];

const MyTable = () => {
  const { headers, rows } = useTable(columns, data);

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th key={idx}>{header.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {row.cells.map((cell, idx) => (
              <td key={idx}>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Advanced Example:

```jsx
import React, { useMemo } from 'react';
import { useTable } from 'react-final-table';

const columns = [
  { name: 'id', hidden: true },
  {
    name: 'first_name',
    label: 'First Name',
    render: ({ value }: { value: string }) => (
      <>
        <span role="img" aria-label="mage">
          🧙
        </span>
        {value}
      </>
    ),
  },
  {
    name: 'last_name',
    label: 'Last Name',
  },
];

const data = [
  {
    id: 1,
    first_name: 'Frodo',
    last_name: 'Baggins',
  },
  {
    id: 2,
    first_name: 'Samwise',
    last_name: 'Gamgee',
  },
];

function App() {
  const memoColumns = useMemo(() => columns, []);
  const memoData = useMemo(() => data, []);

  const { headers, rows, selectRow, selectedRows } = useTable(
    memoColumns,
    memoData,
    {
      selectable: true,
    }
  );

  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
            {headers.map((header, idx) => (
              <th key={idx}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td>
                <input
                  type="checkbox"
                  onChange={e => {
                    selectRow(row.id);
                  }}
                />
              </td>
              {row.cells.map((cell, idx) => (
                <td key={idx}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <pre>
        <code>{JSON.stringify(selectedRows, null, 2)}</code>
      </pre>
    </>
  );
}

export default App;
```

## Test

```bash
npm run test
```

## Contributing

Contributing is welcome! Submit pull requests using the git forking workflow.
