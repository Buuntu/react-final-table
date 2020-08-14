import React, { useCallback, useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTable } from '../hooks';
import { ColumnType, RowType } from '../types';
import { makeData } from './makeData';

const columns = [
  {
    name: 'firstName',
    label: 'First Name',
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

const Table = ({
  columns,
  data,
}: {
  columns: ColumnType[];
  data: Object[];
}) => {
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

test('Should render a basic table', () => {
  const rtl = render(<Table columns={columns} data={data} />);

  expect(rtl.getByText('Frodo')).toBeInTheDocument();
  expect(rtl.getByText('Baggins')).toBeInTheDocument();
  expect(rtl.getByText('Samwise')).toBeInTheDocument();
  expect(rtl.getByText('Gamgee')).toBeInTheDocument();
});

const reverseData = [
  {
    lastName: 'Baggins',
    firstName: 'Frodo',
  },
  {
    lastName: 'Gamgee',
    firstName: 'Samwise',
  },
];

test('Should be equal regardless of field order in data', () => {
  const normalTl = render(<Table columns={columns} data={data} />);
  const reverseTl = render(<Table columns={columns} data={reverseData} />);

  expect(normalTl.asFragment()).toEqual(reverseTl.asFragment());
});

const columnsWithRender: ColumnType[] = [
  {
    name: 'firstName',
    label: 'First Name',
    render: ({ value }) => <h1 data-testid="first-name">{value}</h1>,
  },
  {
    name: 'lastName',
    label: 'Last Name',
  },
];

test('Should see custom render HTML', () => {
  const rtl = render(<Table columns={columnsWithRender} data={data} />);

  expect(rtl.getAllByTestId('first-name')).toHaveLength(2);
});

const TableWithSelection = ({
  columns,
  data,
}: {
  columns: ColumnType[];
  data: Object[];
}) => {
  const { headers, rows, selectRow, selectedRows } = useTable(columns, data, {
    selectable: true,
  });

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
                  data-testid={`checkbox-${row.id}`}
                  checked={row.selected}
                  onChange={() => selectRow(row.id)}
                ></input>
              </td>
              {row.cells.map((cell, idx) => (
                <td key={idx}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <tbody>
          {selectedRows.map((row, rowIdx) => (
            <tr key={rowIdx} data-testid="selected-row">
              {row.cells.map((cell, idx) => (
                <td key={idx}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

test('Should be able to select rows', async () => {
  const rtl = render(<TableWithSelection columns={columns} data={data} />);
  const checkbox = rtl.getByTestId('checkbox-0') as HTMLInputElement;
  const checkbox2 = rtl.getByTestId('checkbox-1') as HTMLInputElement;

  fireEvent.click(checkbox);
  expect(checkbox.checked).toEqual(true);
  expect(rtl.getAllByTestId('selected-row')).toHaveLength(1);

  fireEvent.click(checkbox2);
  expect(rtl.getAllByTestId('selected-row')).toHaveLength(2);

  fireEvent.click(checkbox);
  expect(checkbox.checked).toEqual(false);
  expect(rtl.queryAllByTestId('selected-row')).toHaveLength(1);

  fireEvent.click(checkbox2);
  expect(checkbox2.checked).toEqual(false);
  expect(rtl.queryAllByTestId('selected-row')).toHaveLength(0);
});

const TableWithFilter = ({
  columns,
  data,
  filter,
}: {
  columns: ColumnType[];
  data: Object[];
  filter: (row: RowType[]) => RowType[];
}) => {
  const { headers, rows } = useTable(columns, data, {
    filter,
  });

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
          <tr data-testid="table-row" key={idx}>
            {row.cells.map((cell, idx) => (
              <td key={idx}>{cell.render()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

test('Should be able to filter rows', () => {
  const rtl = render(
    <TableWithFilter
      columns={columns}
      data={data}
      filter={rows => {
        return rows.filter((_, idx) => idx % 2 === 0);
      }}
    />
  );

  expect(rtl.getAllByTestId('table-row')).toHaveLength(1);
});

const TableWithSelectionAndFiltering = ({
  columns,
  data,
}: {
  columns: ColumnType[];
  data: Object[];
}) => {
  const [searchString, setSearchString] = useState('');
  const [filterOn, setFilterOn] = useState(false);

  const { headers, rows, selectRow, selectedRows } = useTable(columns, data, {
    selectable: true,
    filter: useCallback(
      (rows: RowType[]) => {
        return rows.filter(row => {
          return (
            row.cells.filter(cell => {
              if (typeof cell.value !== 'string') {
                return false;
              }

              return cell.value.toLowerCase().includes(searchString)
                ? true
                : false;
            }).length > 0
          );
        });
      },
      [searchString]
    ),
  });

  return (
    <>
      <input
        data-testid="input"
        type="text"
        value={searchString}
        onChange={e => setSearchString(e.target.value)}
      ></input>
      <button
        data-testid="filter-button"
        onClick={() => setFilterOn(!filterOn)}
      >
        Filter
      </button>
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
            <tr key={idx} data-testid="row">
              <td>
                <input
                  type="checkbox"
                  data-testid={`checkbox-${row.id}`}
                  checked={row.selected}
                  onChange={() => selectRow(row.id)}
                ></input>
              </td>
              {row.cells.map((cell, idx) => (
                <td key={idx}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <tbody>
          {selectedRows.map((row, rowIdx) => (
            <tr key={rowIdx} data-testid="selected-row">
              {row.cells.map((cell, idx) => (
                <td key={idx}>{cell.render()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

test('Should be able to select rows while filtering', async () => {
  const { columns: userCols, data: userData } = makeData(10);
  const rtl = render(
    <TableWithSelectionAndFiltering columns={userCols} data={userData} />
  );
  let checkbox = rtl.getByTestId('checkbox-0') as HTMLInputElement;
  const checkbox2 = rtl.getByTestId('checkbox-1') as HTMLInputElement;

  const input = rtl.getByTestId('input');

  // Make sure all rows are still there
  expect(rtl.getByText(userData[0].firstName)).toBeInTheDocument();
  expect(rtl.getByText(userData[0].lastName)).toBeInTheDocument();
  expect(rtl.getByText(userData[1].firstName)).toBeInTheDocument();
  expect(rtl.getByText(userData[1].lastName)).toBeInTheDocument();

  fireEvent.click(checkbox);
  expect(checkbox.checked).toEqual(true);
  expect(rtl.getAllByTestId('selected-row')).toHaveLength(1);

  fireEvent.click(checkbox2);
  expect(rtl.getAllByTestId('selected-row')).toHaveLength(2);

  fireEvent.click(checkbox);
  expect(checkbox.checked).toEqual(false);
  expect(rtl.queryAllByTestId('selected-row')).toHaveLength(1);

  fireEvent.click(checkbox2);
  expect(checkbox2.checked).toEqual(false);
  expect(rtl.queryAllByTestId('selected-row')).toHaveLength(0);

  // type into filter input a value that doesn't exist
  fireEvent.change(input, { target: { value: '23' } });

  expect(rtl.queryAllByTestId('row')).toHaveLength(0);

  // should have one row with this name
  fireEvent.change(input, { target: { value: 'ye' } });

  expect(rtl.queryAllByTestId('row')).toHaveLength(1);

  checkbox = rtl.getByTestId('checkbox-0') as HTMLInputElement;
  fireEvent.click(checkbox);

  expect(checkbox.checked).toEqual(true);
  expect(rtl.queryAllByTestId('selected-row')).toHaveLength(1);

  fireEvent.change(input, { target: { value: '' } });

  expect(rtl.queryAllByTestId('selected-row')).toHaveLength(1);
  expect(rtl.queryAllByTestId('row')).toHaveLength(10);
});
