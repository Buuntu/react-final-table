import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useTable } from '../hooks';

const columns = [
  {
    name: 'first_name',
    label: 'First Name',
  },
  {
    name: 'last_name',
    label: 'Last Name',
  },
];

const data = [
  {
    first_name: 'Frodo',
    last_name: 'Baggins',
  },
  {
    first_name: 'Samwise',
    last_name: 'Gamgee',
  },
];

const App = () => {
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
  const rtl = render(<App />);

  expect(rtl.getByText('Frodo')).toBeInTheDocument();
  expect(rtl.getByText('Baggins')).toBeInTheDocument();
  expect(rtl.getByText('Samwise')).toBeInTheDocument();
  expect(rtl.getByText('Gamgee')).toBeInTheDocument();
});
