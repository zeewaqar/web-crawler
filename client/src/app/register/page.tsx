"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {apiBase} from "@/features/urls/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${apiBase()}/api/v1/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email, password: pass}),
    });
    if (r.ok) {
      router.push("/login?registered=1");
    } else {
      const {error} = await r.json().catch(() => ({error: "error"}));
      setErr(error ?? "failed");
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="password (min 6 chars)"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <Button className="w-full">Register</Button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="text-sm mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600">
          Log in
        </a>
      </p>
    </main>
  );
}
