import { useMemo, useReducer, useEffect, ReactNode, useCallback } from 'react';

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
    case 'SET_ROWS':
      if (state.paginationEnabled === true) {
        return {
          ...state,
          rows: getPaginatedData(
            action.data,
            state.pagination.perPage,
            state.pagination.page
          ),
          originalRows: action.data,
        };
      }

      return {
        ...state,
        rows: action.data,
        originalRows: action.data,
      };

    case 'NEXT_PAGE':
      const nextPage = state.pagination.page + 1;
      return {
        ...state,
        rows: getPaginatedData(
          state.originalRows,
          state.pagination.perPage,
          nextPage
        ),
        pagination: {
          ...state.pagination,
          page: nextPage,
          canNext:
            nextPage * state.pagination.perPage < state.originalRows.length,
          canPrev: nextPage !== 1,
        },
      };
    case 'PREV_PAGE':
      const prevPage =
        state.pagination.page === 1 ? 1 : state.pagination.page - 1;

      return {
        ...state,
        rows: getPaginatedData(
          state.originalRows,
          state.pagination.perPage,
          prevPage
        ),
        pagination: {
          ...state.pagination,
          page: prevPage,
          canNext:
            prevPage * state.pagination.perPage < state.originalRows.length,
          canPrev: prevPage !== 1,
        },
      };
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
    case 'SEARCH_STRING':
      const stateCopySearch = { ...state };
      stateCopySearch.rows = stateCopySearch.originalRows.filter(row => {
        return (
          row.cells.filter(cell => {
            if (cell.value.includes(action.searchString)) {
              return true;
            }
            return false;
          }).length > 0
        );
      });
      return stateCopySearch;
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
      throw new Error('Invalid reducer action');
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
    filterOn: !!options?.filter,
    paginationEnabled: !!options?.pagination,
    pagination: {
      page: 1,
      perPage: 10,
      canNext: true,
      canPrev: false,
      nextPage: () => {},
      prevPage: () => {},
    },
  });

  state.pagination.nextPage = useCallback(() => {
    dispatch({ type: 'NEXT_PAGE' });
  }, [dispatch]);
  state.pagination.prevPage = useCallback(
    () => dispatch({ type: 'PREV_PAGE' }),
    [dispatch]
  );

  useEffect(() => {
    dispatch({ type: 'SET_ROWS', data: tableData });
  }, [tableData]);

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
    }
  }, [options?.filter]);

  return {
    headers: headers.filter(column => !column.hidden),
    rows: state.rows,
    originalRows: state.originalRows,
    selectedRows: state.selectedRows,
    dispatch,
    selectRow: (rowId: number) => dispatch({ type: 'SELECT_ROW', rowId }),
    toggleAll: () => dispatch({ type: 'TOGGLE_ALL' }),
    toggleSort: (columnName: string) =>
      dispatch({ type: 'TOGGLE_SORT', columnName }),
    setSearchString: (searchString: string) =>
      dispatch({ type: 'SEARCH_STRING', searchString }),
    pagination: state.pagination,
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

const getPaginatedData = <T extends DataType>(
  rows: RowType<T>[],
  perPage: number,
  page: number
) => {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return rows.slice(start, end);
};
