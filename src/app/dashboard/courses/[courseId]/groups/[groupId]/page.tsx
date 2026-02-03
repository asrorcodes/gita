"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useDashboardLayout } from "@/app/dashboard/DashboardLayoutContext";
import StudentsList from "@/widgets/students-list/ui/StudentsList";
import { LogOut, Menu } from "lucide-react";
import { coursesApi } from "@/shared/api/coursesApi";
import type { ApiCourse } from "@/shared/types/api";

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const { openSidebar, selectedGroup } = useDashboardLayout();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!courseId) return;
    const cId = parseInt(courseId, 10);
    if (Number.isNaN(cId)) return;
    coursesApi
      .getList()
      .then((res) => {
        const found = (res.data.data ?? []).find((c) => c.id === cId);
        setCourse(found ?? null);
      })
      .catch(() => setCourse(null));
  }, [courseId]);

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
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={openSidebar}
            className="lg:hidden p-1.5 -m-1.5 text-slate-600 hover:text-slate-900 rounded transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {selectedGroup ? selectedGroup.name : "Guruh topilmadi"}
            </h1>
            {course && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {course.name}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </header>
      <StudentsList group={selectedGroup} />
    </>
  );
}
