"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../slices/authSlice";

export default function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!login.trim() || !password.trim()) {
      setError("Login va password kiriting");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.signIn({ login: login.trim(), password });
      setTokens(data.data.accessToken, data.data.refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(message ?? "Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
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
              htmlFor="login"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Login
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white placeholder:text-black"
              placeholder="Login kiriting"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white placeholder:text-black"
                placeholder="Password kiriting"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-medium hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Kiring..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
