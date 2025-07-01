import { SortingState, ColumnFiltersState, VisibilityState, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender, PaginationState } from '@tanstack/react-table';
import * as React from 'react';
import { useState } from 'react';
import {IuserRanking } from 'types';
import { useGetRanking } from './rankingDataTable';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface IRankingProps {
}

const RankingTable: React.FunctionComponent<IRankingProps> = (props) => {
    const {data, columns} = useGetRanking();
    const [standing, setStanding] = useState<IuserRanking>();
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0, 
        pageSize: 20
    })
    const table = useReactTable({
    data: data,
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
    },
  })
  return (
    <div className='w-full flex flex-col gap-3'>
      <div>
        <Input
          placeholder='Search for ...'
          value={(table.getColumn("username")?.getFilterValue() as string ?? "")}
          onChange={(e) => table.getColumn("username")?.setFilterValue(e.target.value)}
          className='max-w-sm'/>
      </div>
      <div className='border-1 border-border rounded-md overflow-hidden'>
        <Table className=''>
            <TableHeader  className='w-full'>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='table_element font-semibold text-base'>
                    {
                        header.isPlaceholder
                        ? null
                        : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                        )
                    }
                    </TableHead>
                ))}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {
            table.getRowModel().rows?.length
            ? (
                table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                    {row.getVisibleCells().map((rowCell) => (
                    <TableCell key={rowCell.id} className='table_element'>
                        {flexRender(
                        rowCell.column.columnDef.cell,
                        rowCell.getContext()
                        )}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) 
            : (
                <TableRow>
                <TableCell className='text-center' colSpan={columns.length}>
                    No result
                </TableCell>
                </TableRow>
            )
            }
            </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between w-full px-4">
        <div className="text-muted-foreground  text-sm">
          {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} page(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RankingTable;
