import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTable, ColumnType } from '../hooks';

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
              <td key={idx}>{cell.value}</td>
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
