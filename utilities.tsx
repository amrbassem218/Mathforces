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

export const viewDate = (date:Date) => {
    const formatter = new Intl.DateTimeFormat("en-qz", {
      dateStyle: "full",
      timeStyle: "short",
    })
    const dateParts = formatter.formatToParts(date);
    const part = (p: string) => {
      return dateParts.find(e => e.type == p)?.value
    }
    let formattedDate = part("weekday")?.slice(0,3) + " " +  part("month") + "/" + part("day") + "/" +  part("year");
    let time = part("hour") + ":" + part("minute");
    // console.log(datePart);
    return {full: formattedDate + " " + time, date: formattedDate, timeFull: time  + part("dayPeriod"), time: time, dateParts: dateParts, part: part};
}
export const viewTime = (duration: number) => {
    const totalSeconds = Math.floor(duration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600)  / 60); 
    const seconds = totalSeconds % 60;
    let hoursFormatted = `${String(hours).padStart(2,'0')}`
    let minutesFormatted = `${String(minutes).padStart(2,'0')}`;
    let secondsFormatted = `${String(seconds).padStart(2,'0')}`;
    let hoursAndMinutes = `${hoursFormatted}:${minutesFormatted}`;
    let minutesAndSeconds = `${minutesFormatted}:${secondsFormatted}`;
    let full = `${hoursFormatted}:${minutesFormatted}:${secondsFormatted}`;
    return {hoursAndMinutes, minutesAndSeconds, full}
}
export const date = (contest: DocumentData) => {
    return contest.date.toDate();
}