"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import {
  LogOut,
  Menu,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Package,
  BookOpen,
  X,
} from "lucide-react";
import Link from "next/link";
import { lessonPackagesApi } from "@/shared/api/lessonPackagesApi";
import { lessonsApi } from "@/shared/api/lessonsApi";
import { queryKeys } from "@/shared/query-keys";
import type {
  ApiLessonPackage,
  ApiLesson,
} from "@/shared/types/api";

export default function LessonsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const [packageFilterId, setPackageFilterId] = useState<number | "">("");

  // Package form
  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [packageEditingId, setPackageEditingId] = useState<number | null>(null);
  const [packageName, setPackageName] = useState("");
  const [packageError, setPackageError] = useState("");

  // Lesson form
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [lessonEditingId, setLessonEditingId] = useState<number | null>(null);
  const [lessonName, setLessonName] = useState("");
  const [lessonPackageId, setLessonPackageId] = useState<number | "">("");
  const [lessonError, setLessonError] = useState("");

  const { data: packages = [], isLoading: loadingPackages } = useQuery({
    queryKey: queryKeys.lessonPackages,
    queryFn: async () => {
      const res = await lessonPackagesApi.getList();
      return res.data.data ?? [];
    },
  });

  const { data: lessons = [], isLoading: loadingLessons } = useQuery({
    queryKey: queryKeys.lessons(),
    queryFn: async () => {
      const res = await lessonsApi.getList();
      return res.data.data ?? [];
    },
  });

  const savePackageMutation = useMutation({
    mutationFn: async ({
      id,
      name,
    }: { id: number | null; name: string }) => {
      if (id != null) return lessonPackagesApi.update(id, { name });
      return lessonPackagesApi.create({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessonPackages });
      setPackageFormOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setPackageError(msg ?? "Xatolik yuz berdi");
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (id: number) => lessonPackagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessonPackages });
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons() });
    },
  });

  const saveLessonMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number | null;
      payload: { name: string; packageId: number };
    }) => {
      if (id != null) return lessonsApi.update(id, payload);
      return lessonsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons() });
      setLessonFormOpen(false);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setLessonError(msg ?? "Xatolik yuz berdi");
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => lessonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons() });
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

  const getPackageName = (id: number) =>
    packages.find((p) => p.id === id)?.name ?? `Paket #${id}`;

  const filteredLessons =
    packageFilterId === ""
      ? lessons
      : lessons.filter((l) => l.packageId === packageFilterId);

  // ——— Package CRUD ———
  const openPackageCreate = () => {
    setPackageEditingId(null);
    setPackageName("");
    setPackageError("");
    setPackageFormOpen(true);
  };

  const openPackageEdit = (p: ApiLessonPackage) => {
    setPackageEditingId(p.id);
    setPackageName(p.name);
    setPackageError("");
    setPackageFormOpen(true);
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPackageError("");
    if (!packageName.trim()) {
      setPackageError("Paket nomini kiriting");
      return;
    }
    savePackageMutation.mutate({ id: packageEditingId, name: packageName.trim() });
  };

  const handlePackageDelete = (id: number) => {
    if (!confirm("Dars paketini o'chirishni xohlaysizmi?")) return;
    deletePackageMutation.mutate(id, {
      onError: () => alert("O'chirib bo'lmadi"),
    });
  };

  // ——— Lesson CRUD ———
  const openLessonCreate = () => {
    setLessonEditingId(null);
    setLessonName("");
    setLessonPackageId(packages.length > 0 ? packages[0].id : "");
    setLessonError("");
    setLessonFormOpen(true);
  };

  const openLessonEdit = (l: ApiLesson) => {
    setLessonEditingId(l.id);
    setLessonName(l.name);
    setLessonPackageId(l.packageId);
    setLessonError("");
    setLessonFormOpen(true);
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLessonError("");
    if (!lessonName.trim() || lessonPackageId === "") {
      setLessonError("Barcha maydonlarni to'ldiring");
      return;
    }
    saveLessonMutation.mutate({
      id: lessonEditingId,
      payload: {
        name: lessonName.trim(),
        packageId: lessonPackageId as number,
      },
    });
  };

  const handleLessonDelete = (id: number) => {
    if (!confirm("Darsni o'chirishni xohlaysizmi?")) return;
    deleteLessonMutation.mutate(id, {
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
              Darslar
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
          <div className="max-w-3xl mx-auto space-y-5">
            {/* ——— Dars paketlari ——— */}
            <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-semibold text-slate-900">
                    Dars paketlari
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={openPackageCreate}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Paket qo'shish
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {loadingPackages ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Yuklanmoqda...
                  </div>
                ) : packages.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Dars paketlari yo'q. &quot;Paket qo'shish&quot; orqali qo'shing.
                  </div>
                ) : (
                  packages.map((p) => (
                    <div
                      key={p.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-500">ID: {p.id}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openPackageEdit(p)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePackageDelete(p.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* ——— Darslar ——— */}
            <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-base font-semibold text-slate-900">Darslar</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={packageFilterId}
                    onChange={(e) =>
                      setPackageFilterId(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Barcha paketlar</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={openLessonCreate}
                    disabled={packages.length === 0}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Dars qo'shish
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {loadingLessons ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Yuklanmoqda...
                  </div>
                ) : filteredLessons.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    {lessons.length === 0
                      ? "Darslar yo'q. Avval dars paketi yarating, keyin dars qo'shing."
                      : "Tanlangan paketda darslar yo'q."}
                  </div>
                ) : (
                  filteredLessons.map((l) => (
                    <div
                      key={l.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{l.name}</p>
                        <p className="text-xs text-slate-500">
                          Paket: {getPackageName(l.packageId)} · ID: {l.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openLessonEdit(l)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLessonDelete(l.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

      {/* Modal: Dars paketi qo'shish / tahrirlash */}
      {packageFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setPackageFormOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">
                {packageEditingId != null ? "Paketni tahrirlash" : "Yangi dars paketi"}
              </h3>
              <button
                type="button"
                onClick={() => setPackageFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePackageSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Paket nomi
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  placeholder="Masalan: Java"
                  required
                />
              </div>
              {packageError && (
                <p className="text-sm text-red-600">{packageError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPackageFormOpen(false)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savePackageMutation.isPending}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60"
                >
                  {savePackageMutation.isPending ? "Saqlanmoqda..." : packageEditingId != null ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dars qo'shish / tahrirlash */}
      {lessonFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setLessonFormOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">
                {lessonEditingId != null ? "Darsni tahrirlash" : "Yangi dars"}
              </h3>
              <button
                type="button"
                onClick={() => setLessonFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLessonSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dars nomi
                </label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  placeholder="Masalan: Introduction to Variables"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dars paketi
                </label>
                <select
                  value={lessonPackageId}
                  onChange={(e) =>
                    setLessonPackageId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  required
                >
                  <option value="">Tanlang</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {lessonError && (
                <p className="text-sm text-red-600">{lessonError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setLessonFormOpen(false)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveLessonMutation.isPending}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60"
                >
                  {saveLessonMutation.isPending ? "Saqlanmoqda..." : lessonEditingId != null ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
