import React, { FC } from 'react';
import { render, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useTable } from '../hooks';
import { makeSimpleData } from './makeData';

test('Should filter by text', async () => {
  const { columns, data } = makeSimpleData();

  const TableWithFilter: FC = () => {
    const { headers, rows, toggleSort, setSearchString } = useTable(
      columns,
      data,
      {
        sortable: true,
      }
    );

    return (
      <>
        <input
          data-testid="input"
          type="text"
          onChange={e => {
            setSearchString(e.target.value);
          }}
        ></input>
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
      </>
    );
  };

  const table = render(<TableWithFilter />);

  const input = table.getByTestId('input');

  expect(table.getAllByLabelText('row')).toHaveLength(3);

  fireEvent.change(input, { target: { value: 'Frodo' } });

  expect(table.getAllByLabelText('row')).toHaveLength(1);
  let firstRow = table.getByTestId('row-0');

  let { getByText } = within(firstRow);
  expect(getByText('Frodo')).toBeInTheDocument();

  fireEvent.change(input, { target: { value: '' } });
  await waitFor(() => {
    expect(table.getByText('Bilbo')).toBeInTheDocument();
  });
  expect(table.getAllByLabelText('row')).toHaveLength(3);

  fireEvent.change(input, { target: { value: 'Bag' } });
  expect(table.getAllByLabelText('row')).toHaveLength(2);
});
