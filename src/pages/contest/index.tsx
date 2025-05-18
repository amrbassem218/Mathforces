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
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useState, useRef, useEffect } from 'react';
import MathJaxConfig from '@/MathJaxConfig';
import Math from '@/Math';
interface IContestProps {
}
declare global {
  interface Window {
    MathJax: {
      typesetPromise: (elements?: Element[]) => Promise<void>;
      startup?: { promise: Promise<any> };
    };
  }
}

const Contest: React.FunctionComponent<IContestProps> = (props) => {
    const [user, loading] = useAuthState(auth);
    // const { signup , login, logInWithGoogle, logInWithGithub,logout} = useAuthUserContext();
    const navigate = useNavigate();
    const [jaxloading, setJaxLoading] = useState(false);
    if(loading){
        return <div>loading...</div>
    }
    if(!user){
        navigate('/login');
    }
    const activeTab = "data-[state=active]:bg-primary data-[state=active]:text-lavender data-[state=active]:rounded-md"
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
                            <TabsList className='flex flex-col gap-2'>
                                <TabsTrigger value="A">A</TabsTrigger>
                                <TabsTrigger value="B">B</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className='col-span-7 '>
                                <TabsContent value="A">
                                    <h1 className='text-2xl font-semibold mb-2'>Problem A</h1>
                                    <Card className='border-border'>
                                    <CardContent className='text-lg/8'>
                                        </CardContent>
                                    </Card> 
                                </TabsContent>
                                <TabsContent value="B">
                                    <h1 className='text-2xl font-semibold mb-2'>Problem B</h1>
                                    <Card className='border-border'>
                                    <CardContent className='text-lg/8 w-full max-w-full'>
                                        <MathJaxConfig>
                                            <p>Let  <Math math={"n"}/> be an even positive integer. Let <Math math={"p"}/>  be a monic, real polynomial of degree <Math math={"2n"}/>; that is to say, <Math math={"p(x) = x^{2n} + a_{2n-1} x^{2n-1} + \\cdots + a_1 x + a_0, \\dots, a_{2n-1}."}/> Suppose that <Math math={'p(1/k) = k^2'}/> for all integers <Math math={'k'}/> such that <Math math={'1 \\leq |k| \\leq n'}/>. Find all other real numbers <Math math='x'/> for which <Math math={"p(1/x) = x^2"}/></p>
                                        </MathJaxConfig>
                                    </CardContent>
                                    </Card> 
                                </TabsContent>
                        </div>
                        <div className='col-span-4 border-2 border-black'></div>
                    </div>
                </Tabs>
                {/* <Card>
                    <CardHeader>
                        <CardTitle>Account</CardTitle>
                        <CardDescription>
                        Make changes to your account here. Click save when you're done.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue="Pedro Duarte" />
                        </div>
                        <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="@peduarte" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button>Save changes</Button>
                    </CardFooter>
                </Card> */}
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
