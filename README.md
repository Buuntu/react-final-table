# React Final Table

![CI](https://github.com/Buuntu/react-final-table/workflows/tests/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT) [![codecov](https://codecov.io/gh/Buuntu/react-final-table/branch/master/graph/badge.svg)](https://codecov.io/gh/Buuntu/react-final-table) ![minzipped-size](https://badgen.net/bundlephobia/minzip/react-final-table) ![release](https://badgen.net/github/release/Buuntu/react-final-table) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A [headless UI component
libray](https://www.merrickchristensen.com/articles/headless-user-interface-components/)
for managing complex table state in React.

Inspired by
[react-table](https://github.com/tannerlinsley/react-table) but with Typescript
support built in and a simpler API.

## Features

- Type safe
- Global row filtering
- Row selection
- Custom column rendering
- Column sorting
- Data memoization for performance
- Zero dependencies

## Motivation

While there is an abundance of table libraries out there to help with sorting, filtering, pagination, and more, most are opinionated
about the user interface. Opinionated UIs can seem nice at first, but they
quickly become limiting. To embrace the Unix philosphy of separation of
concerns, the interface should be separate from the engine (from [The Art of
Unix
Programming](https://www.goodreads.com/book/show/104745.The_Art_of_UNIX_Programming)).

This is a minimal, type-safe, headless UI component library that you can plugin
to whatever frontend you're using, as long as you're using React 16 and
[Hooks](https://reactjs.org/docs/hooks-intro.html). You are then free to style
your table any way you want while using **React Final Table** to manage complex
state changes.

## Install

```bash
npm install react-final-table
```

## [CodeSandbox Demo](https://codesandbox.io/s/react-final-table-with-selection-zcodc)

## [Material UI Demo](https://codesandbox.io/s/material-ui-react-final-table-example-sigrz)

## Hooks

### `useTable`

This is the main hook exposed by the library and should be your entrypoint for
any table functionality. Only `columns` and `data` are required as arguments:

```jsx
const {
  headers,
  rows,
  selectRow,
  selectedRows
} = useTable(columns, data, {
  selectable?: boolean,
  filter?: (rows: RowType<T>[]) => RowType<T>[],
});
```

### `useTable` Arguments

#### `columns`

The first argument is an array of columns of type ColumnType. Each column has the following signature:

```typescript
type ColumnType<T> = {
  name: string;
  label?: string;
  hidden?: boolean;
  sort?: ((a: RowType<T>, b: RowType<T>) => number) | undefined;
  render?: ({ value, row }: { value: any; row: T }) => React.ReactNode;
  headerRender?: HeaderRenderType;
};
```

Only name is required, the rest are optional arguments.

#### `rows`

Rows is the second argument to useTable and can be an array of any _object_ type.

### Basic example

```tsx
import { useTable } from 'react-final-table';

const columns = [
  {
    name: 'firstName',
    label: 'First Name',
    render: ({ value }) => <h1>{value}</h1>, // optional
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
};
```

### Advanced Example

```jsx
import React, { useMemo } from 'react';
import { useTable } from 'react-final-table';

const columns = [
  { name: 'id', hidden: true },
  {
    name: 'first_name',
    label: 'First Name',
    render: ({ value }: { value: string }) => <span>Sir {value}</span>,
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
