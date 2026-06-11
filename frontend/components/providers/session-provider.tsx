"use client";

import { useEffect } from "react";
import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, signOut } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { isAxiosError } from "axios";
import { appAxiosInstance, axiosInstance, axiosMessage } from "@/server/api";

export function SessionProvider({ children, session }: { children: React.ReactNode; session: Session | null }) {
  useEffect(() => {
    let signingOut = false;
    const handleApiError = (error: unknown) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401 && !signingOut) {
        signingOut = true;
        toast.error("Sessiya tugadi. Qaytadan kiring.");
        void signOut({ callbackUrl: "/login" });
      } else if (isAxiosError(error)) {
        toast.error(axiosMessage(error));
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
      return Promise.reject(error);
    };

    const backendInterceptor = axiosInstance.interceptors.response.use(undefined, handleApiError);
    const appInterceptor = appAxiosInstance.interceptors.response.use(undefined, handleApiError);

    return () => {
      axiosInstance.interceptors.response.eject(backendInterceptor);
      appAxiosInstance.interceptors.response.eject(appInterceptor);
    };
  }, []);

  return (
    <NextAuthSessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus>
      <Toaster richColors closeButton theme="dark" position="top-right" />
      {children}
    </NextAuthSessionProvider>
  );
}
