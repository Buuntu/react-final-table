// UI should look like this
/* eslinlt-disable */
// @ts-nocheck

const App = () => {
  const { rows, columns } = useTable({ columns, headers });

  return <Table columns={columns} headers={headers}></Table>;
};

type ColumnsType = { name: string; label: string }[];

const useTable = () => {
  const columns;
};
