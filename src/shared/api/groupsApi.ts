import api from "@/service";
import type {
  ApiGroupListResponse,
  ApiGroupCreateRequest,
  ApiGroup,
} from "@/shared/types/api";

const GROUPS_BASE = "/groups";

export const groupsApi = {
  getList: (courseId?: number) =>
    api.get<ApiGroupListResponse>(
      courseId ? `${GROUPS_BASE}?courseId=${courseId}` : GROUPS_BASE
    ),

  create: (payload: ApiGroupCreateRequest) =>
    api.post<{ data: ApiGroup }>(GROUPS_BASE, payload),

  update: (id: number, payload: Partial<ApiGroupCreateRequest>) =>
    api.patch<{ data: ApiGroup }>(`${GROUPS_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${GROUPS_BASE}/${id}`),
};
