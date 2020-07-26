export type ColumnType = {
  name: string;
  label: string;
};

export type RowType = {
  cells: CellType[];
};

export type CellType = {
  value: any;
};

export type UseTableType = (
  columns: ColumnType[],
  data: Object[]
) => { headers: ColumnType[]; rows: RowType[] };

export type TableState = {
  columns: ColumnType[];
  rows: RowType[];
};

export type TableAction =
  | { type: 'SORT'; column: string }
  | { type: 'SET_ROW_DATA'; data: RowType[] };
