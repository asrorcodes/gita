"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { mockCourses } from "@/shared/data/mockData";

interface AddStudentFormProps {
  onClose: () => void;
  onAdd: (studentName: string, groupId: string) => void;
}

export default function AddStudentForm({
  onClose,
  onAdd,
}: AddStudentFormProps) {
  const [studentName, setStudentName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim() && selectedGroupId) {
      onAdd(studentName.trim(), selectedGroupId);
      setStudentName("");
      setSelectedGroupId("");
      onClose();
    }
  };

  // Flatten all groups from all courses
  const allGroups = mockCourses.flatMap((course) =>
    course.groups.map((group) => ({
      ...group,
      courseName: course.name,
    }))
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-black mb-5">
        Yangi o'quvchi qo'shish
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="studentName"
            className="block text-sm font-medium text-black mb-1.5"
          >
            O'quvchi ismi
          </label>
          <input
            id="studentName"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white placeholder:text-black"
            placeholder="O'quvchi ismini kiriting"
            required
          />
        </div>

        <div>
          <label
            htmlFor="group"
            className="block text-sm font-medium text-black mb-1.5"
          >
            Guruh
          </label>
          <select
            id="group"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            required
          >
            <option value="" className="text-black">Guruhni tanlang</option>
            {allGroups.map((group) => (
              <option key={group.id} value={group.id} className="text-black">
                {group.courseName} - {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-black hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Qo'shish
          </button>
        </div>
      </form>
    </div>
  );
}
