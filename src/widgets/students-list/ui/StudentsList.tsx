"use client";

import { useState, useEffect, memo } from "react";
import { Group } from "@/shared/types";
import { User } from "lucide-react";
import { studentsApi } from "@/shared/api/studentsApi";
import type { ApiStudent } from "@/shared/types/api";

interface StudentsListProps {
  group: Group | null;
}

function StudentsListInner({ group }: StudentsListProps) {
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!group?.id) {
      setStudents([]);
      return;
    }
    const groupId = typeof group.id === "number" ? group.id : parseInt(String(group.id), 10);
    if (Number.isNaN(groupId)) {
      setStudents([]);
      return;
    }
    setLoading(true);
    studentsApi
      .getList(groupId)
      .then((res) => setStudents(res.data.data ?? []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [group?.id]);

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            Guruhni tanlang va o'quvchilar ro'yxatini ko'ring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-semibold text-slate-900">{group.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading ? "Yuklanmoqda..." : `${students.length} ta o'quvchi`}
            </p>
          </div>

          {loading ? (
            <div className="py-6 text-center text-slate-500 text-sm">
              Yuklanmoqda...
            </div>
          ) : students.length === 0 ? (
            <div className="py-6 text-center text-slate-500">
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">Bu guruhda o'quvchilar yo'q</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {students.map((student, index) => (
                <li
                  key={student.id}
                  className="px-4 py-2.5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-medium text-xs">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {student.phone} · {student.status}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const StudentsList = memo(StudentsListInner, (prev, next) => {
  return prev.group?.id === next.group?.id;
});

export default StudentsList;
