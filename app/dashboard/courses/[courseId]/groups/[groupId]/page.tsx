"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { isAuthenticated, logout } from "@/shared/lib/auth";
import Sidebar from "@/widgets/sidebar/ui/Sidebar";
import StudentsList from "@/widgets/students-list/ui/StudentsList";
import { Group } from "@/shared/types";
import { LogOut, Menu } from "lucide-react";
import { mockCourses } from "@/shared/data/mockData";

export default function GroupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const courseId = params?.courseId as string;
  const groupId = params?.groupId as string;
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
    if (courseId && groupId) {
      const course = mockCourses.find((c) => c.id === courseId);
      if (course) {
        const group = course.groups.find((g) => g.id === groupId);
        if (group) {
          setSelectedGroup(group);
        }
      }
    }
  }, [courseId, groupId]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  const course = mockCourses.find((c) => c.id === courseId);
  const group = course?.groups.find((g) => g.id === groupId);

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
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {group ? group.name : "Guruh topilmadi"}
              </h1>
              {course && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{course.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </header>

        <StudentsList group={selectedGroup} />
      </div>
    </div>
  );
}
