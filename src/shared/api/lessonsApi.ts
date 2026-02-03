import api from "@/service";
import type {
  ApiLessonListResponse,
  ApiLessonCreateRequest,
  ApiLesson,
} from "@/shared/types/api";

const LESSONS_BASE = "/lessons";

export const lessonsApi = {
  getList: (packageId?: number) =>
    api.get<ApiLessonListResponse>(
      packageId ? `${LESSONS_BASE}?packageId=${packageId}` : LESSONS_BASE
    ),

  create: (payload: ApiLessonCreateRequest) =>
    api.post<{ data: ApiLesson }>(LESSONS_BASE, payload),

  update: (id: number, payload: Partial<ApiLessonCreateRequest>) =>
    api.put<{ data: ApiLesson }>(`${LESSONS_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${LESSONS_BASE}/${id}`),
};
