// API response types (id as number from backend)

export interface ApiCourse {
  id: number;
  name: string;
  programLang: string;
  packageId: number;
}

export interface ApiCourseListResponse {
  data: ApiCourse[];
}

export interface ApiCourseCreateRequest {
  name: string;
  programLang: string;
  packageId: number;
}

export interface ApiLessonPackage {
  id: number;
  name: string;
}

export interface ApiLessonPackageListResponse {
  data: ApiLessonPackage[];
}

export interface ApiLessonPackageCreateRequest {
  name: string;
}

// Lessons (darslar)
export interface ApiLesson {
  id: number;
  name: string;
  packageId: number;
}

export interface ApiLessonListResponse {
  data: ApiLesson[];
}

export interface ApiLessonCreateRequest {
  name: string;
  packageId: number;
}

export interface ApiGroup {
  id: number;
  name: string;
  courseId: number;
  teacherId: number;
}

export interface ApiGroupListResponse {
  data: ApiGroup[];
}

export interface ApiGroupCreateRequest {
  name: string;
  courseId: number;
  teacherId: number;
}

// Teachers
export interface ApiTeacher {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
}

export interface ApiTeacherListResponse {
  data: ApiTeacher[];
}

export interface ApiTeacherCreateRequest {
  firstName: string;
  lastName: string;
  login: string;
}

// Students
export interface ApiStudent {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  accountId: number | null;
  creatorId: number | null;
}

export interface ApiStudentListResponse {
  data: ApiStudent[];
}

export interface ApiStudentCreateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  accountId: number | null;
  userId: number | null;
}

// Student-Groups (o'quvchini guruhga biriktirish)
export interface ApiStudentGroup {
  id: number;
  groupId: number;
  studentId: number;
  creatorId: number | null;
  expiredAt: string;
}

export interface ApiStudentGroupListResponse {
  data: ApiStudentGroup[];
}

export interface ApiStudentGroupCreateRequest {
  groupId: number;
  studentId: number;
  expiredAt: string;
  userId?: number | null;
  creatorId?: number | null;
}
