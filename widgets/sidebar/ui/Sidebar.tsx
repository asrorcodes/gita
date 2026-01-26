"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, BookOpen, Users, Plus, X } from "lucide-react";
import { mockCourses } from "@/shared/data/mockData";
import { Course, Group } from "@/shared/types";

interface SidebarProps {
  selectedGroup: Group | null;
  onGroupSelect: (group: Group) => void;
  onAddStudent: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
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

  // Auto-open courses based on current route
  useEffect(() => {
    if (pathname?.includes("/courses/")) {
      setOpenCourses(new Set(["courses"]));
      const courseId = pathname.split("/courses/")[1]?.split("/")[0];
      if (courseId) {
        setOpenGroups(new Set([courseId]));
      }
    }
  }, [pathname]);

  const toggleCourse = (courseId: string) => {
    const newOpenCourses = new Set(openCourses);
    if (newOpenCourses.has(courseId)) {
      newOpenCourses.delete(courseId);
    } else {
      newOpenCourses.add(courseId);
    }
    setOpenCourses(newOpenCourses);
  };

  const toggleGroup = (groupId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-900 text-white h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">GITA</h2>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-2">
        {/* Kurslar Dropdown */}
        <div>
          <button
            onClick={() => toggleCourse("courses")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">Kurslar</span>
            </div>
            {openCourses.has("courses") ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {openCourses.has("courses") && (
            <div className="ml-4 mt-2 space-y-1">
              {mockCourses.map((course) => (
                <CourseItem
                  key={course.id}
                  course={course}
                  openGroups={openGroups}
                  selectedGroup={selectedGroup}
                  onToggleGroup={toggleGroup}
                  onGroupSelect={onGroupSelect}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>

        {/* O'quvchilar qo'shish */}
        <button
          onClick={(e) => {
            e.preventDefault();
            router.push("/add-students");
            // Close sidebar only on mobile
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              onClose();
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-left ${
            pathname === "/add-students" ? "bg-gray-800" : ""
          }`}
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">O'quvchi qo'shish</span>
        </button>
      </div>
    </div>
    </>
  );
}

interface CourseItemProps {
  course: Course;
  openGroups: Set<string>;
  selectedGroup: Group | null;
  onToggleGroup: (groupId: string) => void;
  onGroupSelect: (group: Group) => void;
  onClose: () => void;
}

function CourseItem({
  course,
  openGroups,
  selectedGroup,
  onToggleGroup,
  onGroupSelect,
  onClose,
}: CourseItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = openGroups.has(course.id);
  const isCourseActive = pathname?.includes(`/courses/${course.id}`);

  return (
    <div className="space-y-1">
      <button
        onClick={() => onToggleGroup(course.id)}
        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left text-sm ${
          isCourseActive ? "bg-gray-800" : ""
        }`}
      >
        <span className="text-gray-300">{course.name}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="ml-4 space-y-1">
          {course.groups.map((group) => {
            const isGroupActive =
              pathname === `/dashboard/courses/${course.id}/groups/${group.id}`;
            return (
              <button
                key={group.id}
                onClick={(e) => {
                  e.preventDefault();
                  onGroupSelect(group);
                  router.push(`/dashboard/courses/${course.id}/groups/${group.id}`);
                  // Close sidebar only on mobile
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left text-sm block ${
                  isGroupActive || selectedGroup?.id === group.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{group.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
