// src/app/login/page.tsx
"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {useAuth} from "@/lib/auth";
import {apiBase} from "@/features/urls/api";

// ─── Zod schema ─────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z
    .email({message: "Invalid email"}) // static helper, not deprecated
    .nonempty("Email is required"), // emptiness check
  password: z.string().min(1, "Password is required"),
});
type LoginData = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const {token, setToken} = useAuth();

  // if someone hits /login while already authed, send them to /dashboard
  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginData) {
    const res = await fetch(`${apiBase()}/api/v1/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const {token} = await res.json();
      setToken(token);
      router.replace("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Enter your credentials.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center">
        <p className="text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
