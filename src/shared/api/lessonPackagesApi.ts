import api from "@/service";
import type {
  ApiLessonPackageListResponse,
  ApiLessonPackageCreateRequest,
  ApiLessonPackage,
} from "@/shared/types/api";

const PACKAGES_BASE = "/lesson-packages";

export const lessonPackagesApi = {
  getList: () => api.get<ApiLessonPackageListResponse>(PACKAGES_BASE),

  create: (payload: ApiLessonPackageCreateRequest) =>
    api.post<{ data: ApiLessonPackage }>(PACKAGES_BASE, payload),

  update: (id: number, payload: { name: string }) =>
    api.put<{ data: ApiLessonPackage }>(`${PACKAGES_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${PACKAGES_BASE}/${id}`),
};
