// src/app/register/page.tsx
"use client";

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

import {apiBase} from "@/features/urls/api";

// ─── Zod schema: just email + password ───────────────────────────────
const RegisterSchema = z.object({
  // nonempty + email()
  email: z
    .email()
    .nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type RegisterFormValues = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const res = await fetch(`${apiBase()}/api/v1/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.replace("/login?ok=1");
    } else {
      const {error} = await res
        .json()
        .catch(() => ({error: "Registration failed"}));
      alert(error);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardHeader>
        <CardTitle className="text-2xl">Create a new account</CardTitle>
        <CardDescription>Sign up to start crawling pages.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
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
              placeholder="Minimum 6 characters"
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
            {isSubmitting ? "Registering…" : "Register"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
