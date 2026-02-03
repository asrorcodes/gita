"use client";

import { createContext, useContext } from "react";
import type { Group } from "@/shared/types";

interface OpenSidebarContextValue {
  openSidebar: () => void;
}

const OpenSidebarContext = createContext<OpenSidebarContextValue | null>(null);
const SelectedGroupContext = createContext<Group | null>(null);

export function useOpenSidebar() {
  const ctx = useContext(OpenSidebarContext);
  if (!ctx) {
    throw new Error(
      "useOpenSidebar must be used within DashboardLayoutProvider"
    );
  }
  return ctx.openSidebar;
}

export function useSelectedGroup() {
  return useContext(SelectedGroupContext);
}

/** Use when you need both; re-renders when selectedGroup changes. */
export function useDashboardLayout() {
  const openSidebar = useOpenSidebar();
  const selectedGroup = useSelectedGroup();
  return { openSidebar, selectedGroup };
}

export { OpenSidebarContext, SelectedGroupContext };
