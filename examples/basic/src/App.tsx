import React, { useMemo } from 'react';
import { useTable } from 'react-final-table';

import { PaginationTable } from './PaginationTable';

const columns = [
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
    first_name: 'Frodo',
    last_name: 'Baggins',
  },
  {
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
                  onChange={() => {
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
        <code>{JSON.stringify(selectedRows)}</code>
      </pre>
      <h2>Pagination</h2>
      <PaginationTable />
    </>
  );
}

export default App;
