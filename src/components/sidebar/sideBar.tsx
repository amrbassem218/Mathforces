import * as React from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import Ranking from "./bookmark";
import RankingTable from "../../pages/ranking/rankingTable";
import Bookmark from "./bookmark";
import Goal from "./goal";
import { useState } from "react";
interface ISideBarProps {
  align?: string;
}

const SideBar: React.FunctionComponent<ISideBarProps> = ({align}) => {
  const [removeRanking, setRemoveRanking] = useState(false);
  return (
    <div className={`flex flex-col pr-10 gap-5 w-full ${align ? align : "items-end"} my-10`}>
      <div className="w-80">
        <Goal/>
      </div>
      {
        !removeRanking &&
        <div className="w-80">
          <RankingTable size={10} full={false} remove={() => setRemoveRanking(true)}/>
        </div>
      }
      <div className="w-80">
        <Bookmark/>
      </div>
    </div>
  );
};

export default SideBar;
