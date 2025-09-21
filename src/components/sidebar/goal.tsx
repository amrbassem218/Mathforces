import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { GoalIcon, MoreHorizontal } from 'lucide-react';
import { BsBarChartFill } from "react-icons/bs";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Chart } from '../ui/chart';
import { nextTitle, title } from '../../../utilities';
import { getDoc, doc, DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
interface IGoalProps {
    remove?: Function;
}

const Goal: React.FunctionComponent<IGoalProps> = ({remove}) => {
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate();
  const [userData, setUserData] = useState<DocumentData | null>(null);
  useEffect(() => {
      const getUserData = async () => {
          if (user && user.emailVerified) {
              const userSnap = await getDoc(doc(db, "users", user.uid));
              const userData = userSnap.data();  
              if(userData){
                  setUserData(userData);
              }
            }
        };
        getUserData();
    }, [user]);

  return (
    <Card className='border-border pt-2'>
        <CardHeader className='flex  justify-between px-4 py-2 border-b-1 border-border'>
            <div className='flex gap-2 items-center'>
                <BsBarChartFill size={20}/>
                <CardTitle className='text-lg font-semibold'>Next Goal</CardTitle>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <MoreHorizontal className="cursor-pointer "/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 bg-background rounded-md border-2 border-border" align="start">
                    <DropdownMenuLabel className="font-semibold">Next Goal</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {
                            userData &&
                            <DropdownMenuItem onClick={() => navigate(`/profile/${user?.uid}`)} className="hover:bg-gray-300 cursor-pointer">see full chart</DropdownMenuItem>
                        }
                        <DropdownMenuItem onClick={() => remove ? remove() : ''} className="text-accent font-medium rounded-sm cursor-pointer hover:bg-accent hover:text-lavender">remove this</DropdownMenuItem>
                        {/* <DropdownMenuItem className="px-2"><Button variant={'ghost'} className="w-full flex justify-start p-0 m-0">Remove this</Button></DropdownMenuItem> */}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>   
        </CardHeader>
            {
            userData 
            ?<>
            <CardContent className='h-40 w-full  p-0 m-0 border-b-1 border-border'>
                <Chart/>
            </CardContent>
            <CardFooter className='h-0'>
                <h3 className={`${nextTitle(userData.rating).title.text} font-medium`}>{nextTitle(userData.rating).title.name}: <span className='text-green-600'>+{nextTitle(userData.rating).ratingDiff}</span></h3>
                {/* <h4>{nextTitle(userData.rating).title.text}</h4> */}
            </CardFooter>
            </>
            : <div className='px-2'>
                <p className='text-text/70'><button className='underline text-primary font-semibold' onClick={() => navigate('/login')}>Login</button> and strive for a new goal!!</p>
            </div>
        }
    </Card>
  );
};

export default Goal;
