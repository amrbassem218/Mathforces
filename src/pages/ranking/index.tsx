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
import SideBar from "@/components/sidebar/sideBar";
import useSetTitle from "../../../utilities";

interface IRankingProps {}

const Ranking: React.FunctionComponent<IRankingProps> = (props) => {
  useSetTitle("ranking")
  return (
    <div className="flex flex-col gap-5">
      <Header  />
      {/* <div className="w-full flex justify-center">
      </div> */}
      <div className="flex justify-around">
        <div className="w-150 ">
          <RankingTable size={20} full={true}/>
        </div>
        <div className="w-80 ">
          <SideBar align="items-center"/>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
