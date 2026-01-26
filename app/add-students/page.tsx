"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import Sidebar from "@/widgets/sidebar/ui/Sidebar";
import AddStudentForm from "@/features/add-student/ui/AddStudentForm";
import { Group } from "@/shared/types";
import { LogOut, ArrowLeft, Menu } from "lucide-react";
import Link from "next/link";

export default function AddStudentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  // Close sidebar on mobile when pathname changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAddStudent = (studentName: string, groupId: string) => {
    // In a real app, this would be an API call
    console.log("Adding student:", studentName, "to group:", groupId);
    // After adding, redirect to dashboard or show success message
    router.push("/dashboard");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        selectedGroup={selectedGroup}
        onGroupSelect={setSelectedGroup}
        onAddStudent={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Orqaga</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              Yangi o'quvchi qo'shish
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </header>

        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 sm:p-6">
            <AddStudentForm
              onClose={() => router.push("/dashboard")}
              onAdd={handleAddStudent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
