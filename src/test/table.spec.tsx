import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTable } from '../hooks';
import { ColumnType } from '../types';

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

  // to supress console error from test output
  console.error = jest.fn();
  expect(() =>
    render(<Table columns={columnsInvalid} data={data} />)
  ).toThrowError();

  expect(console.error).toHaveBeenCalled();
});
