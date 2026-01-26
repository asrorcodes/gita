"use client";

import { Group, Student } from "@/shared/types";
import { User } from "lucide-react";

interface StudentsListProps {
  group: Group | null;
}

export default function StudentsList({ group }: StudentsListProps) {
  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Guruhni tanlang va o'quvchilar ro'yxatini ko'ring
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {group.name}
          </h2>
          <p className="text-sm text-gray-500">
            {group.students.length} ta o'quvchi
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              O'quvchilar ro'yxati
            </h3>
          </div>

          {group.students.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">Bu guruhda o'quvchilar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {group.students.map((student, index) => (
                <div
                  key={student.id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 font-medium text-xs">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {student.id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
