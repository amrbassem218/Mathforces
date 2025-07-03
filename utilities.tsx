import { User } from "firebase/auth";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import * as React from "react";
import { useState, useEffect } from "react";
export const contestEndTime = (contest: DocumentData): Date => {
  const contestDate = contest.date.toDate();
  const contestEnd = new Date(
    contestDate.getTime() + contest.length * 60 * 60 * 1000
  );
  return contestEnd;
};

export const ended = (contest: DocumentData): boolean => {
  const now = new Date();
  return contestEndTime(contest) < now;
};

export const isRunnning = (contest: DocumentData, userId?: string) => {
  if (contest) {
    // getting the date of unofficially registered contest
    if (userId) {
      const now = new Date();
      const getContestDate = async () => {
        const unofficialContestSnap = await getDoc(
          doc(db, "users", userId, "unofficialContests", contest.id)
        );
        return unofficialContestSnap.data()?.date;
      };
      getContestDate().then((contestDate) => {
        if (now > contestDate && now < contestEndTime(contest)) {
          return true;
        }
      });
    } else {
      const now = new Date();
      const contestDate = contest.date.toDate();
      if (now > contestDate && now < contestEndTime(contest)) {
        return true;
      }
    }
  }
  return false;
};

export const viewDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-qz", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const dateParts = formatter.formatToParts(date);
  const part = (p: string) => {
    return dateParts.find((e) => e.type == p)?.value;
  };
  let formattedDate = part("month") + "/" + part("day") + "/" + part("year");
  let fullDate = part("weekday")?.slice(0, 3) + " " + formattedDate;
  let time = part("hour") + ":" + part("minute");
  // console.log(datePart);
  return {
    full: fullDate + " " + time,
    dateFull: fullDate,
    date: formattedDate,
    timeFull: time + part("dayPeriod"),
    time: time,
    dateParts: dateParts,
    part: part,
  };
};
export const viewTime = (duration: number) => {
  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let hoursFormatted = `${String(hours).padStart(2, "0")}`;
  let minutesFormatted = `${String(minutes).padStart(2, "0")}`;
  let secondsFormatted = `${String(seconds).padStart(2, "0")}`;
  let hoursAndMinutes = `${hoursFormatted}:${minutesFormatted}`;
  let minutesAndSeconds = `${minutesFormatted}:${secondsFormatted}`;
  let full = `${hoursFormatted}:${minutesFormatted}:${secondsFormatted}`;
  return { hoursAndMinutes, minutesAndSeconds, full };
};
export const getDate = (contest: DocumentData) => {
  return contest.date.toDate();
};

export const formattedRule = (rule: string) => {
  let count = 0;
  let res: React.ReactNode[] = [];
  let spanText = "";
  let currentText = "";
  let flag = false;

  for (let ch of rule) {
    if (ch === "*") {
      count++;
      if (count === 2) {
        count = 0;
        flag = !flag;
        if (flag) {
          res.push(currentText);
          currentText = "";
        } else {
          res.push(<span key={res.length}>{spanText}</span>);
          spanText = "";
        }
      }
      continue;
    }

    if (flag) {
      spanText += ch;
    } else {
      currentText += ch;
    }
  }

  if (currentText) res.push(currentText);
  if (spanText) res.push(<span key={res.length}>{spanText}</span>);

  return <>{res}</>;
};
export const title = (rating: number) => {
  if (rating < 1200) {
    return { name: "Beginner", bg: "bg-gray-700/70", text: "text-text/60" };
  } else if (rating < 1400) {
    return { name: "Student", bg: "bg-green-700/70", text: "text-green-700" };
  } else if (rating < 1600) {
    return { name: "Specialist", bg: "bg-cyan-700/70", text: "text-cyan-700" };
  } else if (rating < 1800) {
    return { name: "Expert", bg: "bg-blue-700/70", text: "text-blue-700" };
  } else if (rating < 2000) {
    return {
      name: "Cd. Master",
      bg: "bg-purple-700/70",
      text: "text-purple-700",
    };
  } else if (rating < 2500) {
    return { name: "Master", bg: "bg-orange-700/70", text: "text-orange-700" };
  }
  // else if(rating < 3000){
  // }
  return { name: "Gr. Master", bg: "bg-red-700/70", text: "text-red-700" };
};

export const rand = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min; // very unnecessary but cool so meh
};

export default function useSetTitle(title: string) {
  useEffect(() => {
    document.title = `Mathforces - ${title}`;
  }, [title]);
}

export const timeAndDate = (date: Date) => {
  const { part } = viewDate(date);
  window.open(
    `https://www.timeanddate.com/worldclock/fixedtime.html?day=${part("day")}&month=${part("month")}&year=${part("year")}&hour=${(part("dayPeriod") == "AM" || Number(part("hour")) == 12) ? part("hour") : (Number(part("hour")) + 12).toString()}&min=${part("minute")}&sec=0`,
    "_blank"
  );
};
