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
    case 'SORT':
      return state;
    case 'GLOBAL_FILTER':
      const newState = {
        ...state,
        filteredRows: action.filter(state.rows),
        filterOn: true,
      };
      return newState;
    case 'GLOBAL_FILTER_OFF':
      return {
        ...state,
        filterOn: false,
        toggleAllState: false,
        filteredRows: [...state.rows],
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

      if (stateCopy.filterOn) {
        stateCopy.filteredRows = stateCopy.filteredRows.map(row => {
          const newRow = { ...row };
          if (newRow.id === action.rowId) {
            newRow.selected = !newRow.selected;
          }
          return newRow;
        });
      }

      stateCopy.selectedRows = stateCopy.rows.filter(
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
      // Only toggle filtered rows if filtering is on
      if (state.filterOn) {
        console.log('TOGGLING');
        if (state.selectedRows.length < state.filteredRows.length) {
          stateCopyToggle.filteredRows = stateCopyToggle.filteredRows.map(
            row => {
              return { ...row, selected: true };
            }
          );
          stateCopyToggle.toggleAllState = true;
        } else {
          stateCopyToggle.filteredRows = stateCopyToggle.filteredRows.map(
            row => {
              return { ...row, selected: false };
            }
          );
          stateCopyToggle.toggleAllState = false;
        }

        stateCopyToggle.selectedRows = stateCopyToggle.filteredRows.filter(
          row => row.selected
        );
        // Otherwise toggle all rows
      } else {
        // toggle on
        if (state.selectedRows.length < state.rows.length) {
          stateCopyToggle.rows = stateCopyToggle.rows.map(row => {
            row.selected = true;
            return row;
          });
          stateCopyToggle.toggleAllState = true;
        }
        // otherwise toggle off
        else {
          stateCopyToggle.rows = stateCopyToggle.rows.map(row => {
            return { ...row, selected: false };
          });
          stateCopyToggle.toggleAllState = false;
        }

        stateCopyToggle.selectedRows = stateCopyToggle.rows.filter(
          row => row.selected
        );
      }

      return stateCopyToggle;
    default:
      return state;
  }
};

export const useTable: UseTableType = (columns, data, options) => {
  const columnsById: ColumnByIdsType = useMemo(() => getColumnsById(columns), [
    columns,
  ]);

  const tableData = useMemo(() => {
    // to allow for empty data sets
    if (!data) {
      return [];
    }

    const sortedData = sortDataInOrder(data, columns);

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
  }, [data, columns, columnsById]);

  const [state, dispatch] = useReducer(reducer, {
    columns: columns,
    rows: tableData,
    selectedRows: [],
    filteredRows: [],
    toggleAllState: false,
    filterOn: false,
  });

  useEffect(() => {
    if (options && options.filterOn && options.filter) {
      dispatch({ type: 'GLOBAL_FILTER', filter: options.filter });
    } else if (options && !options.filterOn) {
      dispatch({ type: 'GLOBAL_FILTER_OFF' });
    }
    // eslint-disable-next-line
  }, [options?.filterOn, options?.filter]);

  return {
    headers: state.columns.filter(column => !column.hidden),
    rows: state.rows,
    selectedRows: state.selectedRows,
    filteredRows: state.filteredRows,
    reducer,
    selectRow: (rowId: number) => dispatch({ type: 'SELECT_ROW', rowId }),
    toggleAll: () => dispatch({ type: 'TOGGLE_ALL' }),
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
