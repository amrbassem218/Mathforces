import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import * as React from "react";
import { useState } from "react";
import { IuseGetStanding, IuserRanking } from "types";
import { useGetStanding } from "../contest/standingDataTable";
import { useGetRanking } from "./rankingDataTable";
import RankingTable from "./rankingTable";
import Header from "@/components/ui/Header";

interface IRankingProps {}

const Ranking: React.FunctionComponent<IRankingProps> = (props) => {
  return (
    <div className="flex flex-col gap-5">
      <Header login={"full"} signup={"round"} />
      <div className="grid grid-cols-12 w-full gap-5">
        <div className="col-span-6 col-start-2">
          <RankingTable />
        </div>
        <div className="col-span-5 border-1 border-border"></div>
      </div>
    </div>
  );
};

export default Ranking;
