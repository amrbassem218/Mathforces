import * as React from 'react';
import { Button } from './ui/button';
import { collection, doc, DocumentData, DocumentSnapshot, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Problem } from 'types';

interface IProblemSetGetterProps {
}
const ServerManipulator: React.FunctionComponent<IProblemSetGetterProps> = (props) => {
    const handleGetProblemsFromContests = async() => {
      console.log("clicked");
        let problems: Record<string, DocumentData[]> = {};
        const contestsSnap = await getDocs(collection(db, "contests"));
        for(const contest of contestsSnap.docs){
          const contestData = contest.data();
          console.log(contestData);
          const problemsSnap = await getDocs(collection(db, "contests", contest.id, "problems"));
          for(const problem of problemsSnap.docs){
            const problemData = problem.data();
            if(problems[contestData.name]){
              // problems[contestData.name] = [...problems[contestData.name], problem.data()];
              problems[contestData.name].push(problemData);
            }
            else{
              problems[contestData.name] = [problemData];
            }
          }
        }
        console.log(problems);
        for(let contest of Object.keys(problems)){
          for(let problem of problems[contest]){
            await setDoc(doc(db, "problemSet", `${contest}-${problem.name}`), {
              ...problem,
              name: `${contest}-${problem.name}`,
            })
          }
        }
    }
    const handleAssignDifficulty = async() => {
      const rand = () => {
        const max = 3500;
        const min = 700;
        return Math.floor(Math.random() * (max-min + 1)) + min; // very unnecessary but cool so meh
      }
      let problemsSnap = await getDocs(collection(db, "problemSet"));
      let problems: Problem[] = [];
      for(const problem of problemsSnap.docs){
        const problemData = problem.data();
        await setDoc(doc(db, "problemSet", problem.id), {
          difficulty: rand()
        }, {merge: true})
      }
    }
    const handleAssignAnswered = async() => {
      const rand = () => {
        const max = 10;
        const min = 1;
        return Math.floor(Math.random() * (max-min + 1)) + min; // very unnecessary but cool so meh
      }
      let problemsSnap = await getDocs(collection(db, "problemSet"));
      let problems: Problem[] = [];
      for(const problem of problemsSnap.docs){
        const problemData = problem.data();
        await setDoc(doc(db, "problemSet", problem.id), {
          answered: rand()
        }, {merge: true})
      }
    }
  return (
    // <Button onClick={() => handleGetProblemsFromContests()}>click Me!</Button>
    // <Button onClick={() => handleAssignDifficulty()}>click Me!</Button>
    <Button onClick={() => handleAssignAnswered()}>click Me!</Button>
  );
};

export default ServerManipulator;
