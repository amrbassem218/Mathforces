import * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../firebaseConfig';
import Header from '@/components/ui/Header';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useProblems } from "../../../texconverter";
import 'katex/dist/katex.min.css';
import { collection, doc, DocumentData, getDoc, getDocs } from 'firebase/firestore';

interface IContestProps {
}

const Contest: React.FunctionComponent<IContestProps> = (props) => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    // const { problems, loading: problemsLoading, error: problemsError } = useProblems();
    const [contestData, setContestData] = useState<DocumentData | null>(null);
    const [problems, setProblems] = useState<DocumentData[] | null>(null);
    const [contestLoadError, setContestLoadError] = useState(false);
    const [inputAnswer, setInputAnswer] = useState<Record<string,string>>({});
    const CONTEST_ID = "111";
    const activeTab = "data-[state=active]:bg-primary data-[state=active]:text-lavender data-[state=active]:rounded-md"
    const handleProblemSubmit = (problem: DocumentData) => {
       console.log(inputAnswer[problem.name]); 
    }
    useEffect(()=> {
        if(db){
            const getProblems = async() => {
                const contestRef = doc(db, "contests", CONTEST_ID);
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
                        // console.log("data: ", doc.data());
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
    }, [db])
    useEffect(() => {
        if(problems){
            console.log(problems.length);
        }
    },[problems])
    
    if(loading || !problems){
        return <div>loading...</div>
    }

    if(contestLoadError) {
        return <div>Error loading Contest</div>
    }
    
    if(!user){
        navigate('/login');
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
                    <Tabs defaultValue="A" className="w-full">
                        <div className='grid grid-cols-12'>
                            <div className='col-span-1 border-2 border-black'>
                                <TabsList className='flex flex-col gap-2 '>
                                    {problems.map((problem) => {
                                        console.log("hey it'sme");
                                        return (
                                        <TabsTrigger key={problem.name} value={problem.name}>
                                            {problem.name}
                                        </TabsTrigger>
                                    )})}
                                </TabsList>
                            </div>
                            <div className='col-span-7'>
                                {problems.map((problem) =>(
                                    <TabsContent key={problem.name} value={problem.name}>
                                        <h1 className='text-2xl font-semibold mb-2'>Problem {problem.name}</h1>
                                        <Card className='border-border'>
                                            <CardContent className='text-lg/8 w-full max-w-full'>
                                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                                    <>
                                                    {problem.problemStatement.map((e: string)=> {
                                                        return e;
                                                    })}
                                                    </>
                                                </div>
                                                <form onSubmit={(e) => {e.preventDefault();return handleProblemSubmit(problem)}} className='flex items-center gap-2 m-3 mt-7'>
                                                    <Input type="text" placeholder='Enter Your Answer' value={inputAnswer[problem.name]} className="w-96" onChange={(e) => setInputAnswer({...inputAnswer, [problem.name]: e.target.value})}/>
                                                    <Button type="submit" className='col-span-2'>Submit</Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                ))}
                            </div>
                            <div className='col-span-4 border-2 border-black'></div>
                        </div>
                    </Tabs>
                </TabsContent>
                <TabsContent value="standing" className='w-2xl'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                Change your password here. After saving, you'll be logged out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="current">Current password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">New password</Label>
                                <Input id="new" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Contest;
