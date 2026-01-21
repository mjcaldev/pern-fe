export type MockSubject = {
  id: number;
  /** Human-friendly university course code (e.g. "CS101"). */
  courseCode: string;
  name: string;
  department: string;
  /** Brief course description. */
  description: string;
};

export const mockSubjects: MockSubject[] = [
  {
    id: 101,
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    description:
      "Foundational programming concepts, problem-solving, and computational thinking using a modern language.",
  },
  {
    id: 202,
    courseCode: "MATH221",
    name: "Linear Algebra",
    department: "Mathematics",
    description:
      "Vectors, matrices, linear transformations, eigenvalues, and real-world applications in data and engineering.",
  },
  {
    id: 303,
    courseCode: "ECON210",
    name: "Microeconomics",
    department: "Economics",
    description:
      "Supply and demand, consumer choice, firm behavior, market structures, and welfare analysis.",
  },
];

