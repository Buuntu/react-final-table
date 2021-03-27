import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useTable, ColumnType } from '../index';
import { getBodyRows } from './test-helpers';

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
  columns: any[];
  data: { firstName: string; lastName: string }[];
}) => {
  const { headers, rows } = useTable<{ firstName: string; lastName: string }>(
    columns,
    data
  );

  return (
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
  );
};

test('Should render a basic table', () => {
  const table = render(<Table columns={columns} data={data} />);

  expect(table.getByText('Frodo')).toBeInTheDocument();
  expect(table.getByText('Baggins')).toBeInTheDocument();
  expect(table.getByText('Samwise')).toBeInTheDocument();
  expect(table.getByText('Gamgee')).toBeInTheDocument();
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

test('Should update table rows when data changes', () => {
  const table = render(<Table columns={columns} data={data} />);
  expect(getBodyRows(table)).toHaveLength(2);

  let newData = [...data, { firstName: 'Bilbo', lastName: 'Baggins' }];
  table.rerender(<Table columns={columns} data={newData} />);

  expect(getBodyRows(table)).toHaveLength(3);
});

const columnsWithRender: ColumnType<any>[] = [
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

test('Should see custom row render HTML', () => {
  const table = render(<Table columns={columnsWithRender} data={data} />);

  expect(table.getAllByTestId('first-name')).toHaveLength(2);
});

const columnsWithColRender: ColumnType<any>[] = [
  {
    name: 'firstName',
    label: 'First Name',
    headerRender: ({ label }) => <h1 data-testid="first-name">{label}</h1>,
  },
  {
    name: 'lastName',
    label: 'Last Name',
  },
];

test('Should see custom column render HTML', () => {
  const table = render(<Table columns={columnsWithColRender} data={data} />);

  expect(table.getAllByTestId('first-name')).toHaveLength(1);
});

// to supress console error from test output
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

test('Should throw an error with invalid fields', () => {
  const columnsInvalid = [
    {
      name: 'firstName',
      label: 'First Name',
    },
    {
      name: 'lastName',
      label: 'Last Name',
    },
    {
      name: 'doesNotExist',
      label: 'Does not Exist',
    },
  ];

  expect(() =>
    render(<Table columns={columnsInvalid} data={data} />)
  ).toThrowError();
});

test('Should throw an error with invalid reducer action', () => {
  const { result } = renderHook(() => useTable(columns, data));

  expect(() =>
    // @ts-ignore
    result.current.dispatch({ type: 'DOES_NOT_EXIT' })
  ).toThrowError();
});
