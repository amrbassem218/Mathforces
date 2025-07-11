import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { useEffect } from "react";

export interface Problem {
  name: string;
  description: lineDescription[];
  difficulty: number;
  ranking?: number;
  answered?: number;
  nameFull?: string;
  contestId?: string;
  date?: Date;
}
export interface lineDescription {
  blockType: string;
  expression?: string;
  hasBreak?: boolean;
  children?: lineDescription[];
}
export interface Problems {
  [key: string]: Problem;
}
export interface IrenderComponent {
  lineDescription: lineDescription;
  key: string;
}
export interface IproblemStanding {
  answer: string;
  verdict: boolean | null;
  timeAnswered: string | null;
}
export interface userPerformace {
  username: string;
  userId: string;
  ranking: number;
  registrationMode: string;
  problems: {
    [key: string]: IproblemStanding;
  };
  total: number;
}
export interface IgetStandingData {
  standingData: userPerformace[];
  problemsList: string[];
}
export interface IuseGetStanding {
  data: IgetStandingData;
  columns: ColumnDef<userPerformace>[];
}
export interface IuserRanking {
  username: string;
  title: string;
  rating: number;
  ranking: number;
}
