import { within, RenderResult } from '@testing-library/react';

export function getBodyRows<T extends RenderResult>(table: T) {
  return table.container.querySelectorAll('tbody > tr');
}

export function getRow<T extends RenderResult>(table: T, index: number) {
  const firstRow = table.getByTestId(`row-${index}`);
  return {
    baseElement: firstRow,
    ...within(firstRow),
  };
}
