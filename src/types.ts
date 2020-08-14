export type ColumnType = {
  name: string;
  label?: string;
  hidden?: boolean;
  render?: (value: any) => React.ReactNode;
};

export type HeaderType = {
  name: string;
  label?: string;
  hidden?: boolean;
  sorted: {
    on: boolean;
    asc: boolean;
  };
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

export interface UseTableTypeParams<T extends {}> {
  columns: ColumnType[];
  data: T[];
  options?: {
    sortable?: boolean;
    selectable?: boolean;
    filter?: (row: RowType[]) => RowType[];
    filterOn?: boolean;
  };
}
export interface UseTableType {
  <T extends { [key: string]: any }>(
    columns: ColumnType[],
    data: T[],
    options?: {
      sortable?: boolean;
      selectable?: boolean;
      filter?: (row: RowType[]) => RowType[];
    }
  ): {
    headers: HeaderType[];
    originalRows: RowType[];
    rows: RowType[];
    selectedRows: RowType[];
    toggleSort: (columnName: string) => void;
    selectRow: (id: number) => void;
    toggleAll: () => void;
    toggleAllState: boolean;
  };
}

export type TableState = {
  columnsById: ColumnByIdsType;
  columns: HeaderType[];
  rows: RowType[];
  originalRows: RowType[];
  selectedRows: RowType[];
  filterOn: boolean;
  toggleAllState: boolean;
};

export type TableAction =
  | { type: 'TOGGLE_SORT'; columnName: string }
  | { type: 'SELECT_ROW'; rowId: number }
  | { type: 'GLOBAL_FILTER'; filter: (row: RowType[]) => RowType[] }
  | { type: 'GLOBAL_FILTER_OFF' }
  | { type: 'TOGGLE_ALL' };
