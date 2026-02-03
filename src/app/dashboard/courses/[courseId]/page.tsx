"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useOpenSidebar } from "@/app/dashboard/DashboardLayoutContext";
import { LogOut, Menu } from "lucide-react";
import { coursesApi } from "@/shared/api/coursesApi";
import { groupsApi } from "@/shared/api/groupsApi";
import { queryKeys } from "@/shared/query-keys";
import type { ApiCourse } from "@/shared/types/api";

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const openSidebar = useOpenSidebar();
  const [mounted, setMounted] = useState(false);
  const cId = courseId ? parseInt(courseId, 10) : NaN;
  const validCourseId = Number.isNaN(cId) ? undefined : cId;

  const { data: courses = [] } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: async () => {
      const res = await coursesApi.getList();
      return res.data.data ?? [];
    },
  });

  const { data: groups = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.groups(validCourseId),
    queryFn: async () => {
      const res = await groupsApi.getList(validCourseId);
      return res.data.data ?? [];
    },
    enabled: validCourseId != null,
  });

  const course: ApiCourse | null = useMemo(
    () => (validCourseId != null ? courses.find((c) => c.id === validCourseId) ?? null : null),
    [courses, validCourseId]
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
          <h1 className="text-base font-semibold text-slate-900 truncate">
            {course ? course.name : "Kurs topilmadi"}
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

      <div className="flex-1 bg-slate-50 overflow-y-auto min-h-0">
          {course ? (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Guruhlar ro'yxati
                </h2>
                {loading ? (
                  <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
                ) : groups.length === 0 ? (
                  <p className="text-gray-500 text-sm">Guruhlar yo'q</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="p-3 border border-gray-200 rounded-md hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/dashboard/courses/${courseId}/groups/${group.id}`
                          )
                        }
                      >
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          O'qituvchi ID: {group.teacherId}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-6">
              <p className="text-sm">Kurs topilmadi</p>
            </div>
          )}
        </div>
    </>
  );
}
