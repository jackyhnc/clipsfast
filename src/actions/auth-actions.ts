//do this session shit later

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createSession(uid: string) {
  cookies().set("user-session", uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // One day
    path: '/',
  });

  redirect("/");
}

export async function removeSession() {
  cookies().delete("user-session");

  redirect("/");
}