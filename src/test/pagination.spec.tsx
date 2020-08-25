import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useTable } from '../hooks';
import { makeData } from './makeData';

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
            <tr role="table-row" key={idx}>
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
  render(<Table columns={columns} data={data} />);

  const firstTen = screen.getAllByRole('table-row');
  expect(firstTen).toHaveLength(10);

  expect(screen.getByTestId('page-number')).toContainHTML('1');
  expect(screen.getByTestId('can-prev-page')).toContainHTML('no');
  expect(screen.getByTestId('can-next-page')).toContainHTML('yes');

  screen.getByText(firstTenData[0].firstName);
  screen.getByText(firstTenData[9].firstName);

  const nextPage = screen.getByTestId('next-page');
  const prevPage = screen.getByTestId('prev-page');

  fireEvent.click(nextPage);

  expect(screen.getByTestId('can-prev-page')).toContainHTML('yes');
  expect(screen.getByTestId('can-next-page')).toContainHTML('no');

  const nextTen = screen.getAllByRole('table-row');

  expect(nextTen).toHaveLength(10);

  expect(screen.getByTestId('page-number')).toContainHTML('2');

  screen.getByText(nextTenData[0].firstName);
  screen.getByText(nextTenData[9].firstName);

  fireEvent.click(prevPage);

  expect(screen.getByTestId('page-number')).toContainHTML('1');

  expect(nextTen).toHaveLength(10);

  // on page 1, clicking previous should do nothing
  fireEvent.click(prevPage);

  expect(screen.getByTestId('page-number')).toContainHTML('1');
});
