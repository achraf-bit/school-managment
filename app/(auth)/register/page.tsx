"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolEmail: "",
    schoolPhone: "",
    schoolAddress: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/login");
    } else {
      setError(data.error?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow">
        <h2 className="text-center text-3xl font-bold">Register School</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          
          <div className="space-y-4">
            <h3 className="font-semibold">School Information</h3>
            <input
              placeholder="School Name"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full rounded border p-2"
              required
            />
            <input
              type="email"
              placeholder="School Email"
              value={formData.schoolEmail}
              onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
              className="w-full rounded border p-2"
              required
            />
            <input
              placeholder="School Phone"
              value={formData.schoolPhone}
              onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
              className="w-full rounded border p-2"
              required
            />
            <input
              placeholder="School Address"
              value={formData.schoolAddress}
              onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Admin Information</h3>
            <input
              placeholder="Admin Name"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              className="w-full rounded border p-2"
              required
            />
            <input
              type="email"
              placeholder="Admin Email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              className="w-full rounded border p-2"
              required
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded border p-2"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
