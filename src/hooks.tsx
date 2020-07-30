import { useMemo, useReducer } from 'react';
import {
  UseTableType,
  RowType,
  TableState,
  TableAction,
  ColumnType,
  ColumnByIdType,
  ColumnByIdsType,
} from 'types';

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
  const columnsById: ColumnByIdsType = useMemo(() => getColumnsById(columns), [
    columns,
  ]);

  const tableData: RowType[] = useMemo(() => {
    const sortedData = sortDataInOrder(data, columns);

    return sortedData.map(row => {
      return {
        cells: Object.entries(row).map(([column, value]) => {
          return {
            field: column,
            value: value,
            render: makeRender(value, columnsById[column], row),
          };
        }),
      };
    });
  }, [data, columns]);

  const [state] = useReducer(reducer, { columns: columns, rows: tableData });

  return {
    headers: state.columns,
    rows: state.rows,
    reducer,
  };
};

const makeRender = (value: any, column: ColumnByIdType, row: Object) => {
  if (column.render) {
    return () => column.render({ row, value });
  }
  return () => value;
};

const sortDataInOrder = (data: Object[], columns: ColumnType[]): Object[] => {
  return data.map((row: any) => {
    const newRow: any = {};
    columns.forEach(column => {
      if (!(column.name in row)) {
        throw new Error(`Invalid row data, ${column.name} not found`);
      }
      newRow[column.name] = row[column.name];
    });
    return newRow;
  });
};

const getColumnsById = (columns: ColumnType[]): ColumnByIdsType => {
  const columnsById: ColumnByIdsType = {};
  columns.forEach(column => {
    const col: any = {
      label: column.label,
    };
    if (column.render) {
      col['render'] = column.render;
    }
    columnsById[column.name] = col;
  });

  return columnsById;
};
