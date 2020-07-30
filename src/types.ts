export type ColumnType = {
  name: string;
  label: string;
  render?: (value: any) => React.ReactNode;
};

export type ColumnByIdsType = {
  [key: string]: ColumnByIdType;
};

export type ColumnByIdType = {
  label: string;
  render: ({
    value,
    row,
  }: {
    value: any;
    row: Object;
  }) => React.ReactNode | undefined;
};

export type RowType = {
  cells: CellType[];
};

export type CellType = {
  value: any;
  render: () => React.ReactNode;
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
