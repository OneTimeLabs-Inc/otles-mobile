import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import {
  getCurrentSession,
  getCurrentUser,
  onAuthStateChange,
} from "../services/auth";

import {
  provisionPlatformUser,
} from "../services/platformUser";


/* ==========================================================
   AUTH CONTEXT 001
   Shared mobile authentication state
   ========================================================== */


type AuthContextType = {

  isLoading: boolean;

  session: Session | null;

  user: User | null;

};


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );


type Props = {

  children: ReactNode;

};


/* ==========================================================
   AUTH PROVIDER 002
   Restore and monitor the OTLES session
   ========================================================== */


export function AuthProvider({
  children,
}: Props) {

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);


  const [
    session,
    setSession,
  ] =
    useState<Session | null>(null);


  const [
    user,
    setUser,
  ] =
    useState<User | null>(null);


  useEffect(() => {

    async function initialize() {

      try {

        const currentSession =
          await getCurrentSession();


        const currentUser =
          await getCurrentUser();


        if (currentUser) {

          try {

            await provisionPlatformUser();

          }
          catch (error) {

            console.error(
              "Unable to provision platform user:",
              error,
            );

          }

        }


        setSession(
          currentSession,
        );


        setUser(
          currentUser,
        );

      }
      catch (error) {

        console.error(
          "Unable to initialize authentication:",
          error,
        );

      }
      finally {

        setIsLoading(
          false,
        );

      }

    }


    void initialize();


    const {
      data: {
        subscription,
      },
    } =
      onAuthStateChange(
        async (
          _event,
          nextSession,
        ) => {

          if (nextSession?.user) {

            try {

              await provisionPlatformUser();

            }
            catch (error) {

              console.error(
                "Unable to provision platform user:",
                error,
              );

            }

          }


          setSession(
            nextSession,
          );


          setUser(
            nextSession?.user ??
            null,
          );

        },
      );


    return () => {

      subscription.unsubscribe();

    };

  }, []);


  return (

    <AuthContext.Provider
      value={{
        isLoading,
        session,
        user,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


/* ==========================================================
   AUTH CONTEXT 003
   Consumer hook
   ========================================================== */


export function useAuthContext() {

  const context =
    useContext(
      AuthContext,
    );


  if (!context) {

    throw new Error(
      "useAuthContext must be used inside an AuthProvider.",
    );

  }


  return context;

}
