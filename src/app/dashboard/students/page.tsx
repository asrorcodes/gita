"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import { LogOut, Menu, ArrowLeft, Plus, UserPlus, X, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { studentsApi } from "@/shared/api/studentsApi";
import { groupsApi } from "@/shared/api/groupsApi";
import { coursesApi } from "@/shared/api/coursesApi";
import { studentGroupsApi } from "@/shared/api/studentGroupsApi";
import { queryKeys } from "@/shared/query-keys";
import AddStudentForm from "@/features/add-student/ui/AddStudentForm";
import type { ApiStudent, ApiStudentGroup } from "@/shared/types/api";

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

export default function StudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalStudent, setEditModalStudent] = useState<ApiStudent | null>(null);
  const [assignModalStudent, setAssignModalStudent] = useState<ApiStudent | null>(null);
  const [assignGroupId, setAssignGroupId] = useState<string>("");
  const [assignError, setAssignError] = useState("");

  const { data: allStudents = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.students(),
    queryFn: async () => {
      const res = await studentsApi.getList();
      return res.data.data ?? [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: queryKeys.studentGroups(),
    queryFn: async () => {
      const res = await studentGroupsApi.getList();
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
      closeAssignModal();
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setAssignError(msg ?? "Xatolik yuz berdi");
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentGroups() });
    },
  });

  const ungroupedStudents = allStudents.filter(
    (s) => !assignments.some((a) => a.studentId === s.id)
  );

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

  const openAssignModal = (student: ApiStudent) => {
    setAssignModalStudent(student);
    setAssignGroupId("");
    setAssignError("");
  };

  const closeAssignModal = () => {
    setAssignModalStudent(null);
    setAssignGroupId("");
    setAssignError("");
  };

  const handleDeleteStudent = (student: ApiStudent) => {
    if (!confirm(`"${student.firstName} ${student.lastName}" o'quvchisini o'chirishni xohlaysizmi?`)) return;
    deleteStudentMutation.mutate(student.id, {
      onError: () => alert("O'chirib bo'lmadi"),
    });
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalStudent || !assignGroupId) return;
    setAssignError("");
    assignMutation.mutate({
      studentId: assignModalStudent.id,
      groupId: Number(assignGroupId),
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
              O'quvchilar
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

        <div className="flex-1 bg-slate-50 overflow-y-auto p-4 min-h-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yangi o'quvchi qo'shish
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-semibold text-slate-900">
                  Guruhlanmagan o'quvchilar
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Guruhga biriktirilmagan o'quvchilar ro'yxati
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Yuklanmoqda...
                  </div>
                ) : ungroupedStudents.length === 0 ? (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Guruhlanmagan o'quvchilar yo'q. Yangi o'quvchi qo'shing yoki barcha
                    o'quvchilar allaqachon guruhlarga biriktirilgan.
                  </div>
                ) : (
                  ungroupedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.phone} · {student.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditModalStudent(student)}
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student)}
                          disabled={deleteStudentMutation.isPending}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAssignModal(student)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Guruhga biriktirish
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Modal: Yangi o'quvchi qo'shish */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AddStudentForm
              onClose={() => setAddModalOpen(false)}
              onAdd={() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.students() });
              }}
            />
          </div>
        </div>
      )}

      {/* Modal: O'quvchini tahrirlash */}
      {editModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setEditModalStudent(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <AddStudentForm
              key={editModalStudent.id}
              initialStudent={editModalStudent}
              onClose={() => setEditModalStudent(null)}
              onAdd={() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.students() });
              }}
            />
          </div>
        </div>
      )}

      {/* Modal: O'quvchini guruhga biriktirish */}
      {assignModalStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeAssignModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Guruhga biriktirish
              </h3>
              <button
                type="button"
                onClick={closeAssignModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {assignModalStudent.firstName} {assignModalStudent.lastName} uchun guruhni
              tanlang.
            </p>
            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Guruh
                </label>
                <select
                  value={assignGroupId}
                  onChange={(e) => setAssignGroupId(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
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
              {assignError && (
                <p className="text-sm text-red-600">{assignError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={assignMutation.isPending}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {assignMutation.isPending ? "Biriktirilmoqda..." : "Biriktirish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
