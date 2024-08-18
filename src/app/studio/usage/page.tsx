"use client"

import { db } from "@/config/firebase";
import { UserAuth } from "@/context/AuthContext";
import { getUserMinutesAnalyzed } from "@/utils/getUserMinutesAnalyzed";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function UsagePage() {
  const { user } = UserAuth() as { user: any };
  const [userPlan, setUserPlan] = useState(undefined);
  const [minutesAnalyzed, setMinutesAnalyzed] = useState(undefined);

  useEffect(() => {
    const userDocRef = doc(db, "users", user.email);

    const unsubscribe = onSnapshot(userDocRef, async (snapshot) => {
      const userDoc = snapshot.data();

      const userPlan = userDoc?.userPlan;
      if (userPlan) {
        setUserPlan(userPlan);
      }

      const minutesAnalyzed = userDoc?.minutesAnalyzed;
      if (minutesAnalyzed) {
        setMinutesAnalyzed(minutesAnalyzed);
      }
    });
    return () => unsubscribe();
  }, []);

  let minutesProvided;
  if (userPlan) {
    minutesProvided = getUserMinutesAnalyzed(userPlan);
  }

  return (
    <div className="">{`${minutesAnalyzed} / ${minutesProvided}`}</div>
  )
}