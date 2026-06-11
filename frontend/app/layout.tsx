import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { authOptions } from "@/lib/auth";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "B2 Game Club",
  description: "Admin dashboard for B2 Game Club",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="uz" className={cn("dark", "font-sans", geist.variable)}>
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
