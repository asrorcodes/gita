export interface Course {
  id: string;
  name: string;
  groups: Group[];
}

export interface Group {
  id: string;
  name: string;
  courseId: string;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  groupId: string;
}
