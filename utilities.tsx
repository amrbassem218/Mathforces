import { User } from 'firebase/auth';
import { collection, doc, DocumentData, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as React from 'react';

export const contestEndTime = (contest: DocumentData): Date => {
    const contestDate = contest.date.toDate();
    const contestEnd = new Date(contestDate.getTime() + contest.length * 60 * 60 * 1000)
    return contestEnd;
}

export const ended = (contest: DocumentData): boolean => {
    const now = new Date();
    return contestEndTime(contest) < now;
}

export const isRunnning = (contest: DocumentData, userId?: string) => {
    if(contest){
        // getting the date of unofficially registered contest
        if(userId){
            const now = new Date();
            const getContestDate = async() => {
                const unofficialContestSnap = await getDoc(doc(db, "users", userId, "unofficialContests", contest.id));
                return unofficialContestSnap.data()?.date;
            }
            getContestDate().then((contestDate)=> {
                if(now > contestDate && now < contestEndTime(contest)){
                  return true;
                }
            })
        }
        else{
            const now = new Date();
            const contestDate = contest.date.toDate();
            if(now > contestDate && now < contestEndTime(contest)){
              return true;
            }
        }
    }
    return false;
}