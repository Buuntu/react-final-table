import React from 'react';
import { useTable } from 'react-final-table';

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

function App() {
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
}

export default App;
