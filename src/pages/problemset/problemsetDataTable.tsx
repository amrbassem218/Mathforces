import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { db } from "../../../firebaseConfig";
import * as React from "react";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { IuserRanking, Problem } from "../../../types";
import { isRunnning, viewDate, viewTime } from "../../../utilities";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getProblemsetData = async () => {
  let problemsSnap = await getDocs(collection(db, "problemSet"));
  let problems: Problem[] = [];
  problemsSnap.forEach((problemRaw) => {
    const problemData = problemRaw.data();
    let problem: Problem = {
      name: problemData.name,
      nameFull: problemData.nameFull,
      contest: problemData.contest,
      description: problemData.description,
      difficulty: problemData.difficulty,
      ranking: 0,
      answered: problemData.answered,
    };
    problems.push(problem);
  });
  return problems;
};
const getproblemsetColumns = (problems: Problem[]): ColumnDef<Problem>[] => {
  return [
    {
      id: "ranking",
      accessorKey: "ranking",
      header: () => <p className="text-center">#</p>,
      cell: ({ row }) => <p>{row.getValue("ranking")}</p>,
      footer: `${problems.length}`,
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: () => <p className="text-center">Problem Name</p>,
      cell: ({ row }) => (
        <Button
          variant={"link"}
          className="text-purple-500 font-semibold text-center font-medium underline"
          onClick={() => location.href = (`/contest/${row.getValue('contest')}`)}
        >
          {row.getValue("name")}
        </Button>
      ),
    },
    {
      id: "difficulty",
      accessorKey: "difficulty",
      header: ({ column }) => (
        <div className="flex justify-center items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="mx-auto"
          >
            Difficulty
            <ArrowUpDown />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <h2 className="text-purple-500 font-semibold">
          {row.getValue("difficulty")}
        </h2>
      ),
      enableSorting: true,
    },
    {
      id: "answered",
      accessorKey: "answered",
      header: ({ column }) => (
        <div className="flex justify-center items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="mx-auto"
          >
            Answered
            <ArrowUpDown />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <h2 className="text-purple-500 font-semibold">
          {row.getValue("answered")}
        </h2>
      ),
      enableSorting: true,
    },
  ];
};

export const useGetProblemset = () => {
  const [data, setData] = useState<Problem[]>([]);
  const [columns, setColumns] = useState<ColumnDef<Problem>[]>([]);
  useEffect(() => {
    getProblemsetData().then((props) => {
      setData(props);
      props.sort((a, b) => {
        return b.difficulty - a.difficulty;
      });
      props.forEach((e, i) => {
        e.ranking = i + 1;
      });
      setColumns(getproblemsetColumns(props));
    });
  }, []);
  return { data, columns };
};
