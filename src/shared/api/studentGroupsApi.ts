import api from "@/service";
import type {
  ApiStudentGroupListResponse,
  ApiStudentGroupCreateRequest,
  ApiStudentGroup,
} from "@/shared/types/api";

const STUDENT_GROUPS_BASE = "/student-groups";

export const studentGroupsApi = {
  getList: (groupId?: number) =>
    api.get<ApiStudentGroupListResponse>(
      groupId ? `${STUDENT_GROUPS_BASE}?groupId=${groupId}` : STUDENT_GROUPS_BASE
    ),

  create: (payload: ApiStudentGroupCreateRequest) =>
    api.post<{ data: ApiStudentGroup }>(STUDENT_GROUPS_BASE, payload),

  update: (id: number, payload: Partial<ApiStudentGroupCreateRequest>) =>
    api.put<{ data: ApiStudentGroup }>(`${STUDENT_GROUPS_BASE}/${id}`, payload),

  delete: (id: number) => api.delete(`${STUDENT_GROUPS_BASE}/${id}`),
};
