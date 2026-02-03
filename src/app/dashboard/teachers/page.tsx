"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import { LogOut, Menu, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { teachersApi } from "@/shared/api/teachersApi";
import { queryKeys } from "@/shared/query-keys";
import type { ApiTeacher } from "@/shared/types/api";

export default function TeachersManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");

  const { data: teachers = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.teachers,
    queryFn: async () => {
      const res = await teachersApi.getList();
      return res.data.data ?? [];
    },
  });

  const createOrUpdateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | null;
      payload: { firstName: string; lastName: string; login: string };
    }) => {
      if (id != null) {
        return teachersApi.update(id, payload);
      }
      return teachersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
      setFormOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(msg ?? "Xatolik yuz berdi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teachersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teachers });
    },
  });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const clearAuth = useAuthStore((s) => s.clearAuth);
  const handleLogout = () => {
    clearAuth();
    logout();
    router.push("/login");
  };

  const openCreate = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setLogin("");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (t: ApiTeacher) => {
    setEditingId(t.id);
    setFirstName(t.firstName);
    setLastName(t.lastName);
    setLogin(t.login);
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !login.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    createOrUpdateMutation.mutate({
      id: editingId,
      payload: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        login: login.trim(),
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("O'qituvchini o'chirishni xohlaysizmi?")) return;
    deleteMutation.mutate(id, {
      onError: () => alert("O'chirib bo'lmadi"),
    });
  };

  if (!mounted) return null;

  return (
    <>
      <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={openSidebar}
            className="lg:hidden p-1.5 -m-1.5 text-slate-600 hover:text-slate-900 rounded transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Orqaga</span>
            </Link>
            <h1 className="text-base font-semibold text-slate-900 truncate">
              O'qituvchilar
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </header>

        <div className="flex-1 bg-slate-50 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-slate-900">
                O'qituvchilar ro'yxati
              </h2>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                O'qituvchi qo'shish
              </button>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm py-2">Yuklanmoqda...</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                {teachers.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-sm">
                    O'qituvchilar yo'q. &quot;O'qituvchi qo'shish&quot; orqali qo'shing.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {teachers.map((t) => (
                      <li
                        key={t.id}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {t.firstName} {t.lastName}
                          </p>
                          <p className="text-xs text-slate-500">Login: {t.login}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {formOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    {editingId != null ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ism
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Familiya
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        placeholder="Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Login
                      </label>
                      <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        placeholder="johndoe"
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFormOpen(false)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={createOrUpdateMutation.isPending}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60"
                      >
                        {createOrUpdateMutation.isPending ? "Saqlanmoqda..." : editingId != null ? "Saqlash" : "Qo'shish"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
    </>
  );
}
