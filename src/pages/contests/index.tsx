import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Header from '@/components/ui/Header';
import { collection, doc, DocumentData, getDocs, setDoc } from 'firebase/firestore';
import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebaseConfig';
import Countdown from "react-countdown";
import { Activity } from 'lucide-react';
import { Users } from 'lucide-react';

interface IContestsProps {
}

const Contests: React.FunctionComponent<IContestsProps> = (_props) => {
  const [pastContests, setPastContests] = useState<DocumentData[] | null>(null);
  const [upcomingContests, setUpcomingContests] = useState<DocumentData[] | null>(null);
  const [registeredContests, setRegisteredContests] = useState<DocumentData[] | null>(null);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  useEffect(() => {
    const getContests = async() => {
      const contestSnap = await getDocs(collection(db, "contests"))
      const pastContestTemp: DocumentData[] = [];
      const upcomingContestTemp: DocumentData[] = [];
      contestSnap.forEach((contest) => {
        const contestData = contest.data();
        if(contestData.ended == true){
          pastContestTemp.push(contestData);
        }
        else{
          upcomingContestTemp.push(contestData);
        }
      })
      setPastContests(pastContestTemp);
      setUpcomingContests(upcomingContestTemp);
    }
    if(user){
      const getRegisteredContests = async() => {
        const registeredContestsSnap = await getDocs(collection(db, "users", user.uid, "contests"))
        registeredContestsSnap.forEach((contest) => {
          const contestData = contest.data();
          if(registeredContests){
            setRegisteredContests([...registeredContests,contestData]);
          }
          else{
            setRegisteredContests([contestData]);
          }
        })
      }
      getRegisteredContests();
    }
    getContests();
  }, [db, user])
  const handleNewRegister = async(contest: DocumentData) => {
    if(user){
      await setDoc(doc(db, "users", user.uid, "contests", contest.id), {
        name: contest.name,
        id: contest.id,
        answered: []
      })
      if(registeredContests){
        setRegisteredContests([...registeredContests, contest])
      }
      else{
        setRegisteredContests([contest])
      }
    }
    else{
      navigate('/login')
    }
  }
  const handleCreateContest = () => {
    if(user){
      navigate('/create-contest');
    }
    else{
      navigate('/login');
    }
  }
  const contestEndTime = (contest: DocumentData): Date => {
    const contestDate = contest.date.toDate();
    const contestEnd = new Date(contestDate.getTime() + contest.length * 60 * 60 * 1000)
    return contestEnd;
  }
  const isRunnning = (contest: DocumentData): boolean => {
    if(contest){
      const now = new Date();
      const contestDate = contest.date.toDate();
      if(now > contestDate && now < contestEndTime(contest)){
        return true;
      }
    }
    return false;
  }

  const handleContestend = async(contest: DocumentData) => {
    await setDoc(doc(db, "contests", contest.id), {ended: true});
    window.location.reload();
  }
  if(loading){
    return <div>loading...</div>
  }
  return (
    <div>
        <Header login={"full"} signup={"outline"}/>
        <div className='grid grid-cols-12'>
          <div className='col-span-8 m-10 mx-20 max-w-200 '>
            <div className='w-full'>
              {/* Upcoming Header */}
              <div className='flex place-content-between mb-2'>
                <div className='flex gap-2'>
                  <Activity className='font-semibold text-xl'/>
                  <h1 className='font-semibold text-xl'>Live & Upcoming Contests</h1>
                </div>
                <Button variant='outline' onClick={handleCreateContest}>create your own</Button>
              </div>
              {/* Upcoming Body */}
              <Card className='border-border p-4 w-[90%]'>
                {upcomingContests && upcomingContests.map((contest) => (
                  <Card className='border-border w-full px-2 border-l-4 border-l-red-400 rounded-l-md' key={contest.id} >
                    <CardContent className='flex place-content-between gap-2'>
                      <div className='flex flex-col gap-2'>
                        <h1 className='font-medium text-2xl text-left flex-1'>{contest.name}</h1>
                        {/* {contest.tags.length > 0 && contest.tags.map((e, i) => (
                          <div></div>
                        ))} */}
                        {isRunnning(contest)
                        ? <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-red-500 flex items-center justify-center'><div className='w-2 h-2 rounded-full bg-red-500 blur-xs'></div></div>
                          <h2 className='text-red-600 font-mono text-sm'>Live now! Ends in  
                            {
                              <Countdown date={contestEndTime(contest)} onComplete={() => handleContestend(contest)} renderer={({hours, minutes, seconds, completed}) => 
                                completed ? <p>Time's up!!</p> : ` ${String(hours).padStart(2, '0')}:
                                                                  ${String(minutes).padStart(2, '0')}:
                                                                  ${String(seconds).padStart(2, '0')}`
                              }/>
                            }
                            </h2>
                        </div>
                        : <div></div>
                        }
                      </div>
                      <div className='flex flex-col gap-2 items-center'>
                        {
                          registeredContests?.some((e) => e.id == contest.id) 
                          ? <div className='w-32 rounded-md bg-green-400 m-auto'><h4 className='text-green-700 font-medium'>registered</h4></div>
                          : <Button variant={'outline'} className='border-red-500 border-2 text-red-500 h-7 w-30 rounded-sm ' onClick={() => handleNewRegister(contest)}>Register</Button>
                        } 
                        <div className='flex gap-2 items-center'>
                          <Users className='text-text/60 w-4 h-4'/>
                          <p className='text-text/60 text-sm'>{contest.registered} registered</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </Card>
            </div>
            <h1>Past Contests</h1>
            <Card className='border-border p-5'>
              {pastContests && pastContests.map((contest) => (
                <Card className='border-border' key={contest.id}>
                  <CardHeader>{contest.name}</CardHeader>
                  <CardContent>
                      {
                        <Button onClick={() => navigate(`/contest/${contest.id}`)}>{registeredContests?.find((contest2) => contest2.id == contest.id) == undefined ? "Review" : "Attempt"}</Button>
                      }
                  </CardContent>
                </Card>
              ))}
            </Card>
          </div>
          <div className='col-span-4'>
            
          </div>
        </div>
    </div>
  );
};

export default Contests;
