"use client";

import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { RiLockPasswordLine, RiShieldUserLine } from "react-icons/ri";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email kiriting").email("Email formati noto'g'ri"),
  password: z.string().min(1, "Parol kiriting").min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const result = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
      callbackUrl,
    });
    if (result?.error) {
      const message = "Login yoki parol noto'g'ri";
      setError("root", { message });
      toast.error(message);
      return;
    }
    toast.success("Tizimga kirildi");
    router.push(callbackUrl);
    router.refresh();
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
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <RiShieldUserLine className="absolute left-3 top-3 text-slate-500" />
                <Input
                  id="email"
                  className="pl-9"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </div>
              {errors.email ? <p className="text-sm text-red-300">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-3 text-slate-500" />
                <Input
                  id="password"
                  className="pl-9"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
              </div>
              {errors.password ? <p className="text-sm text-red-300">{errors.password.message}</p> : null}
            </div>
            {errors.root ? <p className="text-sm text-red-300">{errors.root.message}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#070b15] text-slate-100"><div className="w-[min(92vw,420px)] space-y-4 rounded-2xl border border-slate-800 bg-slate-900/72 p-6"><Skeleton className="h-7 w-40" /><Skeleton className="h-4 w-56" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full rounded-xl" /></div></main>}>
      <LoginPanel />
    </Suspense>
  );
}
