import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { useTable } from "@refinedev/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useList } from "@refinedev/core";
import type { ClassDetails, Subject, User } from "@/types";

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: {
      pageSize: 100,
    },
    queryOptions: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: {
      pageSize: 100,
    },
    queryOptions: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  });

  const subjects = subjectsQuery.data?.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];

  const subjectFilters =
    selectedSubject === "all"
      ? []
      : [
          {
            field: "subject",
            operator: "eq" as const,
            value: selectedSubject,
          },
        ];

  const teacherFilters =
    selectedTeacher === "all"
      ? []
      : [
          {
            field: "teacher",
            operator: "eq" as const,
            value: selectedTeacher,
          },
        ];

  const searchFilters = debouncedSearchQuery
    ? [
        {
          field: "name",
          operator: "contains" as const,
          value: debouncedSearchQuery,
        },
      ]
    : [];

  const permanentFilters = useMemo(
    () => [...searchFilters, ...subjectFilters, ...teacherFilters],
    [debouncedSearchQuery, selectedSubject, selectedTeacher]
  );

  const classesTable = useTable<ClassDetails>({
    columns: useMemo<ColumnDef<ClassDetails>[]>(
      () => [
        {
          id: "banner",
          accessorKey: "bannerUrl",
          size: 120,
          header: () => <p className="column-title ml-2">Banner</p>,
          cell: ({ getValue }) => {
            const url = String(getValue() ?? "");

            if (!url) {
              return (
                <div className="h-10 w-16 rounded-md bg-muted border" />
              );
            }

            return (
              <img
                src={url}
                alt="Class banner"
                className="h-10 w-16 rounded-md object-cover"
                loading="lazy"
              />
            );
          },
        },
        {
          id: "name",
          accessorKey: "name",
          size: 260,
          header: () => <p className="column-title ml-2">Class Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">
              <Badge>{String(getValue() ?? "")}</Badge>
            </span>
          ),
          filterFn: "includesString",
        },
        {
          id: "status",
          accessorKey: "status",
          size: 120,
          header: () => <p className="column-title ml-2">Status</p>,
          cell: ({ getValue }) => {
            const status = String(getValue() ?? "");
            const variant = status === "active" ? "default" : "secondary";
            return <Badge variant={variant}>{status || "—"}</Badge>;
          },
        },
        {
          id: "subject",
          accessorKey: "subject.name",
          size: 220,
          header: () => <p className="column-title ml-2">Subject</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary">{String(getValue() ?? "—")}</Badge>
          ),
          filterFn: "includesString",
        },
        {
          id: "teacher",
          accessorKey: "teacher.name",
          size: 220,
          header: () => <p className="column-title ml-2">Teacher</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary">{String(getValue() ?? "—")}</Badge>
          ),
          filterFn: "includesString",
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          size: 120,
          header: () => <p className="column-title ml-2">Capacity</p>,
          cell: ({ getValue }) => (
            <Badge variant="outline">{String(getValue() ?? "—")}</Badge>
          ),
        },
      ],
      []
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      queryOptions: {
        staleTime: 10 * 1000,
        refetchOnWindowFocus: false,
        retry: 0,
      },
      filters: {
        permanent: permanentFilters,
      },
      sorters: {
        initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Classes</h1>
      <div className="intro-row">
        <p>Quick access to essential metrics and management tools</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />

            <Input
              type="text"
              placeholder="Search by class name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={String((s as any).id ?? s.name)} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by teacher..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton resource="classes" />
          </div>
        </div>
      </div>

      <DataTable table={classesTable} />
    </ListView>
  );
};

export default ClassesList;