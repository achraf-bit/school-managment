"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 lg:space-y-8 rounded-lg bg-white p-6 lg:p-8 shadow">
        <div>
          <h2 className="text-center text-2xl lg:text-3xl font-bold">Sign in</h2>
        </div>
        <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border p-2 text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border p-2 text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-2.5 text-white hover:bg-primary/90 text-base"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
