"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import { LogOut, Menu, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { coursesApi } from "@/shared/api/coursesApi";
import { lessonPackagesApi } from "@/shared/api/lessonPackagesApi";
import { queryKeys } from "@/shared/query-keys";
import type { ApiCourse, ApiLessonPackage } from "@/shared/types/api";

export default function CoursesManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [programLang, setProgramLang] = useState("");
  const [packageId, setPackageId] = useState<number | "">("");
  const [packageName, setPackageName] = useState("");
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [error, setError] = useState("");

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: async () => {
      const res = await coursesApi.getList();
      return res.data.data ?? [];
    },
  });

  const { data: packages = [] } = useQuery({
    queryKey: queryKeys.lessonPackages,
    queryFn: async () => {
      const res = await lessonPackagesApi.getList();
      return res.data.data ?? [];
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: (name: string) => lessonPackagesApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessonPackages });
    },
  });

  const saveCourseMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | null;
      payload: { name: string; programLang: string; packageId: number };
    }) => {
      if (id != null) return coursesApi.update(id, payload);
      return coursesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
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

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
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
    setProgramLang("");
    setPackageId("");
    setPackageName("");
    setError("");
    setFormOpen(true);
    setShowPackageForm(false);
  };

  const openEdit = (c: ApiCourse) => {
    setEditingId(c.id);
    setName(c.name);
    setProgramLang(c.programLang);
    setPackageId(c.packageId);
    setPackageName("");
    setError("");
    setFormOpen(true);
    setShowPackageForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let pkgId = packageId;
    if (showPackageForm && packageName.trim()) {
      try {
        const { data } = await createPackageMutation.mutateAsync(
          packageName.trim()
        );
        pkgId = data.data.id;
      } catch {
        setError("Paket yaratib bo'lmadi");
        return;
      }
    }
    if (pkgId === "" || !name.trim() || !programLang.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    saveCourseMutation.mutate({
      id: editingId,
      payload: {
        name: name.trim(),
        programLang: programLang.trim(),
        packageId: pkgId as number,
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Kursni o'chirishni xohlaysizmi?")) return;
    deleteCourseMutation.mutate(id, {
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
              Kurslar boshqaruvi
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
              <h2 className="text-base font-semibold text-slate-900">Kurslar ro'yxati</h2>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Kurs qo'shish
              </button>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm py-2">Yuklanmoqda...</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                {courses.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-sm">
                    Kurslar yo'q. &quot;Kurs qo'shish&quot; orqali qo'shing.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {courses.map((c) => (
                      <li
                        key={c.id}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                          <p className="text-xs text-slate-500">
                            {c.programLang} · Paket ID: {c.packageId}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
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
                    {editingId != null ? "Kursni tahrirlash" : "Yangi kurs"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Kurs nomi
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        placeholder="Masalan: Java Basics"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Dasturlash tili (programLang)
                      </label>
                      <input
                        type="text"
                        value={programLang}
                        onChange={(e) => setProgramLang(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        placeholder="Masalan: JAVA"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Paket
                      </label>
                      <label className="flex items-center gap-2 mb-1.5">
                        <input
                          type="checkbox"
                          checked={showPackageForm}
                          onChange={(e) => setShowPackageForm(e.target.checked)}
                        />
                        <span className="text-sm">Yangi paket yaratish</span>
                      </label>
                      {showPackageForm ? (
                        <input
                          type="text"
                          value={packageName}
                          onChange={(e) => setPackageName(e.target.value)}
                          className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          placeholder="Paket nomi"
                        />
                      ) : (
                        <select
                          value={packageId}
                          onChange={(e) =>
                            setPackageId(
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          required={!showPackageForm}
                        >
                          <option value="">Tanlang</option>
                          {packages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (ID: {p.id})
                            </option>
                          ))}
                        </select>
                      )}
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
                        disabled={saveCourseMutation.isPending || createPackageMutation.isPending}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60"
                      >
                        {saveCourseMutation.isPending ? "Saqlanmoqda..." : editingId != null ? "Saqlash" : "Qo'shish"}
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
