import React, { FC } from 'react';
import { render, fireEvent, within, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useTable } from '../hooks';
import { makeSimpleData } from './makeData';
import { DataType, ColumnType, RowType } from 'types';

const TableWithFilter = <T extends DataType>({
  columns,
  data,
  filter,
}: {
  columns: ColumnType<T>[];
  data: T[];
  filter: (row: RowType<T>[]) => RowType<T>[];
}) => {
  const { headers, rows } = useTable(columns, data, {
    filter,
  });

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
  const { columns, data } = makeSimpleData();
  render(
    <TableWithFilter
      columns={columns}
      data={data}
      filter={rows => {
        return rows.filter((_, idx) => idx % 2 === 0);
      }}
    />
  );

  // there are 3 total rows, so both idx=0 and idx=2 will be true
  expect(screen.getAllByTestId('table-row')).toHaveLength(2);
});

test('Should filter by text', () => {
  const { columns, data } = makeSimpleData();

  const TableWithSearch: FC = () => {
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

  const table = render(<TableWithSearch />);

  const input = table.getByTestId('input');

  expect(table.getAllByLabelText('row')).toHaveLength(3);

  fireEvent.change(input, { target: { value: 'Frodo' } });

  expect(table.getAllByLabelText('row')).toHaveLength(1);
  let firstRow = table.getByTestId('row-0');

  let { getByText } = within(firstRow);
  expect(getByText('Frodo')).toBeInTheDocument();

  fireEvent.change(input, { target: { value: '' } });
  expect(table.getByText('Bilbo')).toBeInTheDocument();
  expect(table.getAllByLabelText('row')).toHaveLength(3);

  fireEvent.change(input, { target: { value: 'Bag' } });
  expect(table.getAllByLabelText('row')).toHaveLength(2);
});
