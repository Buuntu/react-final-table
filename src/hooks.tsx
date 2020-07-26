import { useMemo, useReducer } from 'react';
import { UseTableType, RowType, TableState, TableAction } from 'types';

const reducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
    case 'SET_ROW_DATA':
      return state;
    case 'SORT':
      return state;
    default:
      return state;
  }
};

export const useTable: UseTableType = (columns, data) => {
  const tableData: RowType[] = useMemo(() => {
    const sortedData = data.map((row: any) => {
      const newRow: any = {};
      columns.forEach(column => {
        if (!(column.name in row)) {
          throw new Error(`Invalid row data, ${column.name} not found`);
        }
        newRow[column.name] = row[column.name];
      });
      return newRow;
    });

    return sortedData.map(row => {
      return {
        cells: Object.entries(row).map(([column, value]) => {
          return {
            field: column,
            value: value,
          };
        }),
      };
    });
  }, [data]);

  const [state] = useReducer(reducer, { columns: columns, rows: tableData });

  return {
    headers: state.columns,
    rows: state.rows,
  };
};
