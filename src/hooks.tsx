import { useState, useMemo } from 'react';

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

export const useTable: UseTableType = (columns, data) => {
  const [tableCols] = useState(columns);
  const tableData: RowType[] = useMemo(() => {
    return data.map(row => {
      return {
        cells: Object.entries(row).map(([column, value]) => {
          return {
            field: column,
            value: value,
          };
        }),
      };
    });
  }, [data]);

  const [rows] = useState(tableData);

  return {
    headers: tableCols,
    rows,
  };
};
