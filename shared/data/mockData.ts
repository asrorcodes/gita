import { Course, Group, Student } from "../types";

// Mock data for courses, groups, and students
export const mockCourses: Course[] = [
  {
    id: "1",
    name: "Web Development",
    groups: [
      {
        id: "g1",
        name: "WD-101",
        courseId: "1",
        students: [
          { id: "s1", name: "Ali Valiyev", groupId: "g1" },
          { id: "s2", name: "Hasan Karimov", groupId: "g1" },
          { id: "s3", name: "Olim Toshmatov", groupId: "g1" },
        ],
      },
      {
        id: "g2",
        name: "WD-102",
        courseId: "1",
        students: [
          { id: "s4", name: "Dilshod Rahimov", groupId: "g2" },
          { id: "s5", name: "Javohir Usmonov", groupId: "g2" },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Mobile Development",
    groups: [
      {
        id: "g3",
        name: "MD-201",
        courseId: "2",
        students: [
          { id: "s6", name: "Sardor Qodirov", groupId: "g3" },
          { id: "s7", name: "Bobur Mirzayev", groupId: "g3" },
          { id: "s8", name: "Azizbek Numanov", groupId: "g3" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Data Science",
    groups: [
      {
        id: "g4",
        name: "DS-301",
        courseId: "3",
        students: [
          { id: "s9", name: "Farhod Ismoilov", groupId: "g4" },
          { id: "s10", name: "Shohruh Bekmurodov", groupId: "g4" },
        ],
      },
      {
        id: "g5",
        name: "DS-302",
        courseId: "3",
        students: [
          { id: "s11", name: "Temur Yuldashev", groupId: "g5" },
        ],
      },
    ],
  },
];
