import * as React from "react";
import { Button } from "./ui/button";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { Problem } from "types";
import { rand, title } from "../../utilities";
import { readFileSync } from 'fs';
import { formatTex } from "../../texFormatter";
import { useProblems } from "../../texconverter";
interface IProblemSetGetterProps {}
const ServerManipulator: React.FunctionComponent<IProblemSetGetterProps> = (
  props,
) => {
  const handleGetProblemsFromContests = async () => {
    const usersSnap = await getDocs(collection(db, "users"));
    let users: DocumentData[] = [];
    for(const user of usersSnap.docs){
      const userData = user.data();
      users.push(userData);
    }
    console.log("clicked");
    let problems: Record<string, DocumentData[]> = {};
    const contestsSnap = await getDocs(collection(db, "contests"));
    for (const contest of contestsSnap.docs) {
      const contestData = contest.data();
      console.log(contestData);
      const problemsSnap = await getDocs(
        collection(db, "contests", contest.id, "problems"),
      );
      for (const problem of problemsSnap.docs) {
        const problemData = problem.data();
        if (problems[contestData.name]) {
          // problems[contestData.name] = [...problems[contestData.name], problem.data()];
          problems[contestData.name].push({
            ...problemData, 
            name: problemData.name,
            contestName: contestData.name,
            nameFull: `${problemData.name}-${contestData.name}`,
            contestId: contest.id, 
            date: contestData.date,
            difficulty: rand(700, 3500),
            answered: rand(1, 10),
            author: users[rand(0,users.length-1)].username
          });
        } else {
          problems[contestData.name] = [problemData];
        }
      }
    }
    console.log(problems);
    for (let contest of Object.keys(problems)) {
      for (let problem of problems[contest]) {
        await setDoc(doc(db, "problemSet", `${problem.name}-${contest}`), problem);
      }
    }
  };
  const handleAssignDifficulty = async () => {
    let problemsSnap = await getDocs(collection(db, "problemSet"));
    let problems: Problem[] = [];
    for (const problem of problemsSnap.docs) {
      const problemData = problem.data();
      await setDoc(
        doc(db, "problemSet", problem.id),
        {
          difficulty: rand(700, 3500),
          answered: rand(1, 10),
        },
        { merge: true },
      );
    }
  };
  // const handleAssignAnswered = async() => {
  //   let problemsSnap = await getDocs(collection(db, "problemSet"));
  //   let problems: Problem[] = [];
  //   for(const problem of problemsSnap.docs){
  //     const problemData = problem.data();
  //     await setDoc(doc(db, "problemSet", problem.id), {
  //     }, {merge: true})
  //   }
  // }
  const handleAddContests = async() => {
    const userSnap = await getDoc(doc(db,"users", "uuN2fGLbnpQfizvf3emCQqITBYJ3"));
    let contestId = 182;
    while(contestId > 175){
      await setDoc(doc(db, "users", "uuN2fGLbnpQfizvf3emCQqITBYJ3", "officialContests", contestId.toString()), {
        id: contestId.toString(),
        name: `contest_${contestId}`
      })
      contestId--;
    }
  }
  const handleAssignRating = async () => {
    const usersSanp = await getDocs(collection(db, "users"));
    for (const user of usersSanp.docs) {
      const randRate = rand(800, 2200);
      const contestsSnap = await getDocs(collection(db, "users", user.id, "officialContests"));
      for(const contest of contestsSnap.docs){
        const contestData = contest.data();

      }
    }
  };
  const handleDeleteProblems = async() => {
    const problems = await getDocs(collection(db, "problemSet"));
    for (let problem of problems.docs){
      const problemData = problem.data();
      if(problemData.difficulty == "easy"){
        deleteDoc(doc(db,"problemSet",problem.id));
      }
    }
  }
  const handleDeleteContests = async() => {
    let counter = 0;
    const contestsSnap = await getDocs(collection(db, "contests"));
    for(let contest of contestsSnap.docs){
      if(counter < 10){
        deleteDoc(doc(db, "contests", contest.id));
        counter++;
      }
    }
  }
  const [formattedTex, setFormattedTex] = React.useState("");
  const {problems: explanations} = useProblems({formattedTex});
  React.useEffect(() => {
    if(formattedTex){
      const finish = async() => {
        const contests = await getDocs(collection(db, "contests"));
        for(let contest of contests.docs){
          const contestProblems = await getDocs(collection(db, "contests", contest.id, "problems"));
          for(let contestProblem of contestProblems.docs){
            console.log(explanations[contestProblem.id])
            await updateDoc(doc(db, "contests", contest.id, "problems", contestProblem.id), {
              explanation: explanations[contestProblem.id]
            })
          }
        }
      }
      finish();
    }
  }, [formattedTex])
  const handleAssingExplanation = async() => {
    await fetch('/2020s.tex').then(async(tex) => {
      const texString = await tex.text();
      const formattedTexTemp = formatTex(texString);
      setFormattedTex(formattedTexTemp);
    })
  }

  return (
    // <Button onClick={() => handleGetProblemsFromContests()}>click Me!</Button>
    // <Button onClick={() => handleAssignDifficulty()}>click Me!</Button>
    // <Button onClick={() => handleAssignAnswered()}>click Me!</Button>
    // <Button onClick={() => handleAssignRating()}>click Me!</Button>
    // <Button onClick={() => handleDelete()}>click Me!</Button>
    <Button onClick={() => handleAssingExplanation()}>click Me!</Button>

  );
};

export default ServerManipulator;
