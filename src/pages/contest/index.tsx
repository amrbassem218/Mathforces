import { renderComponent } from "@/components/KatexRenderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/ui/Header";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import "katex/dist/katex.min.css";
import * as React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";
import { lineDescription } from "types";
import { auth, db } from "../../../firebaseConfig";
import Error from "../error";
import Countdown from "react-countdown";
import { contestEndTime, ended, isRunnning } from "../../../utilities";
import { User } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Standing from "./standing";
import Editorials from "./editorials";
import SideBar from "./sidebar";
interface problemInputAnswer {
  answer: string | null;
  verdict: boolean | null;
  submitted: boolean;
  timeAnswered: Date | null;
}
// interface IcontestProps {
//     registrationMode: string;
// }
const Contest: React.FunctionComponent = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const { id, registrationMode } = useParams<{
    id: string;
    registrationMode: string;
  }>();
  const [contest, setContest] = useState<DocumentData | null>(null);
  const [problems, setProblems] = useState<DocumentData[] | null>(null);
  const [contestLoadError, setContestLoadError] = useState(false);
  const [inputAnswers, setInputAnswers] = useState<
    Record<string, problemInputAnswer>
  >({});
  const [contestId, setContestId] = useState<string>("");
  const activeTabStyle =
    "data-[state=active]:bg-primary data-[state=active]:text-lavender data-[state=active]:rounded-md";
  const activeProblemStyle =
    "data-[state=active]:bg-primary data-[state=active]:text-lavender";
  const [contestEnded, setContestEnded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("problems");
  const [activeProblem, setActiveProblem] = useState("");
  const [popUp, setPopUp] = useState(false);
  const handleInputAnswerChange = async (
    attr: string,
    value: any,
    problem: DocumentData,
  ) => {
    if (user) {
      setInputAnswers((prev) => ({
        ...prev,
        [problem.name]: {
          ...prev[problem.name],
          [attr]: value,
        },
      }));
      // await setDoc(doc(db, "users", user.uid, "contests", ))
    }
  };

  const verdict = useCallback(
    (problem: DocumentData) => {
      // console.log(inputAnswers);
      return inputAnswers[problem.name]?.verdict;
    },
    [inputAnswers],
  );

  const problemStatuses = useMemo(() => {
    if (!problems) return {};
    return problems.reduce(
      (acc, problem) => {
        acc[problem.name] = verdict(problem);
        return acc;
      },
      {} as Record<string, boolean | null>,
    );
  }, [problems, verdict, inputAnswers]);

  useEffect(() => {
    if (db && id) {
      if (!contestId) {
        const getContest = async () => {
          const contestsSnap = await getDocs(collection(db, "contests"));
          contestsSnap.forEach((contest) => {
            const contestData = contest.data();
            if (contestData.id === id) {
              setContestId(id);
              setContestEnded(ended(contest));
            }
          });
        };
        getContest();
      } else {
        const getProblems = async () => {
          if (!contestId) {
            setContestLoadError(true);
            return;
          }
          const contestRef = doc(db, "contests", contestId);
          const contestSnap = await getDoc(contestRef);
          if (contestSnap.exists()) {
            setContest(contestSnap.data());
            const problemsSnap = await getDocs(
              collection(contestRef, "problems"),
            );
            const arr: DocumentData[] = [];
            const initialAnswers: Record<string, problemInputAnswer> = {};
            problemsSnap.forEach(async (problem) => {
              const problemData = problem.data();
              arr.push(problemData);
              initialAnswers[problemData.name] = {
                answer: "",
                submitted: false,
                verdict: null,
                timeAnswered: null,
              };
            });
            setProblems(arr);
            setInputAnswers(initialAnswers);
            setActiveProblem(arr[0].name);
            return {
              problems: arr,
              contest: contestSnap.data(),
              initalAnswers: initialAnswers,
            };
          } else {
            setContestLoadError(true);
            return {};
          }
        };
        getProblems().then((props) => {
          if (user && props?.initalAnswers) {
            const getAnswered = async () => {
              // Commenting now to avoid confusion, but must add a feature to check answers of a certain contest
              const officialContestData = await getDocs(
                collection(
                  db,
                  "users",
                  user.uid,
                  "officialContests",
                  props.contest.id,
                  "answered",
                ),
              );
              const unOfficialContestData = await getDocs(
                collection(
                  db,
                  "users",
                  user.uid,
                  "unofficialContests",
                  props.contest.id,
                  "answered",
                ),
              );
              let userAnswers = props.initalAnswers;
              console.log(userAnswers);
              if (registrationMode == "none") {
                officialContestData.forEach((problem: DocumentData) => {
                  let problemData = problem.data();
                  if (!userAnswers[problem.id].verdict) {
                    userAnswers = {
                      ...userAnswers,
                      [problem.id]: {
                        answer: problemData.answer,
                        submitted: true,
                        verdict: problemData.verdict,
                        timeAnswered: problemData.timeAnswered,
                      },
                    };
                  }
                });
                unOfficialContestData.forEach((problem: DocumentData) => {
                  let problemData = problem.data();
                  if (!userAnswers[problem.id].verdict) {
                    userAnswers = {
                      ...userAnswers,
                      [problem.id]: {
                        answer: problemData.answer,
                        submitted: true,
                        verdict: problemData.verdict,
                        timeAnswered: problemData.timeAnswered,
                      },
                    };
                  }
                });
              } else {
                const registeredBasedAnswers =
                  registrationMode == "official"
                    ? officialContestData
                    : unOfficialContestData;
                registeredBasedAnswers.forEach((problem: DocumentData) => {
                  let problemData = problem.data();
                  if (!userAnswers[problem.id].verdict) {
                    userAnswers = {
                      ...userAnswers,
                      [problem.id]: {
                        answer: problemData.answer,
                        submitted: true,
                        verdict: problemData.verdict,
                        timeAnswered: problemData.timeAnswered,
                      },
                    };
                  }
                });
              }
              console.log(userAnswers);
              setInputAnswers(userAnswers);
            };
            getAnswered();
          }
        });
      }
    }
  }, [contestId, db, id]);
  if (loading || !problems || !contest) {
    return <div>loading...</div>;
  }
  if (contestLoadError) {
    return <Error />;
  }
  if (!user) {
    navigate("/login");
    return;
  }
  const handleProblemSubmit = (problem: DocumentData) => {
    const problemInput = document.getElementById(
      `${problem.name}-answer`,
    ) as HTMLInputElement;
    if (problemInput) {
      if (contest && ended(contest)) {
        if (problem.answer == problemInput.value) {
          handleInputAnswerChange("verdict", true, problem);
        } else {
          handleInputAnswerChange("verdict", false, problem);
        }
      }
      let problemTimeAnswered = Timestamp.now();
      handleInputAnswerChange("submitted", true, problem);
      handleInputAnswerChange("timeAnswered", problemTimeAnswered, problem);
      setDoc(
        doc(
          db,
          "users",
          user.uid,
          `${registrationMode}Contests`,
          contest.id,
          "answered",
          problem.name,
        ),
        {
          answer: problemInput.value,
          timeAnswered: problemTimeAnswered,
        },
        { merge: true },
      );
      if (isRunnning(contest)) {
        let nextProblemIndex = problems.findIndex(
          (e) => e.name == activeProblem,
        );
        nextProblemIndex++;
        if (nextProblemIndex == problems.length) {
          nextProblemIndex = 0;
        }
        setActiveProblem(problems[nextProblemIndex].name);
      }
    }
  };
  const handleContestEnd = async (contest: DocumentData) => {
    const correctAnswers = await getDocs(
      collection(db, "contests", contest.id, "problems"),
    );
    let userAnswers = inputAnswers;
    correctAnswers.forEach((problem) => {
      let problemData = problem.data();
      userAnswers = {
        ...userAnswers,
        [problemData.name]: {
          ...userAnswers[problemData.name],
          verdict: problemData.answer == userAnswers[problemData.name].answer,
        },
      };
    });
    problems.forEach(async (problem) => {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          `${registrationMode}Contests`,
          contest.id,
          "answered",
          problem.name,
        ),
        {
          verdict: userAnswers[problem.name].verdict,
        },
        { merge: true },
      );
    });
    console.log("contestEnd happend");
    setInputAnswers(userAnswers);
    await setDoc(doc(db, "contests", contest.id, "standing", user.uid), {
      registrationMode: "official",
      id: user.uid,
    });
    setContestEnded(true);
    setPopUp(true);
  };
  if (ended(contest) && registrationMode != "none") {
    navigate(`/contest/${id}/none`);
  }

  return (
    <>
      <Header login={"full"} signup={"outline"} />
      <div className="flex flex-col h-screen">
        {popUp && (
          <AlertDialog open={popUp} onOpenChange={setPopUp}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Contest has ended</AlertDialogTitle>
                <AlertDialogDescription>
                  This was such a wonderful performance there. A note from
                  contest Writer: "Contest wasn't easy was it?"
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review</AlertDialogCancel>
                <AlertDialogAction onClick={() => setActiveTab("standing")}>
                  See Standing
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mx-10 flex-1 flex flex-col mt-15 items-center"
        >
          <TabsList className="grid w-3xl grid-cols-4 h-10 max-h-20 border-2 border-border rounded-md p-1 mb-6">
            <TabsTrigger value="problems" className={activeTabStyle}>
              Problems
            </TabsTrigger>
            <TabsTrigger value="standing" className={activeTabStyle}>
              Standing
            </TabsTrigger>
            <TabsTrigger value="editorials" className={activeTabStyle}>
              Editorials
            </TabsTrigger>
            <TabsTrigger value="support" className={activeTabStyle}>
              Support
            </TabsTrigger>
          </TabsList>
          <TabsContent value="problems" className="w-full">
            <Tabs
              value={activeProblem}
              onValueChange={setActiveProblem}
              className="w-full"
            >
              <div className="grid grid-cols-12 gap-12">
                <div className="col-span-8 grid grid-cols-14">
                  <div className="col-span-2">
                    <TabsList className="flex flex-col gap-2">
                      {problems.map((problem) => (
                        <TabsTrigger
                          key={problem.name}
                          value={problem.name}
                          className={`${activeProblemStyle} rounded-full w-12 h-12 border-border border-1 font-bold text-text/55
                                            ${
                                              problemStatuses[problem.name] ===
                                              true
                                                ? "bg-green-300"
                                                : problemStatuses[
                                                      problem.name
                                                    ] === false
                                                  ? "bg-red-300"
                                                  : inputAnswers[problem.name]
                                                        .submitted
                                                    ? "bg-text/50"
                                                    : ""
                                            }
                                            `}
                        >
                          {problem.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  <div className="col-span-12">
                    {problems.map((problem) => (
                      <TabsContent key={problem.name} value={problem.name}>
                        <h1 className="text-2xl font-semibold mb-2">
                          Problem {problem.name}
                        </h1>
                        <div className="flex flex-col gap-15">
                          <Card className="border-border">
                            <CardContent className="text-lg/8 w-full max-w-full">
                              <div style={{ whiteSpace: "pre-wrap" }}>
                                <>
                                  {problem.description.map(
                                    (e: lineDescription, i: number) => {
                                      return renderComponent({
                                        lineDescription: e,
                                        key: i.toString(),
                                      });
                                    },
                                  )}
                                </>
                              </div>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  return handleProblemSubmit(problem);
                                }}
                                className="flex items-center gap-2 m-3 mt-7"
                              >
                                <Input
                                  type="text"
                                  id={`${problem.name}-answer`}
                                  placeholder="Enter Your Answer"
                                  value={
                                    inputAnswers[problem.name]?.answer || ""
                                  }
                                  autoFocus
                                  className="w-96"
                                  onChange={(e) =>
                                    handleInputAnswerChange(
                                      "answer",
                                      e.target.value,
                                      problem,
                                    )
                                  }
                                />
                                <Button type="submit" className="col-span-2">
                                  Submit
                                </Button>
                              </form>
                            </CardContent>
                          </Card>

                          {problemStatuses[problem.name] === true ? (
                            <Card className="border-green-400">
                              <CardTitle className="font-bold text-green-600 text-2xl">
                                Correct Answer
                              </CardTitle>
                              <CardContent>
                                <h2>Explanation:</h2>
                                <p>{problem.editorial}</p>
                              </CardContent>
                            </Card>
                          ) : problemStatuses[problem.name] === false ? (
                            <Card className="border-red-400">
                              <CardTitle className="font-bold text-red-600 text-2xl">
                                Wrong Answer
                              </CardTitle>
                              <CardContent>
                                <h2>Try once more</h2>
                                <p>or see the editorial</p>
                              </CardContent>
                            </Card>
                          ) : null}
                        </div>
                      </TabsContent>
                    ))}
                  </div>
                </div>
                <div className="col-span-4 ">
                  <SideBar
                    contest={contest}
                    handleContestEnd={handleContestEnd}
                  />
                </div>
              </div>
            </Tabs>
          </TabsContent>
          <TabsContent value="standing" className="w-full">
            <Card className="m-0 p-0 border-border overflow-hidden">
              <Standing activeTab={activeTab} contest={contest} />
            </Card>
          </TabsContent>
          <TabsContent value="editorials" className="w-full">
            <div className="w-full flex justify-center">
              <Editorials contest={contest} problems={problems} />
              {/* <div className='col-span-9 col-start-2'>
                        </div> */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Contest;
