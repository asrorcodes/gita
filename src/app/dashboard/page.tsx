"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import { useAuthStore } from "@/app/login/slices/authSlice";
import { useDashboardLayout } from "@/app/dashboard/DashboardLayoutContext";
import StudentsList from "@/widgets/students-list/ui/StudentsList";
import { LogOut, Menu } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { openSidebar, selectedGroup } = useDashboardLayout();

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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={openSidebar}
            className="lg:hidden p-1.5 -m-1.5 text-slate-600 hover:text-slate-900 rounded transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-slate-900 truncate">
            Bosh sahifa
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </header>
      <StudentsList group={selectedGroup} />
    </>
  );
}
