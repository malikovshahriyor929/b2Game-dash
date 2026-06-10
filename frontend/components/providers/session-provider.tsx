"use client";

import { useEffect } from "react";
import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, signOut } from "next-auth/react";
import { appAxiosInstance, axiosInstance } from "@/server/api";

export function SessionProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  useEffect(() => {
    let signingOut = false;
    const logoutOnUnauthorized = (error: unknown) => {
      const status = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

      if (status === 401 && !signingOut) {
        signingOut = true;
        void signOut({ callbackUrl: "/login" });
      }
      return Promise.reject(error);
    };

    const backendInterceptor = axiosInstance.interceptors.response.use(undefined, logoutOnUnauthorized);
    const appInterceptor = appAxiosInstance.interceptors.response.use(undefined, logoutOnUnauthorized);

    return () => {
      axiosInstance.interceptors.response.eject(backendInterceptor);
      appAxiosInstance.interceptors.response.eject(appInterceptor);
    };
  }, []);

  return (
    <NextAuthSessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus>
      {children}
    </NextAuthSessionProvider>
  );
}
