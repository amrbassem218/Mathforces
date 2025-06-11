import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Header from '@/components/ui/Header';
import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaCaretDown } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DateAndTimePicker } from '@/components/ui/dateAndTmePicker';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { toast, Toaster } from 'sonner';
import { useProblems } from '../../../texconverter';
import { Problem, Problems } from 'types';
import {formatTex} from "../../../texFormatter"
interface ICreateContestProps {
    
}
const schema = z.object({
  contestName: z.string().min(10).max(90),
  contestTex: z.string().min(100), // Should add a live Tex editor and validator here 
  contestLength: z.number().min(0.1),
  contestDifficulty: z.string(),
  contestTime: z.string().min(1, "Set Contest Time"),
  contestDate: z.date({required_error: "Date is required"}),
})
type zodSchema = z.infer<typeof schema>;
const CreateContest: React.FunctionComponent<ICreateContestProps> = (props) => {
  const [contestName, setContestName] = useState("");
  const [contestTex, setContestTex] = useState("");
  const [contestDifficulty, setContestDifficulty] = useState("");
  const [user, loading] = useAuthState(auth);
  const [dateAndTime, setDateAndTime] = useState<{date: Date | undefined; time:string | undefined;}>({date: undefined, time: ""});
  const [formattedContestTex, setFormattedContestTex] = useState("");
  const [isCreatingContest, setIsCreatingContest] = useState(false);
  const {problems, error} = useProblems({formattedTex: formattedContestTex});
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [createdAnswerFields, setCreatedAnswerFields] = useState(false);
  const [contestId, setContestId] = useState("111");
  const [texInput, setTexInput] = useState("");
  //schema
  const form = useForm<zodSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
        contestName: "",
        contestTex: "",
        contestLength: 2,
        contestDifficulty: "",
        contestTime: "",
        contestDate: undefined,
    }
  });
  const contestDifficultyTypes = {
    div: ["Div.1", "Div.2", "Div.3", "Div.4"],
    standardized: ["ACT","SAT","GRE", "AP Calc AB", "AMC 8", "AMC 10", "AMC 12", "AIME"],
    olympiad: ["Junior Olympiad", "National Olympiad", "International Olympiad"],
    college: ["Putnam", "Project Euler", "Proof-based"],
  }
  useEffect(() => {
    if (Object.keys(problems).length > 0 && !createdAnswerFields) {
        const answers: Record<string, string> = {};
        Object.keys(problems).forEach((problemName) => {
            answers[problemName] = '';
        });
        setAnswers(answers);
        setCreatedAnswerFields(true);
    }
  },[problems])  
  useEffect(() => {
      if(problems && isCreatingContest){
            console.log("problem1: ", Object.values(problems)[0]);
            console.log(formattedContestTex);
            const createProblems = async() => {
                for(let problem of Object.values(problems)){
                    await setDoc(doc(db, "contests", contestId, "problems", problem.name), {
                        name: problem.name,
                        description: problem.description,
                        difficulty: problem.difficulty,
                        answer: answers[problem.name]
                    });
                    console.log("one of the problems: ", problem.name);
                    console.log(contestId);
                }
            }

            createProblems();
        }
    }, [answers, formattedContestTex, problems, contestId, isCreatingContest])
    useEffect(() => {
        setFormattedContestTex(formatTex(texInput));
    }, [texInput]);
  const handleCreateContestSubmit = (data: zodSchema) => {
    const missingAnswers = Object.keys(problems).filter(problemName => !answers[problemName]);
    if (missingAnswers.length > 0) {
        toast.error("Please provide answers for all problems", {
            description: `Missing answers for: ${missingAnswers.join(", ")}`
        });
        return;
    }
    if(Object.keys(answers).length == 0){
        toast.error("Invalid Tex Format", {
            description: `Please Follow the guidelines here`
        });
        return;
    } 
    const getId = async() => {
        const contestsSnap = await getDocs(collection(db, "contests"));
        let curContestId = "111";
        contestsSnap.forEach((contest) => {
            const contestData = contest.data();
            if(contestData.id){
                console.log(Number(contestData.id)+1);
                console.log(Number(Number(curContestId)));
                curContestId = Math.max(Number(contestData.id)+1, Number(curContestId)).toString();
            }
        })
        setContestId(curContestId);
        return curContestId;
    }
    const contestDateString = data.contestDate.toLocaleDateString('en-US', {
        weekday: "long",
        month: "long",
        day: "2-digit"
    })
    const createContest = async(contestId: string) => {
        const now = new Date();
        const contestDateAndTime = new Date(data.contestDate.getTime() + (parseFloat(data.contestTime)) * 60 * 60 * 1000)
        const contestDateAndTimeEnd = new Date(contestDateAndTime.getTime() + data.contestLength * 60 * 60 * 1000)
        
        let formattedTex = formatTex(data.contestTex)
        console.log("formatted: ", formattedTex);
        setFormattedContestTex(formattedTex);
        setIsCreatingContest(true);
        const newContest = await setDoc(doc(db, "contests", contestId), {
            name: data.contestName,
            id: contestId,
            contestTex: formattedTex,
            date: contestDateAndTime, 
            ended: now > contestDateAndTimeEnd,
            length: data.contestLength,
        })
    }
    const undoContestCreation = async(contestId: string) => {
        const subCollections = ["problems"];
        subCollections.forEach(async(col) => {
            const subDocs = await getDocs(collection(db, "contests", contestId, col));
            subDocs.forEach((doc) => {
                deleteDoc(doc.ref);
            })
        })
        await deleteDoc(doc(db, "contests", contestId))
    }   
    getId().then((id) => {
        navigate('/contests')
        createContest(id).then(() => { 
            console.log("contest has been created");
            toast("Contest has been created", {
                description: contestDateString,
                action: {
                    label: "Undo",
                    onClick: (() => undoContestCreation(id)),
                },
            })
        })
    })
  }
  const difficulty = form.watch("contestDifficulty");
  const length = form.watch("contestLength");
  if(loading){
    return <div>loading...</div>
  }
  return (
    <div>
        <Header login={"full"} signup={"outline"}/>
        <div className='grid grid-cols-12'>
          <div className='col-span-8'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateContestSubmit)}>
                    <FormField
                    control={form.control}
                    name='contestName'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contest Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder='Contest Name' {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name='contestTex'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contest Latex</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Paste Contest Tex here' {...field} onChange={(e) => {setTexInput(e.target.value); form.setValue("contestTex", e.target.value)}} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    {Object.keys(problems).length > 0 && <h1>Answers: </h1> && Object.keys(problems).map((e, i) => (
                        <FormItem key={i}>
                            <FormLabel>{e}</FormLabel>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    placeholder={`${e} answer`} 
                                    value={answers[e as keyof typeof answers]}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setAnswers(prev => ({
                                            ...prev,
                                            [e as keyof typeof answers]: value
                                        }));
                                    }}
                                    required
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    ))}
                    <DateAndTimePicker onChange={({date, time}) => {
                        if(date instanceof Date){
                            form.setValue("contestDate", date);
                        }
                        if(typeof time === "string"){
                            form.setValue("contestTime", time);
                        }
                    }}/>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"outline"}>{difficulty ? difficulty : "Select Difficulty"} <FaCaretDown /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-40' align='start'>
                            <DropdownMenuLabel>Contest Level</DropdownMenuLabel>
                            {Object.values(contestDifficultyTypes).map((contestType, i) => {
                                return (
                                <div key={i}>
                                <DropdownMenuGroup>
                                    {contestType.map((contest, i) => (
                                        <DropdownMenuItem key={i} onClick={() => form.setValue("contestDifficulty", contest)}>{contest}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                                {i+1 < contestType.length && <DropdownMenuSeparator/>}
                                </div>
                            )})}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <FormField
                    control={form.control}
                    name='contestLength'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contest Length</FormLabel>
                            <FormControl>
                                <div className="flex flex-col gap-3">
                                    <Input
                                    type="number"
                                    id="length"
                                    min="0"
                                    step="0.5"
                                    placeholder="e.g. 2"
                                    {...field}
                                    className="w-24"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    <Button type='submit'>Submit</Button>
                </form>
            </Form>
          </div>
        </div>
    </div>
  );
};

export default CreateContest;
