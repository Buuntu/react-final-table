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
import { byTextAscending } from './utils';

const createReducer = <T extends DataType>() => (
  state: TableState<T>,
  action: TableAction<T>
): TableState<T> => {
  //result rows come from the original in the following order:
  //originalRows -> sortedRows -> filteredRows -> searchedRows -> paginatedRows
  if (
    action.type === 'GLOBAL_FILTER' ||
    action.type === 'GLOBAL_FILTER_OFF' ||
    action.type === 'SEARCH_STRING' ||
    action.type === 'TOGGLE_SORT' ||
    action.type === 'SET_ROWS'
  ) {
    let newState =
      action.type === 'SET_ROWS'
        ? { ...state, rows: [...action.data], originalRows: [...action.data] }
        : {
            ...state,
            rows: [...state.originalRows],
            originalRows: [...state.originalRows],
          };
    // sorting
    const sortedData =
      action.type === 'TOGGLE_SORT'
        ? getSortedData(
            newState.rows,
            newState.columns,
            newState.columnsByName,
            action.columnName,
            action.isAscOverride
          )
        : getSortedData(
            newState.rows,
            newState.columns,
            newState.columnsByName,
            newState.sortColumn,
            newState.columns.find(column => column.sorted.on)?.sorted.asc
          );
    newState = {
      ...newState,
      ...sortedData,
    };

    //filter
    const filteredData =
      action.type === 'GLOBAL_FILTER'
        ? getFilteredData(newState.rows, newState.selectedRows, action.filter)
        : action.type === 'GLOBAL_FILTER_OFF'
        ? getFilteredData(newState.rows, newState.selectedRows, undefined)
        : getFilteredData(
            newState.rows,
            newState.selectedRows,
            newState.filter
          );
    newState = {
      ...newState,
      ...filteredData,
    };

    //search
    const searchedData =
      action.type === 'SEARCH_STRING'
        ? getSearchedData(newState.rows, action.searchString)
        : getSearchedData(newState.rows, newState.searchString);
    newState = {
      ...newState,
      ...searchedData,
    };

    //paginate, resets to first page
    const setRowsPaginatedData = getPaginatedData(
      newState.rows,
      newState.paginationEnabled,
      newState.pagination.perPage,
      1
    );
    newState = {
      ...newState,
      ...setRowsPaginatedData,
      pagination: {
        ...newState.pagination,
        ...setRowsPaginatedData.pagination,
      },
    };

    return newState;
  } else if (action.type === 'NEXT_PAGE') {
    const nextPage = state.pagination.page + 1;
    const nextPageData = getPaginatedData(
      state.unpaginatedRows,
      state.paginationEnabled,
      state.pagination.perPage,
      nextPage
    );
    return {
      ...state,
      ...nextPageData,
      pagination: {
        ...state.pagination,
        ...nextPageData.pagination,
      },
    };
  } else if (action.type === 'PREV_PAGE') {
    const prevPage =
      state.pagination.page === 1 ? 1 : state.pagination.page - 1;
    const prevPageData = getPaginatedData(
      state.unpaginatedRows,
      state.paginationEnabled,
      state.pagination.perPage,
      prevPage
    );

    return {
      ...state,
      ...prevPageData,
      pagination: {
        ...state.pagination,
        ...prevPageData.pagination,
      },
    };
  } else if (action.type === 'SELECT_ROW') {
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

    stateCopy.selectedRows = stateCopy.originalRows.filter(row => row.selected);

    stateCopy.toggleAllState =
      stateCopy.selectedRows.length === stateCopy.rows.length;

    return stateCopy;
  } else if (action.type === 'TOGGLE_ALL') {
    const stateCopyToggle = { ...state };
    const rowIds: Record<number, boolean> = {};

    const selected = state.selectedRows.length < state.rows.length;
    stateCopyToggle.rows = stateCopyToggle.rows.map(row => {
      rowIds[row.id] = selected;
      return { ...row, selected };
    });

    stateCopyToggle.toggleAllState = selected;

    stateCopyToggle.originalRows = stateCopyToggle.originalRows.map(row => {
      return row.id in rowIds
        ? { ...row, selected: rowIds[row.id] }
        : { ...row };
    });

    stateCopyToggle.selectedRows = stateCopyToggle.originalRows.filter(
      row => row.selected
    );

    return stateCopyToggle;
  } else {
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
          label: column.label || column.name,
          hidden: !!column.hidden,
          sort: column.sort,
          sorted: {
            on: false,
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
    sortColumn: null,
    paginationEnabled: !!options?.pagination,
    pagination: {
      page: 1,
      perPage:
        typeof options?.pagination === 'number' ? options.pagination : 10,
      canNext: true,
      canPrev: false,
      nextPage: /* istanbul ignore next */ () => {},
      prevPage: /* istanbul ignore next */ () => {},
    },
    unpaginatedRows: tableData,
    filter: undefined,
    searchString: '',
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
        return {
          ...column,
          render: makeHeaderRender(column.label, column.headerRender),
        };
      }),
    ];
  }, [state.columns]);

  const filter = options?.filter;
  useEffect(() => {
    if (filter) {
      dispatch({ type: 'GLOBAL_FILTER', filter });
    }
  }, [filter]);

  return {
    headers: headers.filter(column => !column.hidden),
    rows: state.rows,
    originalRows: state.originalRows,
    selectedRows: state.selectedRows,
    dispatch,
    selectRow: (rowId: number) => dispatch({ type: 'SELECT_ROW', rowId }),
    toggleAll: () => dispatch({ type: 'TOGGLE_ALL' }),
    toggleSort: (columnName: string, isAscOverride?: boolean) =>
      dispatch({ type: 'TOGGLE_SORT', columnName, isAscOverride }),
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

const getSortedData = <T extends DataType>(
  rows: RowType<T>[],
  columns: ColumnStateType<T>[],
  columnsByName: ColumnByNamesType<T>,
  columnName: string | null,
  isAscOverride?: boolean
) => {
  //note: calling with null columnName doesn't return to unsorted, but
  //only doesn't do any more sorting
  if (columnName === null)
    return {
      rows,
    };

  if (!(columnName in columnsByName)) {
    throw new Error(`Invalid column, ${columnName} not found`);
  }

  let isAscending: boolean | null = null;

  let sortedRows: RowType<T>[] = [];

  // loop through all columns and set the sort parameter to off unless
  // it's the specified column (only one column at a time for )
  const columnCopy = columns.map(column => {
    // if the row was found
    if (columnName === column.name) {
      if (isAscOverride !== undefined) {
        // force the sort order
        isAscending = isAscOverride;
      } else {
        // if it's undefined, start by setting to ascending, otherwise toggle
        isAscending = column.sorted.asc === undefined || !column.sorted.asc;
      }

      // default to sort by string
      const columnCompareFn =
        column.sort || byTextAscending(object => object.original[columnName]);
      sortedRows = rows.sort((a, b) => {
        const result = columnCompareFn(a, b);
        return isAscending ? result : result * -1;
      });

      return {
        ...column,
        sorted: {
          on: true,
          asc: isAscending,
        },
      };
    }
    // set sorting to false for all other columns
    return {
      ...column,
      sorted: {
        on: false,
        asc: false,
      },
    };
  });

  return {
    columns: columnCopy,
    rows: sortedRows,
    sortColumn: columnName,
    columnsByName: getColumnsByName(columnCopy),
  };
};

const getFilteredData = <T extends DataType>(
  rows: RowType<T>[],
  selectedRows: RowType<T>[],
  filter?: (row: RowType<T>[]) => RowType<T>[]
) => {
  if (!filter)
    return {
      rows,
      filter,
    };
  const filteredRows = filter(rows);
  const selectedRowsById: Record<number, boolean> = {};
  selectedRows.forEach(row => {
    selectedRowsById[row.id] = !!row.selected;
  });

  const filteredRowsWithSelection = filteredRows.map(row => {
    return selectedRowsById[row.id]
      ? { ...row, selected: selectedRowsById[row.id] }
      : { ...row };
  });
  return { rows: filteredRowsWithSelection, filter };
};

const getSearchedData = <T extends DataType>(
  rows: RowType<T>[],
  searchString: string
) => {
  if (searchString === '')
    return {
      rows,
      searchString,
    };
  return {
    rows: rows.filter(
      row =>
        row.cells.filter(cell => cell.value.includes(searchString)).length > 0
    ),
    searchString,
  };
};

const getPaginatedData = <T extends DataType>(
  rows: RowType<T>[],
  enabled: boolean,
  perPage: number,
  page: number
) => {
  if (!enabled)
    return {
      rows,
      unpaginatedRows: rows,
      pagination: {},
    };
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    rows: rows.slice(start, end),
    unpaginatedRows: rows,
    pagination: {
      page,
      canNext: page * perPage < rows.length,
      canPrev: page !== 1,
    },
  };
};
