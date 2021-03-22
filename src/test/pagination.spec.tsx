import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useTable } from '../index';
import { makeData } from './makeData';
import { getBodyRows } from './test-helpers';

const Table = ({
  columns,
  data,
}: {
  columns: any[];
  data: { firstName: string; lastName: string }[];
}) => {
  const { headers, rows, pagination } = useTable<{
    firstName: string;
    lastName: string;
  }>(columns, data, { pagination: true });

  return (
    <>
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
      <div>
        <button data-testid="prev-page" onClick={() => pagination.prevPage()}>
          {'<'}
        </button>
        <button data-testid="next-page" onClick={() => pagination.nextPage()}>
          {'>'}
          <label data-testid="page-number">{pagination.page}</label>
        </button>
        <div data-testid="can-next-page">
          {pagination.canNext ? 'yes' : 'no'}
        </div>
        <div data-testid="can-prev-page">
          {pagination.canPrev ? 'yes' : 'no'}
        </div>
      </div>
    </>
  );
};

test('Should render a basic table', () => {
  const { columns, data } = makeData(20);
  const firstTenData = data.slice(0, 10);
  const nextTenData = data.slice(10, 20);
  const table = render(<Table columns={columns} data={data} />);

  const firstTen = getBodyRows(table);
  expect(firstTen).toHaveLength(10);

  expect(table.getByTestId('page-number')).toContainHTML('1');
  expect(table.getByTestId('can-prev-page')).toContainHTML('no');
  expect(table.getByTestId('can-next-page')).toContainHTML('yes');

  table.getByText(firstTenData[0].firstName);
  table.getByText(firstTenData[9].firstName);

  const nextPage = table.getByTestId('next-page');
  const prevPage = table.getByTestId('prev-page');

  fireEvent.click(nextPage);

  expect(table.getByTestId('can-prev-page')).toContainHTML('yes');
  expect(table.getByTestId('can-next-page')).toContainHTML('no');

  const nextTen = getBodyRows(table);

  expect(nextTen).toHaveLength(10);

  expect(table.getByTestId('page-number')).toContainHTML('2');

  table.getByText(nextTenData[0].firstName);
  table.getByText(nextTenData[9].firstName);

  fireEvent.click(prevPage);

  expect(table.getByTestId('page-number')).toContainHTML('1');

  expect(nextTen).toHaveLength(10);

  // on page 1, clicking previous should do nothing
  fireEvent.click(prevPage);

  expect(table.getByTestId('page-number')).toContainHTML('1');
});
