import * as React from 'react';
import { Button } from './ui/button';
import { collection, doc, DocumentData, DocumentSnapshot, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface IProblemSetGetterProps {
}
const ProblemSetGetter: React.FunctionComponent<IProblemSetGetterProps> = (props) => {
    const handleClick = async() => {
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
  return (
    <Button onClick={() => handleClick()}>click Me!</Button>
  );
};

export default ProblemSetGetter;
