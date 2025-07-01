import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { db } from "../../../firebaseConfig";
import * as React from "react";
import { collection, doc, DocumentData, getDoc, getDocs } from "firebase/firestore";
import {IuserRanking } from "../../../types";
import { isRunnning, viewDate, viewTime } from "../../../utilities";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const getRankingData = async() => {
    let users = await getDocs(collection(db, "users"));
    let rankingData: IuserRanking[] = [];
    users.forEach((user) => {
        const userData = user.data();
        let userRank: IuserRanking = {
            username: userData?.username ?? "anon",
            title: userData?.title ?? "Noob",
            rating: userData?.rating ?? 0,
            ranking: 0
        }
        rankingData.push(userRank);
    })
    return rankingData;
}
const getRankingColumns = (rankingData: IuserRanking[]): ColumnDef<IuserRanking>[] => {
    return [
        {
            id: "ranking",
            accessorKey: "ranking",
            header: () => (<p className="text-center">#</p>),
            cell: ({row}) => (
                <p>{row.getValue("ranking")}</p>
            ),
            footer: `${rankingData.length}`,
            enableHiding: false,
            enableSorting: false
        },
        {
            id: "username",
            accessorKey: "username",
            header: () => (<p className="text-center">username</p>),
            cell: ({row}) => (
                <h2 className="text-center font-medium">{row.getValue("username")}</h2>
            )
        },
        {
            id: "rating",
            accessorKey: "rating",
            header:  ({column}) => (
                <div className="flex justify-center items-center">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="mx-auto"
                    >
                    Ratings
                    <ArrowUpDown />
                </Button>
                </div>
            ),
            cell: ({row}) => (
                <h2>{row.getValue("rating")}</h2>
            ),
            enableSorting: true
        }
    ]
} 

export const useGetRanking = () => {
    const [data, setData] = useState<IuserRanking[]>([]);
    const [columns, setColumns] = useState<ColumnDef<IuserRanking>[]>([]);
    useEffect(() => {
        getRankingData().then((props) => {
            setData(props);
            props.sort((a,b) => {
                return b.rating - a.rating;
            })
            props.forEach((e, i) => {
                e.ranking = i + 1;
            })
            setColumns(getRankingColumns(props));
        })
    }, [])
    return {data, columns};
}