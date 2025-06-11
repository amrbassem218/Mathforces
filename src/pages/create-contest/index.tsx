import { Button } from '@/components/ui/button';
import { DateAndTimePicker } from '@/components/ui/dateAndTmePicker';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import Header from '@/components/ui/Header';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { auth, db } from '../../../firebaseConfig';
import { useProblems } from '../../../texconverter';
import { formatTex } from "../../../texFormatter";

const schema = z.object({
  contestName: z.string().min(10).max(90),
  contestTex: z.string().min(100),
  contestLength: z.number().min(0.1),
  contestDifficulty: z.string(),
  contestTime: z.string().min(1, "Set Contest Time"),
  contestDate: z.date({required_error: "Date is required"}),
});

type zodSchema = z.infer<typeof schema>;

const CreateContest: React.FunctionComponent = () => {
  const [user, loading] = useAuthState(auth);
  const [formattedContestTex, setFormattedContestTex] = useState("");
  const [isCreatingContest, setIsCreatingContest] = useState(false);
  const {problems} = useProblems({formattedTex: formattedContestTex});
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [createdAnswerFields, setCreatedAnswerFields] = useState(false);
  const [contestId, setContestId] = useState("111");
  const [texInput, setTexInput] = useState("");

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

  useEffect(() => {
    if (Object.keys(problems).length > 0 && !createdAnswerFields) {
        const answers: Record<string, string> = {};
        Object.keys(problems).forEach((problemName) => {
            answers[problemName] = '';
        });
        setAnswers(answers);
        setCreatedAnswerFields(true);
    }
  }, [problems, createdAnswerFields]);

  useEffect(() => {
    if(problems && isCreatingContest) {
        const createProblems = async() => {
            for(const problem of Object.values(problems)) {
                await setDoc(doc(db, "contests", contestId, "problems", problem.name), {
                    name: problem.name,
                    description: problem.description,
                    difficulty: problem.difficulty,
                    answer: answers[problem.name]
                });
            }
        };
        createProblems();
    }
  }, [answers, formattedContestTex, problems, contestId, isCreatingContest]);

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
    if(Object.keys(answers).length === 0) {
        toast.error("Invalid Tex Format", {
            description: "Please Follow the guidelines here"
        });
        return;
    } 

    const getId = async() => {
        const contestsSnap = await getDocs(collection(db, "contests"));
        let curContestId = "111";
        contestsSnap.forEach((contest) => {
            const contestData = contest.data();
            if(contestData.id) {
                curContestId = Math.max(Number(contestData.id)+1, Number(curContestId)).toString();
            }
        });
        setContestId(curContestId);
        return curContestId;
    };

    const contestDateString = data.contestDate.toLocaleDateString('en-US', {
        weekday: "long",
        month: "long",
        day: "2-digit"
    });

    const createContest = async(contestId: string) => {
        const now = new Date();
        const contestDateAndTime = new Date(data.contestDate.getTime() + (parseFloat(data.contestTime)) * 60 * 60 * 1000);
        const contestDateAndTimeEnd = new Date(contestDateAndTime.getTime() + data.contestLength * 60 * 60 * 1000);
        
        const formattedTex = formatTex(data.contestTex);
        setFormattedContestTex(formattedTex);
        setIsCreatingContest(true);
        await setDoc(doc(db, "contests", contestId), {
            name: data.contestName,
            id: contestId,
            contestTex: formattedTex,
            date: contestDateAndTime, 
            ended: now > contestDateAndTimeEnd,
            length: data.contestLength,
        });
    };

    const undoContestCreation = async(contestId: string) => {
        const subCollections = ["problems"];
        subCollections.forEach(async(col) => {
            const subDocs = await getDocs(collection(db, "contests", contestId, col));
            subDocs.forEach((doc) => {
                deleteDoc(doc.ref);
            });
        });
        await deleteDoc(doc(db, "contests", contestId));
    };   

    getId().then((id) => {
        navigate('/contests');
        createContest(id).then(() => { 
            toast("Contest has been created", {
                description: contestDateString,
                action: {
                    label: "Undo",
                    onClick: (() => undoContestCreation(id)),
                },
            });
        });
    });
  };

  if(loading) {
    return <div>loading...</div>;
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
                    {Object.keys(problems).length > 0 && (
                        <>
                            <h1>Answers: </h1>
                            {Object.keys(problems).map((e, i) => (
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
                        </>
                    )}
                    <DateAndTimePicker onChange={({date, time}) => {
                        if(date instanceof Date) {
                            form.setValue("contestDate", date);
                        }
                        if(time) {
                            form.setValue("contestTime", time);
                        }
                    }}/>
                    <Button type="submit">Create Contest</Button>
                </form>
            </Form>
          </div>
          <div className='col-span-4'>
          </div>
        </div>
    </div>
  );
};

export default CreateContest;
