import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Header from '@/components/ui/Header';
import { collection, doc, DocumentData, getDocs, setDoc } from 'firebase/firestore';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebaseConfig';

const Contests: React.FunctionComponent = () => {
  const [pastContests, setPastContests] = useState<DocumentData[] | null>(null);
  const [upcomingContests, setUpcomingContests] = useState<DocumentData[] | null>(null);
  const [registeredContests, setRegisteredContests] = useState<DocumentData[] | null>(null);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const getContests = async() => {
      const contestSnap = await getDocs(collection(db, "contests"));
      const pastContestTemp: DocumentData[] = [];
      const upcomingContestTemp: DocumentData[] = [];
      contestSnap.forEach((contest) => {
        const contestData = contest.data();
        if(contestData.ended === true) {
          pastContestTemp.push(contestData);
        } else {
          upcomingContestTemp.push(contestData);
        }
      });
      setPastContests(pastContestTemp);
      setUpcomingContests(upcomingContestTemp);
    };

    if(user) {
      const getRegisteredContests = async() => {
        const registeredContestsSnap = await getDocs(collection(db, "users", user.uid, "contests"));
        registeredContestsSnap.forEach((contest) => {
          const contestData = contest.data();
          if(registeredContests) {
            setRegisteredContests([...registeredContests, contestData]);
          } else {
            setRegisteredContests([contestData]);
          }
        });
      };
      getRegisteredContests();
    }
    getContests();
  }, [db, user, registeredContests]);

  const handleNewRegister = async(contest: DocumentData) => {
    if(user) {
      await setDoc(doc(db, "users", user.uid, "contests", contest.id), {
        name: contest.name,
        id: contest.id,
        answered: []
      });
      if(registeredContests) {
        setRegisteredContests([...registeredContests, contest]);
      } else {
        setRegisteredContests([contest]);
      }
    } else {
      navigate('/login');
    }
  };

  const handleCreateContest = () => {
    if(user) {
      navigate('/create-contest');
    } else {
      navigate('/login');
    }
  };

  if(loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <Header login={"full"} signup={"outline"}/>
      <div className='grid grid-cols-12'>
        <div className='col-span-8'>
          <div className='flex'>
            <h1>Live & Upcoming Contests</h1>
            <Button onClick={handleCreateContest}>Create Your own</Button>
          </div>
          <Card className='border-border'>
            {upcomingContests && upcomingContests.map((contest) => (
              <Card className='border-border' key={contest.id}>
                <CardHeader>{contest.name}</CardHeader>
                <CardContent>
                  {registeredContests?.find((contest2) => contest2.id === contest.id) === undefined 
                    ? <Button onClick={() => handleNewRegister(contest)}>Register</Button>
                    : <div className='w-32 rounded-md bg-green-400 m-auto'>
                        <h4 className='text-green-700 font-medium'>registered</h4>
                      </div>
                  }
                </CardContent>
              </Card>
            ))}
          </Card>
          <h1>Past Contests</h1>
          <Card className='border-border p-5'>
            {pastContests && pastContests.map((contest) => (
              <Card className='border-border' key={contest.id}>
                <CardHeader>{contest.name}</CardHeader>
                <CardContent>
                  <Button onClick={() => navigate(`/contest/${contest.id}`)}>
                    {registeredContests?.find((contest2) => contest2.id === contest.id) === undefined ? "Review" : "Attempt"}
                  </Button>
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
