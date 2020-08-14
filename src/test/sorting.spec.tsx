import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useTable } from '../hooks';
import { ColumnType } from '../types';
import { makeData } from './makeData';

const Table = ({
  columns,
  data,
}: {
  columns: ColumnType[];
  data: Object[];
}) => {
  const { headers, rows, toggleSort } = useTable(columns, data, {
    sortable: true,
  });

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header, idx) => (
            <th
              key={idx}
              data-testid={`column-${header.name}`}
              onClick={() => toggleSort(header.name)}
            >
              {header.label}

              {header.sorted && header.sorted.on ? (
                <span data-testid={`sorted-${header.name}`}></span>
              ) : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr data-testid="row" key={idx}>
            {row.cells.map((cell, idx) => (
              <td key={idx}>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

test('Should render a table with sorting enabled', () => {
  const { columns: userCols, data: userData } = makeData(10);
  const rtl = render(<Table columns={userCols} data={userData} />);

  const firstNameColumn = rtl.getByTestId('column-firstName');

  expect(rtl.queryAllByTestId('row')).toHaveLength(10);

  fireEvent.click(firstNameColumn);

  expect(rtl.queryByTestId('sorted-firstName')).toBeInTheDocument();
});
