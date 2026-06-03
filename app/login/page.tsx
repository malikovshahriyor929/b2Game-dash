"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiLockPasswordLine, RiShieldUserLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mockUsers } from "@/lib/mock-data";

function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("superadmin@b2game.uz");
  const [password, setPassword] = useState("superadmin123");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    if (result?.error) {
      setError("Login yoki parol noto'g'ri");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#12345a,transparent_34%),#070b15] p-6">
      <Card className="w-full max-w-md border-sky-500/20 bg-slate-950/88">
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-xl font-black text-slate-950">B2</div>
            <div>
              <CardTitle>B2 Game Club</CardTitle>
              <CardDescription>Admin paneliga kirish</CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockUsers.map((user) => (
              <Badge key={user.id} variant="muted">{user.role}: {user.email}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <RiShieldUserLine className="absolute left-3 top-3 text-slate-500" />
                <Input className="pl-9" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-3 text-slate-500" />
                <Input className="pl-9" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button className="w-full" type="submit">Kirish</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#070b15] text-slate-100">Loading...</main>}>
      <LoginPanel />
    </Suspense>
  );
}
