/** React Query cache kalitlari — invalidation va bitta joyda boshqarish uchun */

export const queryKeys = {
  courses: ["courses"] as const,
  teachers: ["teachers"] as const,
  students: (groupId?: number): readonly [string, number?] =>
    groupId != null ? ["students", groupId] : ["students"],
  groups: (courseId?: number): readonly [string, number?] =>
    courseId != null ? ["groups", courseId] : ["groups"],
  studentGroups: (groupId?: number): readonly [string, number?] =>
    groupId != null ? ["studentGroups", groupId] : ["studentGroups"],
  lessonPackages: ["lessonPackages"] as const,
  lessons: (packageId?: number): readonly [string, number?] =>
    packageId != null ? ["lessons", packageId] : ["lessons"],
};
