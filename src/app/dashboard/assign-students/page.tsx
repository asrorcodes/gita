"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import { LogOut, Menu, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { studentsApi } from "@/shared/api/studentsApi";
import { groupsApi } from "@/shared/api/groupsApi";
import { coursesApi } from "@/shared/api/coursesApi";
import { studentGroupsApi } from "@/shared/api/studentGroupsApi";
import { queryKeys } from "@/shared/query-keys";
import type { ApiStudent, ApiCourse } from "@/shared/types/api";

interface GroupOption {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
}

function defaultExpiredAt(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  d.setMonth(11);
  d.setDate(31);
  d.setHours(23, 59, 59, 0);
  return d.toISOString().slice(0, 19);
}

export default function AssignStudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: students = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.students(),
    queryFn: async () => {
      const res = await studentsApi.getList();
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

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: async () => {
      const res = await groupsApi.getList();
      return res.data.data ?? [];
    },
  });

  const groupOptions: GroupOption[] = useMemo(
    () =>
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        courseId: g.courseId,
        courseName:
          courses.find((c) => c.id === g.courseId)?.name ?? `Kurs #${g.courseId}`,
      })),
    [groups, courses]
  );

  const assignMutation = useMutation({
    mutationFn: (payload: {
      studentId: number;
      groupId: number;
      expiredAt: string;
      userId: number | null;
    }) => studentGroupsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentGroups() });
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      setSuccess("O'quvchi guruhga muvaffaqiyatli biriktirildi.");
      setSelectedStudentId("");
      setSelectedGroupId("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedStudentId || !selectedGroupId) {
      setError("O'quvchi va guruhni tanlang");
      return;
    }
    assignMutation.mutate({
      studentId: Number(selectedStudentId),
      groupId: Number(selectedGroupId),
      expiredAt: defaultExpiredAt(),
      userId: null,
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
              O'quvchilarni guruhlarga ajratish
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
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  O'quvchini guruhga biriktirish
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Yaratilgan o'quvchini tanlang va qaysi guruhga qo'shishni tanlang.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    O'quvchi
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                    disabled={loading}
                  >
                    <option value="">
                      {loading ? "Yuklanmoqda..." : "O'quvchini tanlang"}
                    </option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} · {s.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Guruh
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">Guruhni tanlang</option>
                    {groupOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.courseName} — {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && (
                  <p className="text-sm text-emerald-600">{success}</p>
                )}
                <button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {assignMutation.isPending ? "Biriktirilmoqda..." : "Guruhga biriktirish"}
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-semibold text-slate-900">
                  O'quvchilar ro'yxati ({students.length})
                </h3>
              </div>
              {loading ? (
                <p className="px-4 py-4 text-slate-500 text-sm">Yuklanmoqda...</p>
              ) : students.length === 0 ? (
                <p className="px-4 py-4 text-slate-500 text-sm">
                  O'quvchilar yo'q. Avval &quot;O'quvchi qo'shish&quot; orqali o'quvchi yarating.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <li key={s.id} className="px-4 py-2.5 text-sm text-slate-700">
                      {s.firstName} {s.lastName} · {s.phone} · {s.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
    </>
  );
}
