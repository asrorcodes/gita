"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { studentsApi } from "@/shared/api/studentsApi";

interface AddStudentFormProps {
  onClose: () => void;
  onAdd?: () => void;
}

export default function AddStudentForm({
  onClose,
  onAdd,
}: AddStudentFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    setSubmitting(true);
    try {
      await studentsApi.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        status,
        accountId: null,
        userId: null,
      });
      onAdd?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(msg ?? "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-black mb-5">
        Yangi o'quvchi qo'shish
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        O'quvchi yaratilgach, quyida &quot;Guruhga biriktirish&quot; tugmasi orqali guruhga biriktirishingiz mumkin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-black mb-1.5"
          >
            Ism
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white placeholder:text-black"
            placeholder="Ism"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-black mb-1.5"
          >
            Familiya
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white placeholder:text-black"
            placeholder="Familiya"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-black mb-1.5"
          >
            Telefon
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white placeholder:text-black"
            placeholder="+998911234567"
            required
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-black mb-1.5"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
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
            disabled={submitting}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
          </button>
        </div>
      </form>
    </div>
  );
}
