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
    const sortedData = data.map((row: any) => {
      const newRow: any = {};
      columns.forEach(column => {
        if (!(column.name in row)) {
          throw new Error(`Invalid row data, ${column.name} not found`);
        }
        newRow[column.name] = row[column.name];
      });
      return newRow;
    });

    return sortedData.map(row => {
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
