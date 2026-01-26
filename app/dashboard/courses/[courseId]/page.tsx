"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import Sidebar from "@/widgets/sidebar/ui/Sidebar";
import StudentsList from "@/widgets/students-list/ui/StudentsList";
import { Group } from "@/shared/types";
import { LogOut, Menu } from "lucide-react";
import { mockCourses } from "@/shared/data/mockData";

export default function CoursePage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const courseId = params?.courseId as string;
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

  useEffect(() => {
    // Auto-open course in sidebar
    if (courseId) {
      const course = mockCourses.find((c) => c.id === courseId);
      if (course && course.groups.length > 0) {
        // Optionally select first group
        // setSelectedGroup(course.groups[0]);
      }
    }
  }, [courseId]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  const course = mockCourses.find((c) => c.id === courseId);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        selectedGroup={selectedGroup}
        onGroupSelect={setSelectedGroup}
        onAddStudent={() => router.push("/add-students")}
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
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {course ? course.name : "Kurs topilmadi"}
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
          {course ? (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Guruhlar ro'yxati
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.groups.map((group) => (
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
                        {group.students.length} ta o'quvchi
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-6">
              <p className="text-sm">Kurs topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
