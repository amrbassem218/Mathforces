import Header from "@/components/ui/Header";
import * as React from "react";
import ProblemSetTable from "./problemsetTable";

interface IProblemSetProps {}

const ProblemSet: React.FunctionComponent<IProblemSetProps> = (props) => {
  return (
    <div className="flex flex-col gap-5">
      <Header  />
      <div className="grid grid-cols-12 w-full gap-5">
        <div className="col-span-6 col-start-2">
          <ProblemSetTable />
        </div>
        <div className="col-span-5 border-1 border-border"></div>
      </div>
    </div>
  );
};

export default ProblemSet;
