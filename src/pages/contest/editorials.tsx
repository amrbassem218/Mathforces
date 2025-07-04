import { renderComponent } from "@/components/KatexRenderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import * as React from "react";
import { lineDescription } from "types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isRunnning } from "../../../utilities";
import LimitBlur from "@/components/ui/limitBlur";
interface EditorialsProps {
  problems: DocumentData[];
  contest: DocumentData;
}

const Editorials: React.FunctionComponent<EditorialsProps> = ({
  problems,
  contest,
}) => {
  if (!contest) {
    return <p>loading...</p>;
  }
  if (!Array.isArray(problems) || problems.length === 0) {
    return (
      <Card className="border-border max-w-240">
        <CardHeader className="space-y-1 ">
          <CardTitle className="text-2xl">Editorials</CardTitle>
          <CardDescription>
            No Editorials were provided for this contest by the author, sorry!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  console.log(problems);
  return (
    <Card className="border-border max-w-240">
      <CardHeader className="space-y-1 ">
        <CardTitle className="text-2xl">Editorials</CardTitle>
        <CardDescription>
          All editorials are provided by{" "}
          {contest?.authors
            ? contest.authors.map((author: string, i: number) => (
                <span>
                  @{author}
                  {i + 1 < contest.authors.length ? ", " : ""}
                </span>
              ))
            : "@anon"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isRunnning(contest) ? (
          <h1>Contest currently running, answer and comeback</h1>
        ) : 
        problems.length > 0 
        ? (
          problems.map((problem) => (
            <Card key={problem.name} className="border-border">
              <CardHeader className="">
                <CardTitle className="text-xl">{problem.name}</CardTitle>
                <CardDescription className="text-xs">
                  @{problem?.author ?? "anon"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LimitBlur
                  content={
                    <>
                      {
                      problem
                      ? problem.description
                      ? problem.description.map(
                        (e: lineDescription, i: number) => {
                          return renderComponent({
                            lineDescription: e,
                            key: i.toString(),
                          });
                        },
                      )
                      : <h1>No problem Description was provided for this problem</h1>
                    : <h1>problem doesn't even fricking exist</h1>}
                    </>
                  }
                  height={"h-10"}
                  key={problem.name}
                />
                <div className="text-left">
                  <h2 className="font-semibold">
                    {problem?.verdict 
                      ? `Your answer: ${(<span className="font-normal">{problem.answer}</span>)}`
                      : `No answer was given`}
                  </h2>
                  <h2 className="font-semibold">
                    Answer:{" "}
                    <span className="font-normal">{problem.answer}</span>
                  </h2>
                  <h2 className="font-semibold">Explanation: </h2>
                  {problem?.explanation && Array.isArray(problem.explanation.description) ? (
                    <>
                      {problem.explanation.description.map(
                        (e: lineDescription, i: number) =>
                          renderComponent({
                            lineDescription: e,
                            key: i.toString(),
                          }),
                      )}
                    </>
                  ) : (
                    <p>No Editorial was given for this problem</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )
        : <div>
           <h1>No Editorials were provided for this contest by the author, sorry!</h1> 
        </div> 
        }
        
      </CardContent>
    </Card>
  );
};

export default Editorials;
