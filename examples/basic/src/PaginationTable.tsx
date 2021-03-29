import React, { FC } from 'react';
import { useTable } from 'react-final-table';
import { useMemo } from 'react';

const columns = [
  {
    name: 'firstName',
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

export const PaginationTable: FC = () => {
  const memoColumns = useMemo(() => columns, []);
  const memoData = useMemo(
    () => [...Array(10).fill(data[0]), ...Array(10).fill(data[1])],
    []
  );

  const { headers, rows, pagination } = useTable<{
    firstName: string;
    lastName: string;
  }>(memoColumns, memoData, { pagination: true });

  return (
    <>
      <table>
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header.render()}</th>
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
      <div>
        <button data-testid="prev-page" onClick={() => pagination.prevPage()}>
          {'<'}
        </button>
        <button data-testid="next-page" onClick={() => pagination.nextPage()}>
          {'>'}
        </button>
      </div>
      <code>
        <pre>{JSON.stringify({ rows }, null, 2)}</pre>
      </code>
    </>
  );
};
