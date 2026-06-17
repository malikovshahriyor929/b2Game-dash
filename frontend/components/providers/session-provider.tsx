"use client";

import { useEffect } from "react";
import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, signOut } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import { isAxiosError } from "axios";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#0f172a", color: "#e2e8f0", border: "1px solid #1e293b" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#0f172a" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#0f172a" } },
        }}
      />
      <TooltipProvider delayDuration={150}>
        <ConfirmProvider>{children}</ConfirmProvider>
      </TooltipProvider>
    </NextAuthSessionProvider>
  );
}
