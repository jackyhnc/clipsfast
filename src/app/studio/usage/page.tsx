"use client";

import { db } from "@/config/firebase";
import { UserAuth } from "@/context/AuthContext";
import { getUserPlanMinutes } from "@/utils/getUserPlanMinutes";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TUser } from "../types";

export default function UsagePage() {
  const { user, userData } = UserAuth() as { user: any; userData: TUser };
  const [userPlan, setUserPlan] = useState<TUser["userPlan"] | undefined>(undefined);
  const [minutesProvided, setMinutesProvided] = useState<number | undefined>(undefined);
  const [minutesAnalyzedThisMonth, setMinutesAnalyzedThisMonth] = useState<number | undefined>(undefined);
  const [minutesAnalyzedLifetime, setMinutesAnalyzedLifetime] = useState<number | undefined>(undefined);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!userData) {
      return
    }

    setUserPlan(userData.userPlan);

    const minutesProvided = getUserPlanMinutes(userData.userPlan) ?? undefined
    setMinutesProvided(minutesProvided);

    setMinutesAnalyzedThisMonth(userData.minutesAnalyzedThisMonth);

    setMinutesAnalyzedLifetime(userData.lifetimeMinutesAnalyzed)
    
    setProgress(minutesProvided ? (userData.minutesAnalyzedThisMonth / minutesProvided) * 100 : 0);
  }, [user.email, userData]);

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <header className="py-4 px-6">
        <div className="mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Usage Overview</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-6">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Plan: {userPlan?.toLocaleUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{`${minutesProvided ?? "?"} minutes of AI video analysis`}</div>
                <div className="text-muted-foreground text-sm">Monthly Plan</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{`${minutesAnalyzedThisMonth} minutes already analyzed`}</div>
                <div className="text-muted-foreground text-sm">{`of ${minutesProvided} minutes available`}</div>
              </div>
              <Progress value={progress} aria-label="75% used this month" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lifetime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold">{`${minutesAnalyzedLifetime ?? "?"} minutes of AI video analysis`}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
