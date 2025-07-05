import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import * as React from "react";
import { useState } from "react";
import { IuserRanking } from "types";
import { useGetRanking } from "./rankingDataTable";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {IoIosPodium} from "react-icons/io"
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface IRankingProps {
  size: number;
  full: boolean;
  remove?: Function;
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const RankingTable: React.FunctionComponent<IRankingProps> = ({size, full, remove}) => {
  const { data, columns } = useGetRanking();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: size,
  });
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
  });
  return (
    <div className="w-full max-w-200 flex flex-col gap-3">
      {full &&
      <div>
        <Input
          placeholder="Filter username.."
          value={
            (table.getColumn("username")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("username")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
      </div>
      }
      <div className="border-1 border-border rounded-md overflow-hidden">
        {!full &&
        <div className="flex justify-between w-full px-4 items-center py-2">
          <div className="flex gap-2 items-center">
            <IoIosPodium size={24}/>
            <h1 className="text-lg font-semibold text-left">Ranking</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <MoreHorizontal className="cursor-pointer "/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 bg-background rounded-md border-2 border-border" align="start">
              <DropdownMenuLabel className="font-semibold">Ranking</DropdownMenuLabel>
              <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/ranking')} className="hover:bg-gray-300 cursor-pointer">see more</DropdownMenuItem>
              <DropdownMenuItem onClick={() => remove ? remove() : ''} className="text-accent font-medium rounded-sm cursor-pointer hover:bg-accent hover:text-lavender">remove this</DropdownMenuItem>
              {/* <DropdownMenuItem className="px-2"><Button variant={'ghost'} className="w-full flex justify-start p-0 m-0">Remove this</Button></DropdownMenuItem> */}
            </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>  
        }
        <Table className="">
          <TableHeader className="w-full">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="table_element font-semibold text-base"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((rowCell) => (
                    <TableCell key={rowCell.id} className="table_element">
                      {flexRender(
                        rowCell.column.columnDef.cell,
                        rowCell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-center" colSpan={columns.length}>
                  No result
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {full &&
      <div className="flex items-center justify-between w-full px-4">
        <div className="text-muted-foreground  text-sm">
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}{" "}
          page(s).
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
      }
    </div>
  );
};

export default RankingTable;
