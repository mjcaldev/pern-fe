import {
  BaseRecord,
  DataProvider,
  GetListParams,
  GetListResponse,
} from "@refinedev/core";
import type { Subject } from "@/types";
import { mockSubjects, type MockSubject } from "@/mocks/subjects";

const toSubjectRecord = (s: MockSubject): Subject => ({
  id: s.id,
  code: s.courseCode,
  name: s.name,
  department: s.department,
  description: s.description,
  createdAt: new Date().toISOString(),
});

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
  }: GetListParams): Promise<GetListResponse<TData>> => {
      if (resource !== 'subjects') {
        return {data: [] as TData[], total: 0};
      }
      const subjects = mockSubjects.map(toSubjectRecord);

      return {
        data: subjects as unknown as TData[],
        total: subjects.length,
      }
    },
    getOne: async () => {throw new Error('This function is not present in the mock data provider')},
    create: async () => {throw new Error('This function is not present in the mock data provider')},
    update: async () => {throw new Error('This function is not present in the mock data provider')},
    deleteOne: async () => {throw new Error('This function is not present in the mock data provider')},
    getApiUrl: () => '',
  }
