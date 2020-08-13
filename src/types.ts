export type ColumnType = {
  name: string;
  label?: string;
  hidden?: boolean;
  render?: (value: any) => React.ReactNode;
};

export type ColumnByIdsType = {
  [key: string]: ColumnByIdType;
};

export type RenderFunctionType = ({
  value,
  row,
}: RenderFunctionArgsType) => React.ReactNode | undefined;

type RenderFunctionArgsType = {
  value: any;
  row: Object;
};

export type ColumnByIdType = {
  label: string;
  render: RenderFunctionType;
  hidden?: boolean;
};

export type RowType = {
  id: number;
  cells: CellType[];
  hidden?: boolean;
  selected?: boolean;
  original: Object;
};

export type CellType = {
  value: any;
  render: () => React.ReactNode;
};

export interface UseTableTypeParams<T> {
  columns: ColumnType[];
  data: T[];
  options?: {
    sortable?: boolean;
    selectable?: boolean;
    filter?: (row: RowType[]) => RowType[];
    filterOn?: boolean;
  };
}
export type UseTableType = (
  columns: ColumnType[],
  data: Object[],
  options?: {
    sortable?: boolean;
    selectable?: boolean;
    filter?: (row: RowType[]) => RowType[];
    filterOn?: boolean;
  }
) => {
  headers: ColumnType[];
  rows: RowType[];
  selectedRows: RowType[];
  filteredRows: RowType[];
  selectRow: (id: number) => void;
  toggleAll: () => void;
  toggleAllState: boolean;
};

export type TableState = {
  columns: ColumnType[];
  rows: RowType[];
  selectedRows: RowType[];
  filteredRows: RowType[];
  filterOn: boolean;
  toggleAllState: boolean;
};

export type TableAction =
  | { type: 'SORT'; column: string }
  | { type: 'SET_ROW_DATA'; data: RowType[] }
  | { type: 'SELECT_ROW'; rowId: number }
  | { type: 'GLOBAL_FILTER'; filter: (row: RowType[]) => RowType[] }
  | { type: 'GLOBAL_FILTER_OFF' }
  | { type: 'TOGGLE_ALL' };
