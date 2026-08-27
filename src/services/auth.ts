import type {
  AuthError,
  Session,
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "../lib/supabase";


/* ==========================================================
   AUTH 001
   Current session
   ========================================================== */


export async function getCurrentSession():
Promise<Session | null> {

  const {
    data: {
      session,
    },
  } =
    await supabase.auth.getSession();


  return session;

}


export async function getCurrentUser():
Promise<User | null> {

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  return user;

}


/* ==========================================================
   AUTH 002
   Google OAuth
   Mirrors the current OTLES desktop flow
   ========================================================== */


export async function signInWithGoogle(
  redirectPath = window.location.pathname || "/",
) {

  return supabase.auth.signInWithOAuth({

    provider: "google",

    options: {

      redirectTo:
        `${window.location.origin}${redirectPath}`,

    },

  });

}


/* ==========================================================
   AUTH 003
   Email/password sign in
   ========================================================== */


export async function signIn(
  email: string,
  password: string,
): Promise<AuthError | null> {

  const {
    error,
  } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });


  return error;

}


/* ==========================================================
   AUTH 004
   Sign out
   ========================================================== */


export async function signOut():
Promise<AuthError | null> {

  const {
    error,
  } =
    await supabase.auth.signOut();


  return error;

}


/* ==========================================================
   AUTH 005
   Authentication state listener
   ========================================================== */


export function onAuthStateChange(
  callback: (
    event: string,
    session: Session | null,
  ) => void,
) {

  return supabase.auth.onAuthStateChange(
    callback,
  );

}
