import { TUser } from "@/app/studio/types";

export function getUserPlanMinutes(userPlan: TUser["userPlan"]) {
  let minutesProvided = undefined
  switch (userPlan) {
    case "free":
      minutesProvided = 60;
      break;
    case "lite":
      minutesProvided = 900;
      break;
    case "pro":
      minutesProvided = 2100;
      break;
    case "max":
      minutesProvided = 9000;
      break;
    /*
    case "enterprise":
      minutesProvided = 10000; //idk yet
      break;
    */
  }

  if (minutesProvided === undefined) {
    throw new Error("Unable to get minutes analyzed for user plan.")
  }
  return minutesProvided
}