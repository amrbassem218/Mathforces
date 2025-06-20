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
import path, { format } from 'path';
import { CalendarDays } from 'lucide-react';
import { Archive } from 'lucide-react';
import {contestEndTime, ended, viewDate, isRunnning, date} from "../../../utilities"
interface IContestsProps {
}

const Contests: React.FunctionComponent<IContestsProps> = (_props) => {
  const [pastContests, setPastContests] = useState<DocumentData[] | null>(null);
  const [upcomingContests, setUpcomingContests] = useState<DocumentData[] | null>(null);
  const [registeredContests, setRegisteredContests] = useState<DocumentData[] | null>(null);
  const [unofficiallyRegisteredContests, setUnofficiallyRegisteredContests] = useState<DocumentData[] | null>(null);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  useEffect(() => {
    const getContests = async() => {
      const contestSnap = await getDocs(collection(db, "contests"))
      const pastContestTemp: DocumentData[] = [];
      const upcomingContestTemp: DocumentData[] = [];
      contestSnap.forEach((contest) => {
        const contestData = contest.data();
        if(ended(contestData)){
          pastContestTemp.push(contestData);
        }
        else{
          console.log(contestData.date);
          upcomingContestTemp.push(contestData);
        }
      })
      pastContestTemp.sort((a,b) => {
        return b.date - a.date;
      })
      upcomingContestTemp.sort((a,b) => {
        return a.date - b.date;
      })
      setPastContests(pastContestTemp);
      setUpcomingContests(upcomingContestTemp);
    }
    if(user){
      const getRegisteredContests = async() => {
        const registeredContestsSnap = await getDocs(collection(db, "users", user.uid, "contests"))
        let registeredContestsTemp:DocumentData[] = [];
        registeredContestsSnap.forEach((contest) => {
          const contestData = contest.data();
          registeredContestsTemp.push(contestData);
        })
        setRegisteredContests(registeredContestsTemp);
      }
      
      const getUnofficiallyRegisteredContests = async() => {
        const unofficiallyRegisteredContestsSnap = await getDocs(collection(db, "users", user.uid, "unofficialContests"))
        let unofficiallyRegisteredContestTemp:DocumentData[] = [];
        unofficiallyRegisteredContestsSnap.forEach((contest) => {
          const contestData = contest.data();
          unofficiallyRegisteredContestTemp.push(contestData);
        })
        setUnofficiallyRegisteredContests(unofficiallyRegisteredContestTemp);
      }
      getRegisteredContests();
      getUnofficiallyRegisteredContests();
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
      await setDoc(doc(db, "contests", contest.id), {
        ...contest,
        registered: contest.registered + 1
      })
      if(registeredContests){
        setRegisteredContests([...registeredContests, contest])
      }
      else{
        setRegisteredContests([contest])
      }
      if(isRunnning(contest)){
        navigate(`/contest/${contest.id}/official`);
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
  
  
  const handleContestend = async(contest: DocumentData) => {
    // await setDoc(doc(db, "contests", contest.id), {...contest, ended: true});
    window.location.reload();
  }
  const handleDateClick = (contest: DocumentData) => {
    const {part} = viewDate(date(contest));
    window.open(`https://www.timeanddate.com/worldclock/fixedtime.html?day=${part("day")}&month=${part("month")}&year=${part("year")}&hour=${part("dayPeriod") == "AM" ? part("hour") : (Number(part("hour"))+12).toString()}&min=${part("minute")}&sec=0`, "_blank")
  }

  // const getContestRegistered = (contest:DocumentData) => {

  // }
  const handleAttempt = async(contest: DocumentData) =>{
    if(!user){
      navigate('/login');
      return;
    }
    if(contest){
      await setDoc(doc(db, "users", user.uid, "unofficialContests", contest.id), {
        name: contest.name,
        id: contest.id,
        answered: []
      })
      await setDoc(doc(db, "contests", contest.id), {
        ...contest,
        unofficiallyRegistered: contest.unofficiallyRegistered + 1
      })
      if(unofficiallyRegisteredContests){
        setUnofficiallyRegisteredContests([...unofficiallyRegisteredContests, contest])
      }
      else{
        setUnofficiallyRegisteredContests([contest])
      }
      navigate(`/contest/${contest.id}/unofficial`)
    }
  }
  // useEffect(()=>{console.log(registeredContests)},[registeredContests])
  useEffect(()=>{console.log(unofficiallyRegisteredContests)},[unofficiallyRegisteredContests])
  if(loading){
    return <div>loading...</div>
  }

  return (
    <div>
        <Header login={"full"} signup={"outline"}/>
        <div className='grid grid-cols-16'>
          <div className='col-start-2 col-span-8 m-10 flex flex-col gap-10'>
            {/* Upcoming contests */}
            <div className='full'>
              {/* Upcoming Header */}
              <div className='flex place-content-between mb-2'>
                <div className='flex gap-2'>
                  <Activity className='font-semibold text-xl'/>
                  <h1 className='font-semibold text-xl'>Live & Upcoming Contests</h1>
                </div>
                <Button variant='outline' onClick={handleCreateContest}>create your own</Button>
              </div>
              {/* Upcoming Body */}
              <Card className='border-border p-4 flex gap-4'>
                {upcomingContests && upcomingContests.map((contest) => (
                  <Card className={`flex justify-center h-25 border-border w-full px-2 ${isRunnning(contest) ? "border-l-4 border-l-red-500" : "border-l-4 border-l-primary"}  rounded-l-md`} key={contest.id} >
                    <CardContent className='flex items-center place-content-between gap-2'>
                      <div className='flex flex-col gap-2'>
                        <h1 className='font-medium text-2xl text-left flex-1'>{contest.name}</h1>
                        {/* {contest.tags.length > 0 && contest.tags.map((e, i) => (
                          <div></div>
                        ))} */}
                        {isRunnning(contest)
                        ? <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-red-500 flex items-center justify-center'><div className='w-2 h-2 rounded-full bg-red-500 blur-xs'></div></div>
                          <h2 className='text-red-600 font-mono text-sm'>Live now! Ends in  
                              <Countdown date={contestEndTime(contest)} onComplete={() => handleContestend(contest)} renderer={({hours, minutes, seconds, completed}) => 
                                completed ? <p>Time's up!!</p> : ` ${String(hours).padStart(2, '0')}:
                                                                  ${String(minutes).padStart(2, '0')}:
                                                                  ${String(seconds).padStart(2, '0')}`
                              }/>
                            </h2>
                        </div>
                        : <div className='flex gap-1 text-text/60 hover:text-text/75 items-center  cursor-pointer ' onClick={() => handleDateClick(contest)}>
                          <CalendarDays className=' w-4.5 h-4.5'/>
                          <p className='text-text/60 hover:text-text/75 underline tracking-wide text-sm '>{viewDate(date(contest)).full}</p>
                        </div>
                        }
                      </div>
                      <div className='flex flex-col gap-2 items-center my-auto'>
                        {
                          !registeredContests?.some((e) => e.id == contest.id)
                          ?  <Button variant={'outline'} className='border-red-500 border-2 text-red-500 h-7 w-30 rounded-sm ' onClick={() => handleNewRegister(contest)}>Register</Button>
                          : isRunnning(contest) 
                          ?  <Button variant={'outline'} className='border-red-500 border-2 text-red-500 h-7 w-30 rounded-sm ' onClick={() => navigate(`/contest/${contest.id}/official`)}>Enter</Button>
                          : <div className='w-25 h-6 rounded-md bg-green-400 flex items-center justify-center'>
                              <h4 className='text-green-700 text-sm font-medium text-center'>registered</h4>
                            </div>
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

            {/* Past contests */}
            <div className='full'>
              {/* Past Header */}
              <div className='flex place-content-between mb-2'>
                <div className='flex gap-2 items-center'>
                  <Archive className='font-semibold w-5.5 h-5.5'/>
                  <h1 className='font-semibold text-xl'>Past Contests</h1>
                </div>
              </div>
              {/* Past Body */}
              <Card className='border-border p-4 '>
                {pastContests && pastContests.map((contest) => (
                  <Card className={`border-border w-full px-2 border-l-4 border-l-text/60  rounded-l-md`} key={contest.id} >
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
                        : <div className='flex gap-1 text-text/60 hover:text-text/75 items-center  cursor-pointer ' onClick={() => handleDateClick(contest)}>
                          <CalendarDays className=' w-4.5 h-4.5'/>
                          <p className='text-text/60 hover:text-text/75 underline tracking-wide text-sm '>{viewDate(date(contest)).full}</p>
                        </div>
                        }
                      </div>
                      <div className='flex flex-col gap-2 items-center my-auto'>
                        {
                          !unofficiallyRegisteredContests?.some((e) => e.id == contest.id)
                          ?  <Button variant={'outline'} className='border-primary border-2 text-primary h-7 w-30 rounded-sm ' onClick={() => handleAttempt(contest)}>Attempt</Button>
                          : <Button variant={'outline'} className='border-secondary border-2 text-secondary h-7 w-30 rounded-sm ' onClick={() => navigate(`/contest/${contest.id}/none`)}>Review</Button>
                        } 
                        <div className='flex gap-2 items-center'>
                          <Users className='text-text/60 w-4 h-4'/>
                          <p className='text-text/60 text-sm'>{contest.registered + contest.unofficiallyRegistered} ({contest.registered}) registered</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </Card>
            </div>
          </div>
          <div className='col-span-4'>
            
          </div>
        </div>
    </div>
  );
};

export default Contests;
