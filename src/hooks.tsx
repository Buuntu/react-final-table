import { useMemo, useReducer, useEffect, ReactNode } from 'react';

import {
  ColumnByNamesType,
  ColumnType,
  TableState,
  TableAction,
  DataType,
  UseTableReturnType,
  UseTableOptionsType,
  RowType,
  HeaderType,
  HeaderRenderType,
  ColumnStateType,
} from './types';
import { byTextAscending, byTextDescending } from './utils';

const createReducer = <T extends DataType>() => (
  state: TableState<T>,
  action: TableAction<T>
): TableState<T> => {
  switch (action.type) {
    case 'TOGGLE_SORT':
      if (!(action.columnName in state.columnsByName)) {
        throw new Error(`Invalid column, ${action.columnName} not found`);
      }

      let isAscending = null;

      let sortedRows: RowType<T>[] = [];

      // loop through all columns and set the sort parameter to off unless
      // it's the specified column (only one column at a time for )
      const columnCopy = state.columns.map(column => {
        // if the row was found
        if (action.columnName === column.name) {
          isAscending = column.sorted.asc;
          if (column.sort) {
            sortedRows = isAscending
              ? state.rows.sort(column.sort)
              : state.rows.sort(column.sort).reverse();
            // default to sort by string
          } else {
            sortedRows = isAscending
              ? state.rows.sort(
                  byTextAscending(object => object.original[action.columnName])
                )
              : state.rows.sort(
                  byTextDescending(object => object.original[action.columnName])
                );
          }
          return {
            ...column,
            sorted: {
              on: true,
              asc: !column.sorted.asc,
            },
          };
        }
        return {
          ...column,
          sorted: {
            on: false,
            asc: true,
          },
        };
      });

      return {
        ...state,
        columns: columnCopy,
        rows: sortedRows,
        columnsByName: getColumnsByName(columnCopy),
      };
    case 'GLOBAL_FILTER':
      const filteredRows = action.filter(state.originalRows);
      const selectedRowsById: { [key: number]: boolean } = {};
      state.selectedRows.map(row => {
        selectedRowsById[row.id] = row.selected ? true : false;
      });

      return {
        ...state,
        rows: filteredRows.map(row => {
          return selectedRowsById[row.id]
            ? { ...row, selected: selectedRowsById[row.id] }
            : { ...row };
        }),
        filterOn: true,
      };
    case 'GLOBAL_FILTER_OFF':
      const ogRows = [...state.originalRows];
      const selRows: { [key: number]: boolean } = {};
      state.selectedRows.map(row => {
        selRows[row.id] = row.selected ? true : false;
      });

      return {
        ...state,
        filterOn: false,
        toggleAllState: false,
        rows: ogRows.map(row => {
          return selRows[row.id]
            ? { ...row, selected: selectedRowsById[row.id] }
            : { ...row };
        }),
      };
    case 'SELECT_ROW':
      const stateCopy = { ...state };

      stateCopy.rows = stateCopy.rows.map(row => {
        const newRow = { ...row };
        if (newRow.id === action.rowId) {
          newRow.selected = !newRow.selected;
        }
        return newRow;
      });

      stateCopy.originalRows = stateCopy.originalRows.map(row => {
        const newRow = { ...row };
        if (newRow.id === action.rowId) {
          newRow.selected = !newRow.selected;
        }
        return newRow;
      });

      stateCopy.selectedRows = stateCopy.originalRows.filter(
        row => row.selected === true
      );

      stateCopy.toggleAllState =
        stateCopy.selectedRows.length === stateCopy.rows.length
          ? (stateCopy.toggleAllState = true)
          : (stateCopy.toggleAllState = false);

      return stateCopy;
    case 'TOGGLE_ALL':
      const stateCopyToggle = { ...state };
      const rowIds: { [key: number]: boolean } = {};

      if (state.selectedRows.length < state.rows.length) {
        stateCopyToggle.rows = stateCopyToggle.rows.map(row => {
          rowIds[row.id] = true;
          return { ...row, selected: true };
        });

        stateCopyToggle.toggleAllState = true;
      } else {
        stateCopyToggle.rows = stateCopyToggle.rows.map(row => {
          rowIds[row.id] = false;

          return { ...row, selected: false };
        });
        stateCopyToggle.toggleAllState = false;
      }

      stateCopyToggle.originalRows = stateCopyToggle.originalRows.map(row => {
        return row.id in rowIds
          ? { ...row, selected: rowIds[row.id] }
          : { ...row };
      });

      stateCopyToggle.selectedRows = stateCopyToggle.originalRows.filter(
        row => row.selected
      );

      return stateCopyToggle;
    default:
      return state;
  }
};

export const useTable = <T extends DataType>(
  columns: ColumnType<T>[],
  data: T[],
  options?: UseTableOptionsType<T>
): UseTableReturnType<T> => {
  const columnsWithSorting: ColumnStateType<T>[] = useMemo(
    () =>
      columns.map(column => {
        return {
          ...column,
          label: column.label ? column.label : column.name,
          hidden: column.hidden ? column.hidden : false,
          sort: column.sort,
          sorted: {
            on: false,
            asc: true,
          },
        };
      }),
    [columns]
  );
  const columnsByName = useMemo(() => getColumnsByName(columnsWithSorting), [
    columnsWithSorting,
  ]);

  const tableData: RowType<T>[] = useMemo(() => {
    const sortedData = sortDataInOrder(data, columnsWithSorting);

    const newData = sortedData.map((row, idx) => {
      return {
        id: idx,
        selected: false,
        hidden: false,
        original: row,
        cells: Object.entries(row)
          .map(([column, value]) => {
            return {
              hidden: columnsByName[column].hidden,
              field: column,
              value: value,
              render: makeRender(value, columnsByName[column].render, row),
            };
          })
          .filter(cell => !cell.hidden),
      };
    });
    return newData;
  }, [data, columnsWithSorting, columnsByName]);

  const reducer = createReducer<T>();
  const [state, dispatch] = useReducer(reducer, {
    columns: columnsWithSorting,
    columnsByName: columnsByName,
    originalRows: tableData,
    rows: tableData,
    selectedRows: [],
    toggleAllState: false,
    filterOn: false,
  });

  const headers: HeaderType<T>[] = useMemo(() => {
    return [
      ...state.columns.map(column => {
        const label = column.label ? column.label : column.name;
        return {
          ...column,
          render: makeHeaderRender(label, column.headerRender),
        };
      }),
    ];
  }, [state.columns]);

  useEffect(() => {
    if (options && options.filter) {
      dispatch({ type: 'GLOBAL_FILTER', filter: options.filter });
    } else if (options && !options.filter) {
      dispatch({ type: 'GLOBAL_FILTER_OFF' });
    }
  }, [options?.filter]);

  return {
    headers: headers.filter(column => !column.hidden),
    rows: state.rows,
    originalRows: state.originalRows,
    selectedRows: state.selectedRows,
    selectRow: (rowId: number) => dispatch({ type: 'SELECT_ROW', rowId }),
    toggleAll: () => dispatch({ type: 'TOGGLE_ALL' }),
    toggleSort: (columnName: string) =>
      dispatch({ type: 'TOGGLE_SORT', columnName }),
    toggleAllState: state.toggleAllState,
  };
};

const makeRender = <T extends DataType>(
  value: any,
  render: (({ value, row }: { value: any; row: T }) => ReactNode) | undefined,
  row: T
) => {
  return render ? () => render({ row, value }) : () => value;
};

const makeHeaderRender = (
  label: string,
  render: HeaderRenderType | undefined
) => {
  return render ? () => render({ label }) : () => label;
};

const sortDataInOrder = <T extends DataType>(
  data: T[],
  columns: ColumnType<T>[]
): T[] => {
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

const getColumnsByName = <T extends DataType>(
  columns: ColumnType<T>[]
): ColumnByNamesType<T> => {
  const columnsByName: ColumnByNamesType<T> = {};
  columns.forEach(column => {
    const col: any = {
      label: column.label,
    };

    if (column.render) {
      col['render'] = column.render;
    }
    col['hidden'] = column.hidden;
    columnsByName[column.name] = col;
  });

  return columnsByName;
};
