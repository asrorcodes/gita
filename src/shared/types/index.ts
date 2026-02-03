export interface Course {
  id: string;
  name: string;
  groups: Group[];
}

export interface Group {
  id: string | number;
  name: string;
  courseId?: string | number;
  groupId?: string;
  students: Student[];
}

export interface Student {
  id: string;
  name: string;
  groupId: string;
}
