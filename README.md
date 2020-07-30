# React Final Table ![CI](https://github.com/Buuntu/react-final-table/workflows/tests/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A headless UI for React tables, inspired by [react-table](https://github.com/tannerlinsley/react-table) but with Typescript
support built in.

## Install

```bash
npm install react-final-table
```

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

## Test

```bash
npm run test
```

## Contributing

Contributing is welcome! Submit pull requests using the git forking workflow.
