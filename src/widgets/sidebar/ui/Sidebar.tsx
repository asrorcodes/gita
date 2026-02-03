"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  GraduationCap,
  BookMarked,
  X,
  LayoutGrid,
  UsersRound,
  LayoutDashboard,
} from "lucide-react";
import { coursesApi } from "@/shared/api/coursesApi";
import { groupsApi } from "@/shared/api/groupsApi";
import type { ApiCourse } from "@/shared/types/api";
import type { Group } from "@/shared/types";

interface SidebarProps {
  selectedGroup: Group | null;
  onGroupSelect: (group: Group) => void;
  onAddStudent: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NavSectionLabel = memo(function NavSectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="px-4 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </p>
  );
});

function SidebarInner({
  selectedGroup,
  onGroupSelect,
  onAddStudent,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set(["courses"]));
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupsByCourse, setGroupsByCourse] = useState<Record<number, { id: number; name: string; courseId: number; teacherId: number }[]>>({});

  useEffect(() => {
    coursesApi
      .getList()
      .then((res) => {
        setCourses(res.data.data ?? []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (pathname?.includes("/courses/")) {
      setOpenCourses(new Set(["courses"]));
      const courseId = pathname.split("/courses/")[1]?.split("/")[0];
      if (courseId) {
        setOpenGroups(new Set([courseId]));
      }
    }
  }, [pathname]);

  const loadGroupsForCourse = useCallback((courseId: number) => {
    if (groupsByCourse[courseId]) return;
    groupsApi
      .getList(courseId)
      .then((res) => {
        setGroupsByCourse((prev) => ({
          ...prev,
          [courseId]: res.data.data ?? [],
        }));
      })
      .catch(() => {});
  }, [groupsByCourse]);

  const toggleCourse = useCallback(
    (courseId: string) => {
      const numId = parseInt(courseId, 10);
      if (!groupsByCourse[numId]) loadGroupsForCourse(numId);
      setOpenCourses((prev) => {
        const next = new Set(prev);
        if (next.has(courseId)) next.delete(courseId);
        else next.add(courseId);
        return next;
      });
    },
    [groupsByCourse, loadGroupsForCourse]
  );

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const nav = useCallback(
    (path: string) => {
      router.push(path);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        onClose();
      }
    },
    [router, onClose]
  );

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen overflow-y-auto transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } bg-slate-900 border-r border-slate-700/50 shadow-xl`}
      >
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-700/50">
          <span className="text-xl font-bold tracking-tight text-white">GITA</span>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 -m-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Menuni yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Nav */}
        <nav className="flex-1 py-4 min-h-0">
          {/* 1. Asosiy */}
          <NavSectionLabel>Asosiy</NavSectionLabel>
          <ul className="space-y-0.5 px-3">
            <li>
              <button
                type="button"
                onClick={() => nav("/dashboard")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">Bosh sahifa</span>
              </button>
            </li>
            <li>
              <div>
                <button
                  type="button"
                  onClick={() => toggleCourse("courses")}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    pathname?.startsWith("/dashboard/courses")
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookOpen className="w-5 h-5 shrink-0 opacity-90" />
                    <span className="font-medium">Kurslar</span>
                  </div>
                  {openCourses.has("courses") ? (
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {openCourses.has("courses") && (
                  <div className="ml-4 mt-1 pl-4 border-l border-slate-700/70 space-y-0.5">
                    {loading ? (
                      <p className="text-slate-500 text-sm px-2 py-2">Yuklanmoqda…</p>
                    ) : (
                      courses.map((course) => (
                        <CourseItem
                          key={course.id}
                          course={course}
                          groups={groupsByCourse[course.id] ?? []}
                          openGroups={openGroups}
                          selectedGroup={selectedGroup}
                          onToggleGroup={toggleGroup}
                          onGroupSelect={onGroupSelect}
                          onClose={onClose}
                          loadGroups={() => loadGroupsForCourse(course.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </li>
          </ul>

          {/* 2. Boshqaruv */}
          <NavSectionLabel>Boshqaruv</NavSectionLabel>
          <ul className="space-y-0.5 px-3">
            <li>
              <button
                type="button"
                onClick={() => nav("/dashboard/students")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive("/dashboard/students")
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Users className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">O'quvchilar</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => nav("/dashboard/teachers")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive("/dashboard/teachers")
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <GraduationCap className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">O'qituvchilar</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => nav("/dashboard/lessons")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive("/dashboard/lessons")
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <BookMarked className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">Darslar</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => nav("/dashboard/courses-management")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive("/dashboard/courses-management")
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">Kurslar boshqaruvi</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => nav("/dashboard/groups-management")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive("/dashboard/groups-management")
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <UsersRound className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium">Guruhlar boshqaruvi</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

const Sidebar = memo(SidebarInner);

interface CourseItemProps {
  course: ApiCourse;
  groups: { id: number; name: string; courseId: number; teacherId: number }[];
  openGroups: Set<string>;
  selectedGroup: Group | null;
  onToggleGroup: (groupId: string) => void;
  onGroupSelect: (group: Group) => void;
  onClose: () => void;
  loadGroups: () => void;
}

const CourseItem = memo(function CourseItem({
  course,
  groups,
  openGroups,
  selectedGroup,
  onToggleGroup,
  onGroupSelect,
  onClose,
  loadGroups,
}: CourseItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const courseIdStr = String(course.id);
  const isOpen = openGroups.has(courseIdStr);
  const isCourseActive = pathname?.includes(`/courses/${course.id}`);

  useEffect(() => {
    if (isOpen) loadGroups();
  }, [isOpen, loadGroups]);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => onToggleGroup(courseIdStr)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors text-left text-sm ${
          isCourseActive
            ? "bg-slate-800 text-white"
            : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
        }`}
      >
        <span className="truncate font-medium">{course.name}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-0.5">
          {groups.length === 0 ? (
            <p className="text-slate-500 text-xs px-3 py-2">Guruhlar yo'q</p>
          ) : (
            groups.map((group) => {
              const isGroupActive =
                pathname === `/dashboard/courses/${course.id}/groups/${group.id}`;
              const groupForSelect: Group = {
                id: group.id,
                name: group.name,
                courseId: course.id,
                students: [],
              };
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onGroupSelect(groupForSelect);
                    router.push(
                      `/dashboard/courses/${course.id}/groups/${group.id}`
                    );
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth < 1024
                    ) {
                      onClose();
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left text-sm ${
                    isGroupActive || selectedGroup?.id === group.id
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0 opacity-80" />
                  <span className="truncate">{group.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

export default Sidebar;
