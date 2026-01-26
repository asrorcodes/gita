"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/shared/lib/auth";
import { LogIn } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple validation - in real app, this would be an API call
    if (username && password) {
      login();
      router.push("/dashboard");
    } else {
      setError("Username va password kiriting");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-indigo-600 p-2.5 rounded-lg">
            <LogIn className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          Tizimga kirish
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Hisobingizga kiring
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
              placeholder="Username kiriting"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
              placeholder="Password kiriting"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium hover:bg-indigo-700 transition-colors text-sm"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}
