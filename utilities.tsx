import { collection, doc, DocumentData, getDocs, setDoc } from 'firebase/firestore';
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

export const isRunnning = (contest: DocumentData): boolean => {
    if(contest){
      const now = new Date();
      const contestDate = contest.date.toDate();
      if(now > contestDate && now < contestEndTime(contest)){
        return true;
      }
    }
    return false;
}