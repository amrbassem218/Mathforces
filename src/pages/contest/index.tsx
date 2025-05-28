import * as React from 'react';
import Login from '../login';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseConfig';
import Header from '@/components/ui/Header';
import { useAuthUserContext } from '@/context/authUserContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { useProblems } from "../../../texconverter";

const config = {
    loader: { load: ['[tex]/ams'] },
    tex: {
        packages: { '[+]': ['ams'] },
        inlineMath: [['$', '$']],
        displayMath: [['$$', '$$']],
        processEnvironments: true,
        processEscapes: true
    },
    startup: {
        typeset: true
    }
};

interface IContestProps {
}

const Contest: React.FunctionComponent<IContestProps> = (props) => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const { problems, loading: problemsLoading, error: problemsError } = useProblems();
    
    if(loading || problemsLoading){
        return <div>loading...</div>
    }

    if(problemsError) {
        return <div>Error loading problems: {problemsError}</div>
    }
    
    if(!user){
        navigate('/login');
    }

    const activeTab = "data-[state=active]:bg-primary data-[state=active]:text-lavender data-[state=active]:rounded-md"
    
    return (
        <MathJaxContext config={config}>
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
                                    <TabsList className='flex flex-col gap-2'>
                                        {Object.keys(problems).map((problemKey) => (
                                            <TabsTrigger key={problemKey} value={problemKey}>
                                                {problemKey}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>
                                <div className='col-span-7'>
                                    {Object.entries(problems).map(([problemKey, {description, enumerate, difficulty}]) => (
                                        <TabsContent key={problemKey} value={problemKey}>
                                            <h1 className='text-2xl font-semibold mb-2'>Problem {problemKey}</h1>
                                            <Card className='border-border'>
                                                <CardContent className='text-lg/8 w-full max-w-full'>
                                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                                        <MathJax hideUntilTypeset={'first'}>
                                                            {description.includes("\\begin{enumerate}") ? (
                                                                <>
                                                                    {description.split("\\begin{enumerate}")[0]}
                                                                    <ul>
                                                                        {enumerate.map((item, index) => (
                                                                            <li key={index}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                    {description.split("\\end{enumerate}")[1]}
                                                                </>
                                                            ) : (
                                                                description
                                                            )}
                                                        </MathJax>
                                                    </div>
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
        </MathJaxContext>
    );
};

export default Contest;
