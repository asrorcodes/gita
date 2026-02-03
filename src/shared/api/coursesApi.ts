import api from "@/service";
import type {
  ApiCourseListResponse,
  ApiCourseCreateRequest,
  ApiCourse,
} from "@/shared/types/api";

const COURSES_BASE = "/courses";

export const coursesApi = {
  getList: () => api.get<ApiCourseListResponse>(COURSES_BASE),

  create: (payload: ApiCourseCreateRequest) =>
    api.post<{ data: ApiCourse }>(COURSES_BASE, payload),

  update: (id: number, payload: Partial<ApiCourseCreateRequest>) =>
    api.patch<{ data: ApiCourse }>(`${COURSES_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${COURSES_BASE}/${id}`),
};
