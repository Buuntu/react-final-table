import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
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
          <tr data-testid={`row-${idx}`} aria-label="row" key={idx}>
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

  expect(rtl.queryAllByLabelText('row')).toHaveLength(10);

  // should be sorted in ascending order
  fireEvent.click(firstNameColumn);

  let firstRow = rtl.getByTestId('row-0');

  expect(rtl.queryByTestId('sorted-firstName')).toBeInTheDocument();

  let { getByText } = within(firstRow);
  expect(getByText('Faulkner')).toBeInTheDocument();

  // should be sorted in descending order
  fireEvent.click(firstNameColumn);

  firstRow = rtl.getByTestId('row-0');

  ({ getByText } = within(firstRow));
  expect(getByText('Yesenia')).toBeInTheDocument();
});
