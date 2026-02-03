"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import { LogOut, Menu, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { groupsApi } from "@/shared/api/groupsApi";
import { coursesApi } from "@/shared/api/coursesApi";
import { teachersApi } from "@/shared/api/teachersApi";
import { queryKeys } from "@/shared/query-keys";
import type { ApiGroup, ApiCourse, ApiTeacher } from "@/shared/types/api";

export default function GroupsManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [error, setError] = useState("");

  const { data: groups = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: async () => {
      const res = await groupsApi.getList();
      return res.data.data ?? [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: async () => {
      const res = await coursesApi.getList();
      return res.data.data ?? [];
    },
  });

  const { data: teachers = [] } = useQuery({
    queryKey: queryKeys.teachers,
    queryFn: async () => {
      const res = await teachersApi.getList();
      return res.data.data ?? [];
    },
  });

  const saveGroupMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | null;
      payload: { name: string; courseId: number; teacherId: number };
    }) => {
      if (id != null) return groupsApi.update(id, payload);
      return groupsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups() });
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

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => groupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups() });
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
    setName("");
    setCourseId("");
    setTeacherId(teachers.length > 0 ? teachers[0].id : "");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (g: ApiGroup) => {
    setEditingId(g.id);
    setName(g.name);
    setCourseId(g.courseId);
    setTeacherId(g.teacherId);
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || courseId === "" || teacherId === "") {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    saveGroupMutation.mutate({
      id: editingId,
      payload: {
        name: name.trim(),
        courseId: courseId as number,
        teacherId: teacherId as number,
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Guruhni o'chirishni xohlaysizmi?")) return;
    deleteGroupMutation.mutate(id, {
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
              Guruhlar boshqaruvi
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
              <h2 className="text-base font-semibold text-slate-900">Guruhlar ro'yxati</h2>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Guruh qo'shish
              </button>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm py-2">Yuklanmoqda...</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                {groups.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-sm">
                    Guruhlar yo'q. &quot;Guruh qo'shish&quot; orqali qo'shing.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {groups.map((g) => (
                      <li
                        key={g.id}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{g.name}</p>
                          <p className="text-xs text-slate-500">
                            Kurs ID: {g.courseId}
                            {(() => {
                              const t = teachers.find((x) => x.id === g.teacherId);
                              return t
                                ? ` · O'qituvchi: ${t.firstName} ${t.lastName} (${t.login})`
                                : ` · O'qituvchi ID: ${g.teacherId}`;
                            })()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(g)}
                            className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(g.id)}
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
                    {editingId != null ? "Guruhni tahrirlash" : "Yangi guruh"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Guruh nomi
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        placeholder="Masalan: Group A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Kurs
                      </label>
                      <select
                        value={courseId}
                        onChange={(e) =>
                          setCourseId(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="">Tanlang</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (ID: {c.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        O'qituvchi
                      </label>
                      <select
                        value={teacherId}
                        onChange={(e) =>
                          setTeacherId(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        required
                      >
                        <option value="">Tanlang</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.firstName} {t.lastName} ({t.login})
                          </option>
                        ))}
                      </select>
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
                        disabled={saveGroupMutation.isPending}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60"
                      >
                        {saveGroupMutation.isPending ? "Saqlanmoqda..." : editingId != null ? "Saqlash" : "Qo'shish"}
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
