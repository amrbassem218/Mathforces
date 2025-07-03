import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { GoalIcon, MoreHorizontal } from 'lucide-react';
import { BsBarChartFill } from "react-icons/bs";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../firebaseConfig';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Chart } from '../ui/chart';
import { title } from '../../../utilities';
import { getDoc, doc, DocumentData } from 'firebase/firestore';
import { useState, useEffect } from 'react';
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

    const nextTitle = (rating: number) => {
      const curTitle = title(rating).name;
      let base = 0;
      while(base - rating < 0){
          base += 100;
      }
      let ratingDiff = base-rating;
      console.log("base: ", base);
      while(title(rating+ratingDiff).name == curTitle){
          ratingDiff += 100;
      }
    //   console.log(nextTitle(rating).title.text);
      return {title: title(rating+ratingDiff), ratingDiff: ratingDiff}
    }
  return (
    <Card className='border-border pt-2'>
        <CardHeader className='flex  justify-between px-4 py-2 border-b-1 border-border'>
            <div className='flex gap-2 items-center'>
                <BsBarChartFill size={20}/>
                <CardTitle className='text-lg font-semibold'>Next Goal</CardTitle>
            </div>
            <button>
                <MoreHorizontal className="cursor-pointer "/>
            </button>
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
            : <></>
        }
    </Card>
  );
};

export default Goal;
