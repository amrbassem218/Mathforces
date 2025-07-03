import Header from "@/components/ui/Header";
import * as React from "react";
import ProblemSetTable from "./problemsetTable";
import SideBar from "@/components/sidebar/sideBar";
import useSetTitle from "../../../utilities";

interface IProblemSetProps {}

const ProblemSet: React.FunctionComponent<IProblemSetProps> = (props) => {
  useSetTitle("problemset")
  return (
    <div className="flex flex-col gap-5">
      <Header page="problemset"/>
      {/* <div className="flex justify-center">
      </div> */}
      <div className="flex justify-around">
        <div className="w-150 ">
          <ProblemSetTable />
        </div>
        <div className="w-80 ">
          <SideBar align="items-center"/>
        </div>
      </div>
    </div>
  );
};

export default ProblemSet;
