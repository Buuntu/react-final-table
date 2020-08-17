import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useTable } from '../hooks';
import { ColumnType } from '../types';
import { makeData, makeSimpleData } from './makeData';

const Table = <T extends {}>({
  columns,
  data,
}: {
  columns: ColumnType<T>[];
  data: T[];
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

test('Should sort by dates correctly', () => {
  const { columns, data } = makeSimpleData<{
    firstName: string;
    lastName: string;
    birthDate: string;
  }>();
  columns[2] = {
    name: 'birthDate',
    label: 'Birth Date',
    sort: (objectA, objectB) => {
      return (
        Number(new Date(objectA.original.birthDate)) -
        Number(new Date(objectB.original.birthDate))
      );
    },
  };
  const rtl = render(<Table columns={columns} data={data} />);

  const dateColumn = rtl.getByTestId('column-birthDate');

  // should be sorted in ascending order
  fireEvent.click(dateColumn);

  expect(rtl.queryByTestId('sorted-birthDate')).toBeInTheDocument();

  let firstRow = rtl.getByTestId('row-0');
  let lastRow = rtl.getByTestId('row-2');

  let { getByText } = within(firstRow);
  expect(getByText('Bilbo')).toBeInTheDocument();
  ({ getByText } = within(lastRow));
  expect(getByText('Frodo')).toBeInTheDocument();

  // should be sorted in descending order
  fireEvent.click(dateColumn);

  firstRow = rtl.getByTestId('row-0');
  lastRow = rtl.getByTestId('row-2');

  ({ getByText } = within(firstRow));
  expect(getByText('Frodo')).toBeInTheDocument();
  ({ getByText } = within(lastRow));
  expect(getByText('Bilbo')).toBeInTheDocument();
});
