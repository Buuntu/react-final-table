export type ColumnType<T> = {
  name: string;
  label?: string;
  hidden?: boolean;
  sort?: ((a: RowType<T>, b: RowType<T>) => number) | undefined;
  render?: (value: any) => React.ReactNode;
};

// this is the type saved as state and returned
export type HeaderType<T> = {
  name: string;
  label?: string;
  hidden?: boolean;
  sorted: {
    on: boolean;
    asc: boolean;
  };
  sort?: ((a: RowType<T>, b: RowType<T>) => number) | undefined;
  render?: (value: any) => React.ReactNode;
};

export type DataType = { [key: string]: any };

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

export interface RowType<T extends DataType> {
  id: number;
  cells: CellType[];
  hidden?: boolean;
  selected?: boolean;
  original: T;
}

export type CellType = {
  value: any;
  render: () => React.ReactNode;
};

export interface UseTableTypeParams<T extends DataType> {
  columns: ColumnType<T>[];
  data: T[];
  options?: {
    sortable?: boolean;
    selectable?: boolean;
    filter?: (row: RowType<T>[]) => RowType<T>[];
    filterOn?: boolean;
  };
}

export interface UseTablePropsType<T> {
  columns: ColumnType<T>[];
  data: T[];
  options?: {
    sortable?: boolean;
    selectable?: boolean;
    filter?: (row: RowType<T>[]) => RowType<T>[];
  };
}

export interface UseTableOptionsType<T> {
  sortable?: boolean;
  selectable?: boolean;
  filter?: (row: RowType<T>[]) => RowType<T>[];
}

export interface UseTableReturnType<T> {
  headers: HeaderType<T>[];
  originalRows: RowType<T>[];
  rows: RowType<T>[];
  selectedRows: RowType<T>[];
  toggleSort: (columnName: string) => void;
  selectRow: (id: number) => void;
  toggleAll: () => void;
  toggleAllState: boolean;
}

export type TableState<T extends DataType> = {
  columnsById: ColumnByIdsType;
  columns: HeaderType<T>[];
  rows: RowType<T>[];
  originalRows: RowType<T>[];
  selectedRows: RowType<T>[];
  filterOn: boolean;
  toggleAllState: boolean;
};

export type TableAction<T extends DataType> =
  | { type: 'TOGGLE_SORT'; columnName: string }
  | { type: 'SELECT_ROW'; rowId: number }
  | { type: 'GLOBAL_FILTER'; filter: (row: RowType<T>[]) => RowType<T>[] }
  | { type: 'GLOBAL_FILTER_OFF' }
  | { type: 'TOGGLE_ALL' };
