import api from "@/service";
import type {
  ApiTeacherListResponse,
  ApiTeacherCreateRequest,
  ApiTeacher,
} from "@/shared/types/api";

const TEACHERS_BASE = "/teachers";

export const teachersApi = {
  getList: () => api.get<ApiTeacherListResponse>(TEACHERS_BASE),

  create: (payload: ApiTeacherCreateRequest) =>
    api.post<{ data: ApiTeacher }>(TEACHERS_BASE, payload),

  update: (id: number, payload: Partial<ApiTeacherCreateRequest>) =>
    api.put<{ data: ApiTeacher }>(`${TEACHERS_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${TEACHERS_BASE}/${id}`),
};
