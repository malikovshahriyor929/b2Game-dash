import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "B2 Game Club",
  description: "Admin dashboard for B2 Game Club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className="dark">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
