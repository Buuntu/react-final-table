import { useMemo, useReducer, useEffect } from 'react';

import {
  UseTableType,
  ColumnByIdType,
  ColumnByIdsType,
  ColumnType,
  TableState,
  TableAction,
} from './types';

const reducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
    case 'TOGGLE_SORT':
      if (!(action.columnName in state.columnsById)) {
        throw new Error(`Invalid column, ${action.columnName} not found`);
      }

      const columnCopy = state.columns.map(column => {
        if (action.columnName === column.name) {
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
        columnsById: getColumnsById(columnCopy),
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

      if (stateCopy.selectedRows.length === stateCopy.rows.length) {
        stateCopy.toggleAllState = true;
      } else {
        stateCopy.toggleAllState = false;
      }

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

export const useTable: UseTableType = (columns, data, options) => {
  const columnsWithSorting = useMemo(
    () =>
      columns.map(column => {
        return {
          ...column,
          sorted: {
            on: false,
            asc: true,
          },
        };
      }),
    [columns]
  );
  const columnsById: ColumnByIdsType = useMemo(
    () => getColumnsById(columnsWithSorting),
    [columns]
  );

  const tableData = useMemo(() => {
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
              hidden: columnsById[column].hidden,
              field: column,
              value: value,
              render: makeRender(value, columnsById[column], row),
            };
          })
          .filter(cell => !cell.hidden),
      };
    });
    return newData;
  }, [data, columnsWithSorting, columnsById]);

  const [state, dispatch] = useReducer(reducer, {
    columns: columnsWithSorting,
    columnsById: columnsById,
    originalRows: tableData,
    rows: tableData,
    selectedRows: [],
    toggleAllState: false,
    filterOn: false,
  });

  useEffect(() => {
    if (options && options.filter) {
      dispatch({ type: 'GLOBAL_FILTER', filter: options.filter });
    } else if (options && !options.filter) {
      dispatch({ type: 'GLOBAL_FILTER_OFF' });
    }
    // eslint-disable-next-line
  }, [options?.filter]);

  return {
    headers: state.columns.filter(column => !column.hidden),
    rows: state.rows,
    originalRows: state.originalRows,
    selectedRows: state.selectedRows,
    reducer,
    selectRow: (rowId: number) => dispatch({ type: 'SELECT_ROW', rowId }),
    toggleAll: () => dispatch({ type: 'TOGGLE_ALL' }),
    toggleSort: (columnName: string) =>
      dispatch({ type: 'TOGGLE_SORT', columnName }),
    toggleAllState: state.toggleAllState,
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
    col['hidden'] = column.hidden;
    columnsById[column.name] = col;
  });

  return columnsById;
};
