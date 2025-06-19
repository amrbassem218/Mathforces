import { ColumnDef, Row } from "@tanstack/react-table";
import { db } from "../../../firebaseConfig";
import * as React from "react";
import { collection, doc, DocumentData, getDoc, getDocs } from "firebase/firestore";
import { IgetStandingData, IproblemStanding, userPerformace } from "../../../types";
import { isRunnning } from "../../../utilities";
import { useEffect, useState } from "react";

export const getStandingData = async({contest}: {contest: DocumentData}) => {
    let standingData: userPerformace[] = [];
    const standing = await getDocs(collection(db, "contests", contest.id, "standing"))
    let problemsList: string[] = [];
    const problemsSnap = await getDocs(collection(db, "contests", contest.id, "problems"));
    problemsSnap.forEach((problem) => {
        problemsList.push(problem.id);
    })
    const standingDataPromise = await Promise.all(
        standing.docs.map(async (user) => {
            const userStandingData = user.data();
            const userProblemSolvedSnap = await getDocs(collection(db, "users", user.id, `${userStandingData.registrationMode}Contests`, contest.id, "answered"));
            let userProblemSolved: Record<string, IproblemStanding> = {};
            let totalScore = 0;
            let username = (await getDoc(doc(db, "users", user.id))).data()?.username;
            if(isRunnning(contest, user.id)){
                
            }
            userProblemSolvedSnap.forEach((problemSolved) => {
                const problemSolvedData = problemSolved.data();
                userProblemSolved[problemSolved.id] = {
                    answer: problemSolvedData.answer,
                    verdict: problemSolvedData.verdict,
                    timeAnswered: problemSolvedData.timeAnswered,
                }
                // let dateAnswered = problemSolvedData.timeAnswered.getTime() - contest.date.getTime();
                // let timeAnsweredInHours = dateAnswered / 1000 / 60 / 60;  
                // totalScore += ((10*(problemSolvedData.verdict ? 1 : -1)) / timeAnsweredInHours);
            })
            let userStandingPerformance: userPerformace = {
                username: username,
                registrationMode: userStandingData.registrationMode,
                userId: user.id,
                problems: userProblemSolved,
                total: 0,
            }
            return userStandingPerformance;
        })
    );
    standingData = standingDataPromise;
    return {standingData, problemsList};
}
export const getColumns = ({standingData, problemsList}: IgetStandingData): ColumnDef<userPerformace>[] => {
    return [
        {
            id: "rank",
            header: () => (<p className="text-center">#</p>),
            cell: ({row}) => (
                <p>{row.index}</p>
            ),
            footer: `${standingData.length}`,
            enableHiding: false,
            enableSorting: false
        },
        {
            accessorKey: "username",
            header: () => (<p className="text-center">username</p>),
            cell: ({row}) => (
                <h2 className="text-center font-medium">{row.getValue("username")}</h2>
            )
        },
        ...problemsList.map((problem) => (
            {
                id: problem,
                header: () => (<p className="text-center">{problem}</p>),
                cell:({row}: {row: Row<userPerformace>}) => {
                    const rowData = row.original as userPerformace;
                    const problemData = rowData.problems[problem];
                    return (<p className={`text-center ${problemData?.verdict == true ? "text-green-600" : problemData?.verdict == false ? "text-red-600" : ""}`}>{problemData?.answer ?? ""}</p>)
                }
                
            }
        )),
        {
            id: "total",
            accessorKey: "total",
            header:  () => (<p className="text-center">Total</p>),
            cell: ({row}) => (
                <h2>{row.getValue("total")}</h2>
            )
        }
        ]
} 

export const useGetStanding = ({contest} : {contest:DocumentData}) => {
    const [data, setData] = useState<IgetStandingData>({standingData: [], problemsList: []});
    const [columns, setColumns] = useState<ColumnDef<userPerformace>[]>([]);
    useEffect(() => {
        getStandingData({contest}).then((props) => {
            setData(props);
            console.log(props.problemsList);
            setColumns(getColumns(props))
        })
    }, [])
    return {data, columns};
}