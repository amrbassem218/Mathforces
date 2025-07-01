import { collection, doc, DocumentData, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { IproblemStanding, IuseGetStanding, userPerformace } from 'types';
import { isRunnning } from '../../../utilities';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  Row,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetStanding } from './standingDataTable';

export interface IStandingProps {
    activeTab: string;
    contest: DocumentData;
}

const Standing: React.FunctionComponent<IStandingProps> = ({activeTab, contest}) => {
    const {data, columns} = useGetStanding({contest});
    const [standing, setStanding] = useState<IuseGetStanding>();
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const table = useReactTable({
    data: data.standingData,
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })
  return (
    <div>
      <div>
        <Input
          placeholder='Search for ...'
          value={(table.getColumn("username")?.getFilterValue() as string ?? "")}
          onChange={(e) => table.getColumn("username")?.setFilterValue(e.target.value)}
          className='max-w-sm'/>
      </div>
      <Table >
        <TableHeader>
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
  );
};

export default Standing;
