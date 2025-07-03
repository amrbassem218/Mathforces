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
import {
  IgetStandingData,
  IproblemStanding,
  userPerformace,
} from "../../../types";
import { isRunnning, viewDate, viewTime } from "../../../utilities";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const getStandingData = async ({ contest }: { contest: DocumentData }) => {
  let standingData: userPerformace[] = [];
  const standing = await getDocs(
    collection(db, "contests", contest.id, "standing"),
  );
  let problemsList: string[] = [];
  const problemsSnap = await getDocs(
    collection(db, "contests", contest.id, "problems"),
  );
  problemsSnap.forEach((problem) => {
    problemsList.push(problem.id);
  });
  const standingDataPromise = await Promise.all(
    standing.docs.map(async (user) => {
      const userStandingData = user.data();
      const userProblemSolvedSnap = await getDocs(
        collection(
          db,
          "users",
          user.id,
          `${userStandingData.registrationMode}Contests`,
          contest.id,
          "answered",
        ),
      );
      let userProblemSolved: Record<string, IproblemStanding> = {};
      
      let userData = (await getDoc(doc(db, "users", user.id))).data();
      let username = userData?.username;
      let total = (await getDoc(doc(db,"users", user.id, `${userStandingData.registrationMode}Contests`, contest.id))).data()?.total;
      userProblemSolvedSnap.forEach((problemSolved) => {
        const problemSolvedData = problemSolved.data();
        let timeAnsweredFormatted = "";
        if (problemSolvedData.timeAnswered != null) {
          let problemDateAnswered = problemSolvedData.timeAnswered.toDate();
          let contestStartDate = contest.date.toDate();
          let timeAnswered =
            problemDateAnswered.getTime() - contestStartDate.getTime();
          timeAnsweredFormatted = viewTime(timeAnswered).hoursAndMinutes;
        }
        userProblemSolved[problemSolved.id] = {
          answer: problemSolvedData.answer,
          verdict: problemSolvedData.verdict,
          timeAnswered: timeAnsweredFormatted,
        };
        timeAnsweredFormatted = "";
      });
      let userStandingPerformance: userPerformace = {
        ranking: 0,
        username: username,
        registrationMode: userStandingData.registrationMode,
        userId: user.id,
        problems: userProblemSolved,
        total: Math.round(total) ?? 0 ,
      };
      return userStandingPerformance;
    }),
  );
  standingData = standingDataPromise;
  return { standingData, problemsList };
};
const getStandingColumns = ({
  standingData,
  problemsList,
}: IgetStandingData): ColumnDef<userPerformace>[] => {
  return [
    {
      id: "ranking",
      accessorKey: "ranking",
      header: () => <p className="text-center">#</p>,
      cell: ({ row }) => <p>{row.getValue("ranking")}</p>,
      footer: `${standingData.length}`,
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "username",
      header: () => <p className="text-center">username</p>,
      cell: ({ row }) => (
        <h2 className="text-center font-medium">{row.getValue("username")}</h2>
      ),
    },
    ...problemsList.map((problem) => ({
      id: problem,
      header: ({ column }: { column: Column<userPerformace> }) => (
        <p className="text-center">{problem}</p>
        // <Button
        //     variant="ghost"
        //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        //     className="m-0 p-0 font-semibold"
        //     >
        //     {problem}
        //     <ArrowUpDown />
        // </Button>
      ),
      cell: ({ row }: { row: Row<userPerformace> }) => {
        const rowData = row.original as userPerformace;
        const problemData = rowData.problems[problem];
        console.log("from 2lb el7ds: ", problemData.timeAnswered);
        return (
          <p
            className={`text-center ${problemData?.verdict == true ? "text-green-600" : problemData?.verdict == false ? "text-red-600" : ""}`}
          >
            {problemData.timeAnswered}
          </p>
        );
      },
    })),
    {
      id: "total",
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="mx-auto"
        >
          Total
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <h2>{row.getValue("total")}</h2>,
      enableSorting: true,
    },
  ];
};

export const useGetStanding = ({ contest }: { contest: DocumentData }) => {
  const [data, setData] = useState<IgetStandingData>({
    standingData: [],
    problemsList: [],
  });
  const [columns, setColumns] = useState<ColumnDef<userPerformace>[]>([]);
  useEffect(() => {
    getStandingData({ contest }).then((props) => {
      setData(props);
      console.log(props.problemsList);
      props.standingData.sort((a, b) => {
        return b.total - a.total;
      });
      props.standingData.forEach((e, i) => {
        e.ranking = i + 1;
      });
      setColumns(getStandingColumns(props));
    });
  }, []);
  return { data, columns };
};
