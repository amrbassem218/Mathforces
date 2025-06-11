import * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../firebaseConfig';
import Header from '@/components/ui/Header';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useProblems } from "../../../texconverter";
import 'katex/dist/katex.min.css';
import { collection, doc, DocumentData, getDoc, getDocs } from 'firebase/firestore';
import Error from '../error';
import { lineDescription } from 'types';
import { renderComponent } from '@/components/KatexRenderer';

interface IContestProps {
}
interface problemInputAnswer {
    answer: string | null;
    verdict: string | null;
}
const Contest: React.FunctionComponent<IContestProps> = (props) => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const {id} = useParams<{id: string}>();
    const [contestData, setContestData] = useState<DocumentData | null>(null);
    const [problems, setProblems] = useState<DocumentData[] | null>(null);
    const [contestLoadError, setContestLoadError] = useState(false);
    const [inputAnswer, setInputAnswer] = useState<Record<string,problemInputAnswer>>({});
    const [contestId, setContestId] = useState<string>("");
    const activeTab = "data-[state=active]:bg-primary data-[state=active]:text-lavender data-[state=active]:rounded-md"
    const activeProblem = "data-[state=active]:bg-primary data-[state=active]:text-lavender"
    useEffect(() => {
    }, [id])
    useEffect(()=> {
        if(db && id){
            if(!contestId){
                const getContest = async() => {
                    const contestsSnap = await getDocs(collection(db, "contests"));
                    contestsSnap.forEach((contest) => {
                        const contestData = contest.data();
                        if(contestData.id == id){
                            setContestId(id);
                        }
                    })
                }
                getContest();
            }
            else{
                const getProblems = async() => {
                    if(!contestId){
                        console.log("whateve")
                        setContestLoadError(true);
                        return;
                    }
                    const contestRef = doc(db, "contests", contestId);
                    const contestSnap = await getDoc(contestRef);
                    if(contestSnap.exists()){
                        setContestData(contestSnap.data());
                        const problemsSnap = await getDocs(collection(contestRef, "problems"));
                        let arr: DocumentData[] = [];
                        problemsSnap.forEach((doc) => {
                            arr.push(doc.data());
                            setInputAnswer({...inputAnswer, [doc.data().name]: ""});
                            console.log("data");
                            console.log(doc.data());
                        })
                        setProblems(arr);
                    }
                    else{
                        console.log("Can't Find Contest");
                        setContestLoadError(true);
                    }
                }
                getProblems();
            }
        }
    }, [contestId, db, id])
    useEffect(() => {
        if(problems){
            console.log(problems.length);
        }
    },[problems])
    
    if(loading || !problems || !contestData){
        return <div>loading...</div>
    }
    if(contestLoadError ) {
        return <Error/>
    }
    
    if(!user){
        navigate('/login');
    }
    const handleInputAnswerChange = (attr: string, value: string, problem: DocumentData) => {
        setInputAnswer({...inputAnswer, [problem.name]: {...inputAnswer[problem.name], [attr]: value}});
    }
    const handleProblemSubmit = (problem: DocumentData) => {
        if(contestData.ended){
            if(problem.answer == Number(inputAnswer[problem.name].answer)){
                handleInputAnswerChange("verdict", "true", problem);
                console.log("true");
            }
            else{
                handleInputAnswerChange("verdict", "false", problem);
                console.log("false");
            }
        }
        else{
            handleInputAnswerChange("verdict", "in_contest", problem);
            console.log("in_contest");
        }
    }
    const verdict = (problem: DocumentData) => {  
        return inputAnswer[problem.name]?.verdict;
    }
    return (
        <div className='flex flex-col h-screen'>
            <Header login={null} signup={null}/>
            <Tabs defaultValue="problems" className="mx-10 flex-1 flex flex-col mt-15 items-center">
                <TabsList className="grid w-3xl grid-cols-4 h-10 max-h-20 border-2 border-border rounded-md p-1 mb-6">
                    <TabsTrigger value="problems" className={activeTab}>Problems</TabsTrigger>
                    <TabsTrigger value="standing" className={activeTab}>Standing</TabsTrigger>
                    <TabsTrigger value="editorials" className={activeTab}>Editorials</TabsTrigger>
                    <TabsTrigger value="support" className={activeTab}>Support</TabsTrigger>
                </TabsList>
                <TabsContent value="problems" className='w-full'>
                    <Tabs defaultValue={problems[0].name} className="w-full">
                        <div className='grid grid-cols-12'>
                            <div className='col-span-1 '>
                                <TabsList className='flex flex-col gap-2 '>
                                    {problems.map((problem) =>( 
                                        <TabsTrigger key={problem.name} value={problem.name} className={`${activeProblem} rounded-full w-12 h-12 border-border border-1 font-bold text-text/55
                                        ${verdict(problem) == "true" ? "bg-green-300" :
                                            verdict(problem) == "false" ? "bg-red-300" : ""}
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
                                                    {problem.description.map((e: lineDescription, i: number)=> {
                                                        return renderComponent({lineDescription: e, key: i.toString()});
                                                    })}
                                                    </>
                                                </div>
                                                <form onSubmit={(e) => {e.preventDefault();return handleProblemSubmit(problem)}} className='flex items-center gap-2 m-3 mt-7'>
                                                    <Input type="text" placeholder='Enter Your Answer' value={inputAnswer[problem.name]?.answer || ""} className="w-96" onChange={(e) => handleInputAnswerChange("answer", e.target.value, problem)}/>
                                                    <Button type="submit" className={`col-span-2 `}>Submit</Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                        {verdict(problem) == "true" ?
                                        <Card className='border-green-400'>
                                            <CardTitle className='font-bold text-green-600 text-2xl'>Correct Answer</CardTitle>
                                            <CardContent>
                                            <h2>Explanation:</h2>
                                            <p>{problem.editorial}</p>
                                            </CardContent>
                                        </Card>
                                        : verdict(problem) == "false" ? 
                                        <Card className='border-red-400'>
                                            <CardTitle className='font-bold text-red-600 text-2xl'>Wrong Answer</CardTitle>
                                            <CardContent>
                                            <h2 className=''>Try once more</h2>
                                            <p>or see the editorial</p>
                                            </CardContent>
                                        </Card>
                                        : ""}
                                        </div>
                                    </TabsContent>
                                ))}
                            </div>
                            <div className='col-span-4 border-2 border-black'></div>
                        </div>
                    </Tabs>
                </TabsContent>
                <TabsContent value="standing" className='w-full'>
                    <Card className=''>
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
                            {/* <Button>Save password</Button> */}
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Contest;
