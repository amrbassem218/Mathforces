import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Header from '@/components/ui/Header';
import { collection, doc, DocumentData, getDocs, setDoc } from 'firebase/firestore';
import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebaseConfig';
// import { CiWavePulse1 } from "react-icons/ci";
import { Activity } from 'lucide-react';

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
  const isRunnning = (contest: DocumentData): boolean => {
    if(contest){
      const now = new Date();
      const contestDate = new Date(contest.date);
      const contestEnd = new Date(contestDate.getTime() + contest.length * 60 * 60 * 1000)
      if(now > contest.date && now < contestEnd){
        return true;
      }
    }
    return false;
  }
  // const contestStatus = useMemo(() => isRunnning(), [])
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
              <Card className='border-border p-4 w-full'>
                {upcomingContests && upcomingContests.map((contest) => (
                  <Card className='border-border w-full' key={contest.id}>
                    <div className='flex flex-row place-space-between gap-10'>
                      <CardHeader className='font-medium text-xl text-left flex-1'>{contest.name}</CardHeader>
                      <CardContent>
                          {
                            registeredContests?.some((e) => e.id == contest.id) 
                            ? <div className='w-32 rounded-md bg-green-400 m-auto'><h4 className='text-green-700 font-medium'>registered</h4></div>
                            : <Button variant={'outline'} className='border-red-500 text-red-500 h-7 rounded-sm' onClick={() => handleNewRegister(contest)}>Register</Button>
                          }
                      </CardContent>
                    </div>
                    <div>
                      {isRunnning(contest)
                      ? <div>
                        <div className='w-5 h-5 rounded-full bg-red-600 '></div>
                      </div>
                      : <div></div>
                      }
                    </div>
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
