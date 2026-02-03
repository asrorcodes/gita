"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { isAuthenticated } from "@/shared/lib/auth";
import Sidebar from "@/widgets/sidebar/ui/Sidebar";
import { Group } from "@/shared/types";
import {
  OpenSidebarContext,
  SelectedGroupContext,
} from "./DashboardLayoutContext";
import { groupsApi } from "@/shared/api/groupsApi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const onClose = useCallback(() => setSidebarOpen(false), []);
  const onAddStudent = useCallback(() => {
    router.push("/dashboard/students");
  }, [router]);

  const openSidebarValue = useMemo(
    () => ({ openSidebar }),
    [openSidebar]
  );

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Set selectedGroup from URL when on group page
  useEffect(() => {
    const courseId = params?.courseId as string | undefined;
    const groupId = params?.groupId as string | undefined;
    if (!courseId || !groupId) return;
    const cId = parseInt(courseId, 10);
    const gId = parseInt(groupId, 10);
    if (Number.isNaN(cId) || Number.isNaN(gId)) return;
    groupsApi
      .getList(cId)
      .then((res) => {
        const g = (res.data.data ?? []).find((gr) => gr.id === gId);
        if (g) {
          setSelectedGroup({
            id: g.id,
            name: g.name,
            courseId: g.courseId,
            students: [],
          });
        } else {
          setSelectedGroup(null);
        }
      })
      .catch(() => setSelectedGroup(null));
  }, [params?.courseId, params?.groupId]);

  if (!mounted) {
    return null;
  }

  return (
    <OpenSidebarContext.Provider value={openSidebarValue}>
      <SelectedGroupContext.Provider value={selectedGroup}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            selectedGroup={selectedGroup}
            onGroupSelect={setSelectedGroup}
            onAddStudent={onAddStudent}
            isOpen={sidebarOpen}
            onClose={onClose}
          />
          <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
      </SelectedGroupContext.Provider>
    </OpenSidebarContext.Provider>
  );
}
