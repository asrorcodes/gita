import api from "@/service";
import type {
  ApiStudentListResponse,
  ApiStudentCreateRequest,
  ApiStudent,
} from "@/shared/types/api";

const STUDENTS_BASE = "/students";

export const studentsApi = {
  getList: (groupId?: number) =>
    api.get<ApiStudentListResponse>(
      groupId ? `${STUDENTS_BASE}?groupId=${groupId}` : STUDENTS_BASE
    ),

  create: (payload: ApiStudentCreateRequest) =>
    api.post<{ data: ApiStudent }>(STUDENTS_BASE, payload),

  update: (id: number, payload: Partial<ApiStudentCreateRequest>) =>
    api.patch<{ data: ApiStudent }>(`${STUDENTS_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${STUDENTS_BASE}/${id}`),
};
