"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { studentsApi } from "@/shared/api/studentsApi";
import type { ApiStudent } from "@/shared/types/api";

interface AddStudentFormProps {
  onClose: () => void;
  onAdd?: () => void;
  /** Tahrirlash rejimi: berilsa forma to‘ldiriladi va saqlashda update chaqiladi */
  initialStudent?: ApiStudent | null;
}

// +998 XX XXX XX XX — faqat raqamlarni saqlaymiz, ko‘rinishini formatlaymiz
const PHONE_MAX_DIGITS = 9; // 90 123 45 67

const PHONE_PREFIX = "+998 ";

function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(-PHONE_MAX_DIGITS);
  if (d.length === 0) return PHONE_PREFIX;
  const parts: string[] = ["+998"];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 5));
  if (d.length > 5) parts.push(d.slice(5, 7));
  if (d.length > 7) parts.push(d.slice(7, 9));
  return parts.filter(Boolean).join(" ");
}

function phoneToApiValue(display: string): string {
  const digits = display.replace(/\D/g, "").slice(-PHONE_MAX_DIGITS);
  if (digits.length < PHONE_MAX_DIGITS) return display.trim();
  return `+998${digits}`;
}

/** API dan kelgan telefonni ko‘rsatish formatiga (+998 XX XXX XX XX) */
function phoneFromApi(apiPhone: string): string {
  const digits = apiPhone.replace(/\D/g, "");
  const local =
    digits.startsWith("998") && digits.length > 3
      ? digits.slice(3, 3 + PHONE_MAX_DIGITS)
      : digits.slice(-PHONE_MAX_DIGITS);
  return formatPhoneDisplay(local);
}

export default function AddStudentForm({
  onClose,
  onAdd,
  initialStudent = null,
}: AddStudentFormProps) {
  const [firstName, setFirstName] = useState(initialStudent?.firstName ?? "");
  const [lastName, setLastName] = useState(initialStudent?.lastName ?? "");
  const [phone, setPhone] = useState(
    initialStudent ? phoneFromApi(initialStudent.phone) : PHONE_PREFIX
  );
  const [status, setStatus] = useState(initialStudent?.status ?? "ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialStudent) {
      setFirstName(initialStudent.firstName);
      setLastName(initialStudent.lastName);
      setPhone(phoneFromApi(initialStudent.phone));
      setStatus(initialStudent.status);
    } else {
      setFirstName("");
      setLastName("");
      setPhone(PHONE_PREFIX);
      setStatus("ACTIVE");
    }
  }, [initialStudent]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const digits = raw.slice(0, 12);
    const local =
      digits.startsWith("998") && digits.length > 3
        ? digits.slice(3, 3 + PHONE_MAX_DIGITS)
        : digits.slice(0, PHONE_MAX_DIGITS);
    setPhone(formatPhoneDisplay(local));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const phoneForApi = phoneToApiValue(phone);
    if (!firstName.trim() || !lastName.trim() || !phoneForApi) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    if (phoneForApi.length < 12) {
      setError("To'liq telefon raqamini kiriting (+998 XX XXX XX XX)");
      return;
    }
    setSubmitting(true);
    try {
      if (initialStudent) {
        await studentsApi.update(initialStudent.id, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phoneForApi,
          status,
        });
      } else {
        await studentsApi.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phoneForApi,
          status,
          accountId: null,
          userId: null,
        });
      }
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

  const isEdit = Boolean(initialStudent);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-black mb-5">
        {isEdit ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
      </h2>
      {!isEdit && (
        <p className="text-sm text-gray-500 mb-4">
          O'quvchi yaratilgach, quyida &quot;Guruhga biriktirish&quot; tugmasi orqali guruhga biriktirishingiz mumkin.
        </p>
      )}

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
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white placeholder:text-slate-400"
            placeholder="90 123 45 67"
            maxLength={17}
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            9 ta raqam kiriting (masalan: 90 123 45 67)
          </p>
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
            {submitting ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </form>
    </div>
  );
}
