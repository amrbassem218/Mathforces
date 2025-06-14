import { renderComponent } from '@/components/KatexRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { collection, doc, DocumentData, getDoc, getDocs, setDoc } from 'firebase/firestore';
import 'katex/dist/katex.min.css';
import * as React from 'react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { lineDescription } from 'types';
import { auth, db } from '../../../firebaseConfig';
import Error from '../error';
import Countdown from 'react-countdown';
import {contestEndTime, ended} from "../../../utilities"
import { User } from 'firebase/auth';
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
} from "@/components/ui/alert-dialog"
interface problemInputAnswer {
    answer: string | null;
    verdict: boolean | null;
    submitted: boolean;
}
// interface IcontestProps {
//     registrationStatus: string;
// }
const Contest: React.FunctionComponent = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const {id, registrationStatus} = useParams<{id: string, registrationStatus: string}>();
    const [contest, setContest] = useState<DocumentData | null>(null);
    const [problems, setProblems] = useState<DocumentData[] | null>(null);
    const [contestLoadError, setContestLoadError] = useState(false);
    const [inputAnswers, setInputAnswers] = useState<Record<string,problemInputAnswer>>({});
    const [contestId, setContestId] = useState<string>("");
    const activeTabStyle = "data-[state=active]:bg-primary data-[state=active]:text-lavender data-[state=active]:rounded-md";
    const activeProblemStyle = "data-[state=active]:bg-primary data-[state=active]:text-lavender";
    const [contestEnded, setContestEnded] = useState<boolean>(false);
    const [popUp, setPopUp] = useState(false);
    const handleInputAnswerChange = async(attr: string, value: string | boolean, problem: DocumentData) => {
        if(user){
            setInputAnswers(prev => ({
                ...prev,
                [problem.name]: {
                    ...prev[problem.name],
                    [attr]: value
                }
            }));
            // await setDoc(doc(db, "users", user.uid, "contests", ))
        }
    };

    const verdict = useCallback((problem: DocumentData) => {  
        // console.log(inputAnswers);
        return inputAnswers[problem.name]?.verdict;
    }, [inputAnswers]);
    
    const problemStatuses = useMemo(() => {
        if (!problems) return {};
        return problems.reduce((acc, problem) => {
            acc[problem.name] =verdict(problem);
            return acc;
        }, {} as Record<string, boolean | null>);
    }, [problems, verdict, inputAnswers]);

    useEffect(() => {
        if(db && id) {
            if(!contestId) {
                const getContest = async() => {
                    const contestsSnap = await getDocs(collection(db, "contests"));
                    contestsSnap.forEach((contest) => {
                        const contestData = contest.data();
                        if(contestData.id === id) {
                            setContestId(id);
                            setContestEnded(ended(contest));
                        }
                    });
                };
                getContest();
            } else {
                const getProblems = async() => {
                    if(!contestId) {
                        setContestLoadError(true);
                        return;
                    }
                    const contestRef = doc(db, "contests", contestId);
                    const contestSnap = await getDoc(contestRef);
                    if(contestSnap.exists()) {
                        setContest(contestSnap.data());
                        const problemsSnap = await getDocs(collection(contestRef, "problems"));
                        const arr: DocumentData[] = [];
                        const initialAnswers: Record<string, problemInputAnswer> = {};
                        problemsSnap.forEach(async(problem) => {
                            const problemData = problem.data();
                            arr.push(problemData);
                            initialAnswers[problemData.name] = { answer: "", submitted: false,  verdict: null};
                        });
                        setProblems(arr);
                        setInputAnswers(initialAnswers);
                        return {problems: arr, contest: contestSnap.data(), initalAnswers: initialAnswers};
                    } else {
                        setContestLoadError(true);
                        return {};
                    }
                };
                getProblems().then((props) => {
                    if(registrationStatus == "none" && user && props?.initalAnswers){
                        const getAnswered = async() => {
                            const officialContestData = await getDocs(collection(db, "users", user.uid, "contests", props.contest.id, "answered"));
                            const unOfficialContestData = await getDocs(collection(db, "users", user.uid, "unofficialContests", props.contest.id, "answered"));
                            let userAnswers = props.initalAnswers;
                            console.log(userAnswers);
                            officialContestData.forEach((problem: DocumentData) => {
                                console.log(problem.id);
                            })
                            officialContestData.forEach((problem: DocumentData) => {
                                let problemData = problem.data();
                                console.log("data: ", userAnswers[problem.id]);
                                if(!userAnswers[problem.id].verdict){
                                    userAnswers = {...userAnswers, [problem.id]: {answer: problemData.answer, submitted: true, verdict: problemData.verdict}}
                                }
                            })
                            unOfficialContestData.forEach((problem: DocumentData) => {
                                let problemData = problem.data();
                                if(!userAnswers[problem.id].verdict){
                                    userAnswers = {...userAnswers, [problem.id]: {answer: problemData.answer, submitted: true, verdict: problemData.verdict}}
                                }
                            })
                            console.log(userAnswers);
                            setInputAnswers(userAnswers);
                        }
                        getAnswered();
                    }
                })
            }
        }
    }, [contestId, db, id]);

    if(loading || !problems || !contest) {
        return <div>loading...</div>;
    }
    if(contestLoadError) {
        return <Error/>;
    }
    if(!user) {
        navigate('/login');
        return;
    }    
    const handleProblemSubmit = (problem: DocumentData) => {
        const problemInput = document.getElementById(`${problem.name}-answer`) as HTMLInputElement;
        if(problemInput ){
            if(contest && ended(contest)) {
                if(problem.answer == problemInput.value) {
                    handleInputAnswerChange("verdict", true, problem);
                } else {
                    handleInputAnswerChange("verdict", false, problem);
                }
            }
            handleInputAnswerChange("submitted", true, problem);
            if(registrationStatus == "official"){
                setDoc(doc(db, "users", user.uid, "contests", contest.id, "answered", problem.name), {
                    answer: problemInput.value,
                })
            }
            else{
                setDoc(doc(db, "users", user.uid, "unofficialContests", contest.id, "answered", problem.name), {
                    answer: problemInput.value,
                })
            }
        }
    };
    const handleContestEnd = async(contest: DocumentData) => {
        setContestEnded(true);
        setPopUp(true);
        // console.log("doesn't happen")
        const collectionName = registrationStatus == "official" ? "contests" : registrationStatus == "unofficial" ? "unofficialContests" : "";
        if(!collectionName) return;
        const correctAnswers = await getDocs(collection(db, "contests", contest.id, "problems"));
        let userAnswers = inputAnswers;
        correctAnswers.forEach((problem) => {
            let problemData = problem.data();
            userAnswers = {...userAnswers, [problemData.name]: {...userAnswers[problemData.name], verdict: (problemData.answer == userAnswers[problemData.name].answer)}}
        })
        // console.log("outside");
        problems.forEach(async(problem) => {
            // console.log("it happens");
            // console.log(userAnswers[problem.name].answer, " : ", userAnswers[problem.name].verdict)
            await setDoc(doc(db, "users", user.uid, collectionName, contest.id, "answered", problem.name), {
                answer: userAnswers[problem.name].answer,
                verdict: userAnswers[problem.name].verdict
            })
        })
        setInputAnswers(userAnswers);
    }
    if(ended(contest) && registrationStatus != "none"){
        navigate(`/contest/${id}/none`);
    }
    return (
        <>
        <Header login={"full"} signup={"outline"}/>
        <div className='flex flex-col h-screen'>
            {popUp && <AlertDialog open={popUp} onOpenChange={setPopUp}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Contest has ended</AlertDialogTitle>
                    <AlertDialogDescription>
                        This was such a wonderful performance there. A note from contest Writer: "Contest wasn't easy was it?"
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Review</AlertDialogCancel>
                    <AlertDialogAction onClick={() => window.location.reload()}>See Standing</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>}
            <Tabs defaultValue="problems" className="mx-10 flex-1 flex flex-col mt-15 items-center">
                <TabsList className="grid w-3xl grid-cols-4 h-10 max-h-20 border-2 border-border rounded-md p-1 mb-6">
                    <TabsTrigger value="problems" className={activeTabStyle}>Problems</TabsTrigger>
                    <TabsTrigger value="standing" className={activeTabStyle}>Standing</TabsTrigger>
                    <TabsTrigger value="editorials" className={activeTabStyle}>Editorials</TabsTrigger>
                    <TabsTrigger value="support" className={activeTabStyle}>Support</TabsTrigger>
                </TabsList>
                <TabsContent value="problems" className='w-full'>
                    <Tabs defaultValue={problems[0].name} className="w-full">
                        <div className='grid grid-cols-12'>
                            <div className='col-span-1'>
                                <TabsList className='flex flex-col gap-2'>
                                    {problems.map((problem) =>( 
                                        <TabsTrigger key={problem.name} value={problem.name} className={`${activeProblemStyle} rounded-full w-12 h-12 border-border border-1 font-bold text-text/55
                                        ${problemStatuses[problem.name] === true ? "bg-green-300" :
                                            problemStatuses[problem.name] === false ? "bg-red-300" : 
                                            inputAnswers[problem.name].submitted ? "bg-text/50" : ""}
                                        `}>
                                            {problem.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <div className='col-span-7'>
                                {problems.map((problem) =>(
                                    <TabsContent key={problem.name} value={problem.name}>
                                        <h1 className='text-2xl font-semibold mb-2'>Problem {problem.name}</h1>
                                        <div className='flex flex-col gap-15'>
                                            <Card className='border-border'>
                                                <CardContent className='text-lg/8 w-full max-w-full'>
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                                        <>
                                                        {problem.description.map((e: lineDescription, i: number) => {
                                                            return renderComponent({lineDescription: e, key: i.toString()});
                                                        })}
                                                        </>
                                                    </div>
                                                    <form onSubmit={(e) => {e.preventDefault(); return  handleProblemSubmit(problem)}} className='flex items-center gap-2 m-3 mt-7'>
                                                        <Input 
                                                            type="text" 
                                                            id={`${problem.name}-answer`} 
                                                            placeholder='Enter Your Answer' 
                                                            value={inputAnswers[problem.name]?.answer || ""} 
                                                            className="w-96" 
                                                            onChange={(e) => handleInputAnswerChange("answer", e.target.value, problem)}
                                                        />
                                                        <Button type="submit" className="col-span-2">Submit</Button>
                                                    </form>
                                                </CardContent>
                                            </Card>
                                            
                                            {problemStatuses[problem.name] === true ?
                                                <Card className='border-green-400'>
                                                    <CardTitle className='font-bold text-green-600 text-2xl'>Correct Answer</CardTitle>
                                                    <CardContent>
                                                        <h2>Explanation:</h2>
                                                        <p>{problem.editorial}</p>
                                                    </CardContent>
                                                </Card>
                                            : problemStatuses[problem.name] === false ? 
                                                <Card className='border-red-400'>
                                                    <CardTitle className='font-bold text-red-600 text-2xl'>Wrong Answer</CardTitle>
                                                    <CardContent>
                                                        <h2>Try once more</h2>
                                                        <p>or see the editorial</p>
                                                    </CardContent>
                                                </Card>
                                            : null}
                                        </div>
                                    </TabsContent>
                                ))}
                            </div>
                            <div className='col-span-4 border-2 border-black'>
                                <div>
                                    <p>
                                        {!ended(contest) ? <Countdown date={contestEndTime(contest)} onComplete={() => handleContestEnd(contest)} renderer={({hours, minutes, seconds, completed}) => 
                                        completed ? <p>Time's up!!</p> : ` ${String(hours).padStart(2, '0')}:
                                                                        ${String(minutes).padStart(2, '0')}:
                                                                        ${String(seconds).padStart(2, '0')}`
                                         }/> : "Time's up"}
                                    
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </TabsContent>
                <TabsContent value="standing" className='w-full'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Standing</CardTitle>
                            <CardDescription>
                                Standing includes trusted participants at the time of contest.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p>Nobody at contest</p>
                        </CardContent>
                        <CardFooter>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        </>
    );
};
export default Contest;