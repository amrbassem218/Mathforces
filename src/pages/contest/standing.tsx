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
import { getStandingData, useGetStanding } from './standingDataTable';

export interface IStandingProps {
    activeTab: string;
    contest: DocumentData;
}

const Standing: React.FunctionComponent<IStandingProps> = ({activeTab, contest}) => {
    const [standing, setStanding] = useState<IuseGetStanding>();
    useEffect(() => {
        if(activeTab == "standing"){
            useGetStanding({contest}).then((data) => {setStanding(data);})
        }
    }, [activeTab, db])
  return <></>;
};

export default Standing;
