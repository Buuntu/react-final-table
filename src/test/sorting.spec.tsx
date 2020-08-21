import React from 'react';
import { render, fireEvent, within, screen } from '@testing-library/react';
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
          <th data-testid="not-a-column" onClick={() => toggleSort('fake')}>
            Fake column
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr data-testid={`row-${idx}`} role="table-row" key={idx}>
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
  render(<Table columns={userCols} data={userData} />);

  const firstNameColumn = screen.getByTestId('column-firstName');

  expect(screen.queryAllByRole('table-row')).toHaveLength(10);

  // should be sorted in ascending order
  fireEvent.click(firstNameColumn);

  let firstRow = screen.getByTestId('row-0');

  expect(screen.queryByTestId('sorted-firstName')).toBeInTheDocument();

  let { getByText } = within(firstRow);
  expect(getByText('Faulkner')).toBeInTheDocument();

  // should be sorted in descending order
  fireEvent.click(firstNameColumn);

  firstRow = screen.getByTestId('row-0');

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
  render(<Table columns={columns} data={data} />);

  const dateColumn = screen.getByTestId('column-birthDate');

  // should be sorted in ascending order
  fireEvent.click(dateColumn);

  expect(screen.queryByTestId('sorted-birthDate')).toBeInTheDocument();

  let firstRow = screen.getByTestId('row-0');
  let lastRow = screen.getByTestId('row-2');

  let { getByText } = within(firstRow);
  expect(getByText('Bilbo')).toBeInTheDocument();
  ({ getByText } = within(lastRow));
  expect(getByText('Frodo')).toBeInTheDocument();

  // should be sorted in descending order
  fireEvent.click(dateColumn);

  firstRow = screen.getByTestId('row-0');
  lastRow = screen.getByTestId('row-2');

  ({ getByText } = within(firstRow));
  expect(getByText('Frodo')).toBeInTheDocument();
  ({ getByText } = within(lastRow));
  expect(getByText('Bilbo')).toBeInTheDocument();
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('Should throw error when sorting a column that does not exist', () => {
  const { columns, data } = makeSimpleData();
  render(<Table columns={columns} data={data} />);

  const button = screen.getByTestId('not-a-column');

  expect(() => fireEvent.click(button)).toThrowError();
});
