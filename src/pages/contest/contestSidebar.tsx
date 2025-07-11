import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LimitBlur from "@/components/ui/limitBlur";
import * as React from "react";
import { contestEndTime, ended, formattedRule } from "../../../utilities";
import { BookText } from "lucide-react";
import Countdown from "react-countdown";
import { DocumentData } from "firebase/firestore";
import Bookmark from "@/components/sidebar/bookmark";

interface ISideBarProps {
  contest: DocumentData;
  handleContestEnd: (contest: DocumentData) => Promise<void>;
}

const ContestSideBar: React.FunctionComponent<ISideBarProps> = ({
  contest,
  handleContestEnd,
}) => {
  const guidelines = [
    "Round up to the nearest **1/100th**",
    "If there are multiple answers write **all** of them seperated by a **space**",
    "Use period as the decimal point. **DO NOT** use commas",
    "**DO NOT** use commas to seperate between any count of numbers",
    "If the solution contains a greek letter, a symbol other than period **DO NOT** add them",
  ];

  const guidelinesElement = (
    <ul className="list-disc mx-6">
      {guidelines.map((rule, i) => (
        <li className="rule text-left" key={i}>
          {formattedRule(rule)}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="flex flex-col gap-5">
      {/* The Submission Manual */}
      <Card className="border-border bg-primary/60 gap-0 flex flex-col p-0">
        <CardHeader className="flex gap-2 items-center p-0 ml-2 mb-2 mt-4">
          <BookText size={27} />
          <CardTitle className="text-xl text-left ">
            Submission Manual
          </CardTitle>
        </CardHeader>
        <div className="flex-grow mb-1">
          <LimitBlur
            content={guidelinesElement}
            height="h-25"
            fromColor="from-primary/70"
            toColor="to-transparent"
            buttonStyle="text-red-500 font-bold "
            buttonPlacement="bottom-[-0.75rem] w-full"
            key={"rules"}
          />
        </div>
      </Card>
      {/* The Contest Timer */}
      <Card className="border-border pt-1 gap-0">
        <CardHeader className="text-xl font-semibold flex justify-center items-center my-1">
          {contest.name}
        </CardHeader>
        <div className="h-[1px] bg-border w-full" />
        <div className="mt-4">
          <h2 className="text-text/70 font-medium text-xl">
            {!ended(contest) ? (
              <Countdown
                date={contestEndTime(contest)}
                onComplete={() => handleContestEnd(contest)}
                renderer={({ hours, minutes, seconds, completed }) =>
                  completed ? (
                    `Time's up!!`
                  ) : (
                    <>
                      {String(hours).padStart(2, "0")}:
                      {String(minutes).padStart(2, "0")}:
                      {String(seconds).padStart(2, "0")} <br /> Remaining
                    </>
                  )
                }
              />
            ) : (
              "Time's up"
            )}
          </h2>
        </div>
      </Card>
      {/* Calculator */}
      <Card className="border-border h-120 flex justify-center items-center">
        <h2 className="font-semibold text-lg">Calculator Placeholder</h2>
      </Card>
      <div className="w-full">
        <Bookmark/>
      </div>
    </div>
  );
};

export default ContestSideBar;
