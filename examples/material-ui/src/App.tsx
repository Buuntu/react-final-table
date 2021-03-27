import React, { useCallback, useState } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Grid,
  TextField,
  Button,
} from '@material-ui/core';
import { ArrowUpward, ArrowDownward } from '@material-ui/icons';
import { useTable, RowType } from 'react-final-table';

const today = new Date();
const yesterday = new Date(today);

yesterday.setDate(yesterday.getDate() - 1);

today.toDateString();
yesterday.toDateString();

const columns = [
  {
    name: 'first_name',
    label: 'First Name',
    render: ({ value }: { value: string }) => (
      <>
        <span role="img" aria-label="mage">
          🧙
        </span>
        {value}
      </>
    ),
  },
  {
    name: 'last_name',
    label: 'Last Name',
  },
  {
    name: 'date_born',
    label: 'Born',
  },
];

type DataType = { first_name: string; last_name: string; date_born: string };

const data: DataType[] = [
  {
    first_name: 'Frodo',
    last_name: 'Baggins',
    date_born: today.toDateString(),
  },
  {
    first_name: 'Samwise',
    last_name: 'Gamgee',
    date_born: yesterday.toDateString(),
  },
];

function App() {
  const [searchString, setSearchString] = useState('');

  const {
    headers,
    rows,
    selectRow,
    selectedRows,
    originalRows,
    toggleSort,
    toggleAll,
  } = useTable<DataType>(columns, data, {
    selectable: true,
    filter: useCallback(
      (rows: RowType<DataType>[]) => {
        return rows.filter(row => {
          return (
            row.cells.filter(cell => {
              if (cell.value.toLowerCase().includes(searchString)) {
                return true;
              }
              return false;
            }).length > 0
          );
        });
      },
      [searchString]
    ),
  });

  return (
    <Grid container>
      <Grid item>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length !== rows.length
                    }
                    checked={selectedRows.length === rows.length}
                    onClick={() => toggleAll()}
                  />
                </TableCell>
                {headers.map(column => (
                  <TableCell onClick={() => toggleSort(column.name)}>
                    {column.render()}{' '}
                    {column.sorted.on ? (
                      <>
                        {column.sorted.asc ? (
                          <ArrowUpward />
                        ) : (
                          <ArrowDownward />
                        )}
                      </>
                    ) : null}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={row.selected}
                      onChange={() => selectRow(row.id)}
                    />
                  </TableCell>
                  {row.cells.map(cell => (
                    <TableCell>{cell.render()}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TableContainer>
          <TableHead>
            <TableRow>
              {headers.map(column => (
                <TableCell>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedRows.map(row => {
              return (
                <TableRow>
                  <TableCell>
                    <Button onClick={() => selectRow(row.id)}>
                      Deselect Row
                    </Button>
                  </TableCell>
                  {row.cells.map(cell => {
                    return <TableCell>{cell.render()}</TableCell>;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <TextField
          variant="outlined"
          label="Search..."
          value={searchString}
          onChange={e => setSearchString(e.target.value)}
        />
        <pre>
          <code>
            {JSON.stringify({ selectedRows, originalRows, rows }, null, 2)}
          </code>
        </pre>
      </Grid>
    </Grid>
  );
}

export default App;
