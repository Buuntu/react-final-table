import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useTable, ColumnType } from '../index';
import { makeData, makeSimpleData } from './makeData';
import { getBodyRows, getRow } from './test-helpers';

const Table = <T extends {}>({
  columns,
  data,
}: {
  columns: ColumnType<T>[];
  data: T[];
}) => {
  const [stateDate, setStateDate] = useState(data);

  const { headers, rows, toggleSort } = useTable(columns, stateDate, {
    sortable: true,
  });

  return (
    <>
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
            <tr data-testid={`row-${idx}`} key={idx}>
              {row.cells.map((cell, idx) => (
                <td key={idx}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {headers.map((header, idx) => (
        <>
          <button
            key={idx}
            data-testid={`toggle-sort-asc-cta-${header.name}`}
            onClick={() => toggleSort(header.name, true)}
          >
            Sort Asc
          </button>
          <button
            key={idx}
            data-testid={`toggle-sort-desc-cta-${header.name}`}
            onClick={() => toggleSort(header.name, false)}
          >
            Sort Desc
          </button>
        </>
      ))}
      <button
        data-testid="add-row"
        onClick={() =>
          setStateDate([
            ...data,
            { ...data[0], firstName: 'new', lastName: 'person' },
          ])
        }
      >
        Add Row
      </button>
    </>
  );
};

test('Should render a table with sorting enabled', () => {
  const { columns: userCols, data: userData } = makeData(10);
  const table = render(<Table columns={userCols} data={userData} />);

  const firstNameColumn = table.getByTestId('column-firstName');

  expect(getBodyRows(table)).toHaveLength(10);

  // should be sorted in ascending order
  fireEvent.click(firstNameColumn);

  expect(table.queryByTestId('sorted-firstName')).toBeInTheDocument();

  let firstRow = getRow(table, 0);
  expect(firstRow.getByText('Faulkner')).toBeInTheDocument();

  // should be sorted in descending order
  fireEvent.click(firstNameColumn);

  firstRow = getRow(table, 0);
  expect(firstRow.getByText('Yesenia')).toBeInTheDocument();
});

test('Should render a table and preserve sorting when data changes', () => {
  const { columns: userCols, data: userData } = makeData(10);
  const table = render(<Table columns={userCols} data={userData} />);

  const firstNameColumn = table.getByTestId('column-firstName');
  const addRowButton = table.getByTestId('add-row');

  expect(getBodyRows(table)).toHaveLength(10);

  // should be sorted in ascending order
  fireEvent.click(firstNameColumn);

  let firstRow = getRow(table, 0);
  expect(firstRow.getByText('Faulkner')).toBeInTheDocument();

  fireEvent.click(addRowButton);

  expect(getBodyRows(table)).toHaveLength(11);

  expect(firstRow.getByText('Faulkner')).toBeInTheDocument();

  fireEvent.click(firstNameColumn);

  expect(firstRow.getByText('Yesenia')).toBeInTheDocument();

  fireEvent.click(addRowButton);

  // expect(getBodyRows(table)).toHaveLength(12);
});

test('Should override sort order', () => {
  const { columns, data } = makeSimpleData<{
    firstName: string;
    lastName: string;
    birthDate: string;
  }>();

  const dataToSortDesc = [...data];
  dataToSortDesc[1].firstName = 'Zippy';

  const table = render(<Table columns={columns} data={dataToSortDesc} />);

  const sortFirstNameDescCta = table.getByTestId(
    'toggle-sort-desc-cta-firstName'
  );
  const sortFirstNameAscCta = table.getByTestId(
    'toggle-sort-asc-cta-firstName'
  );

  // should be sorted in descending order
  fireEvent.click(sortFirstNameDescCta);
  let firstRow = getRow(table, 0);
  expect(firstRow.getByText('Zippy')).toBeInTheDocument();

  // should (still) be sorted in descending order
  fireEvent.click(sortFirstNameDescCta);
  firstRow = getRow(table, 0);
  expect(firstRow.getByText('Zippy')).toBeInTheDocument();

  // should be sorted in ascending order
  fireEvent.click(sortFirstNameAscCta);
  firstRow = getRow(table, 0);
  expect(firstRow.getByText('Bilbo')).toBeInTheDocument();

  // should (still) be sorted in ascending order
  fireEvent.click(sortFirstNameAscCta);
  firstRow = getRow(table, 0);
  expect(firstRow.getByText('Bilbo')).toBeInTheDocument();
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
  const table = render(<Table columns={columns} data={data} />);

  const dateColumn = table.getByTestId('column-birthDate');

  // should be sorted in ascending order
  fireEvent.click(dateColumn);

  expect(table.queryByTestId('sorted-birthDate')).toBeInTheDocument();

  let firstRow = getRow(table, 0);
  let lastRow = getRow(table, 2);

  expect(firstRow.getByText('Bilbo')).toBeInTheDocument();
  expect(lastRow.getByText('Frodo')).toBeInTheDocument();

  // should be sorted in descending order
  fireEvent.click(dateColumn);

  firstRow = getRow(table, 0);
  lastRow = getRow(table, 2);

  expect(firstRow.getByText('Frodo')).toBeInTheDocument();
  expect(lastRow.getByText('Bilbo')).toBeInTheDocument();
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('Should throw error when sorting a column that does not exist', () => {
  const { columns, data } = makeSimpleData();
  const table = render(<Table columns={columns} data={data} />);

  const button = table.getByTestId('not-a-column');

  expect(() => fireEvent.click(button)).toThrowError();
});
