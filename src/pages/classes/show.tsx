import { AdvancedImage } from "@cloudinary/react";
import { useShow } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useParams } from "react-router";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bannerPhoto } from "@/lib/cloudinary";
import { ClassDetails } from "@/types";

type ClassUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

const ClassesShow = () => {
  const { id } = useParams();
  const classId = id ?? "";

  const { query } = useShow<ClassDetails>({
    resource: "classes",
    id: classId,
    queryOptions: {
      enabled: Boolean(classId),
    },
  });

  const classDetails = query.data?.data;

  const studentColumns = useMemo<ColumnDef<ClassUser>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        size: 240,
        header: () => <p className="column-title">Student</p>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              {row.original.image && (
                <AvatarImage src={row.original.image} alt={row.original.name} />
              )}
              <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="truncate">{row.original.name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {row.original.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "details",
        size: 140,
        header: () => <p className="column-title">Details</p>,
        cell: ({ row }) => (
          <ShowButton
            resource="users"
            recordItemId={row.original.id}
            variant="outline"
            size="sm"
          >
            View
          </ShowButton>
        ),
      },
    ],
    []
  );

  const studentsTable = useTable<ClassUser>({
    columns: studentColumns,
    refineCoreProps: {
      resource: `classes/${classId}/users`,
      queryOptions: {
        enabled: Boolean(classId),
      },
      pagination: {
        pageSize: 3,
        mode: "server",
      },
      filters: {
        permanent: [
          {
            field: "role",
            operator: "eq",
            value: "student",
          },
        ],
      },
    },
  });

  if (!classId) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">Missing class id.</p>
      </ShowView>
    );
  }

  if (query.isLoading || query.isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading class details..."
            : query.isError
            ? "Failed to load class details."
            : "Class details not found."}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? "Unknown";
  const teacherInitials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <ShowView className="class-view class-show space-y-6 w-full max-w-none">
      <ShowViewHeader resource="classes" title="Class Details" />

      <div className="banner">
        {classDetails.bannerUrl ? (
          classDetails.bannerUrl.includes("res.cloudinary.com") &&
          classDetails.bannerCldPubId ? (
            <AdvancedImage
              className="w-full h-auto max-h-[35vh] sm:max-h-[40vh] object-cover rounded-xl border"
              cldImg={bannerPhoto(
                classDetails.bannerCldPubId ?? "",
                classDetails.name
              )}
              alt="Class Banner"
            />
          ) : (
            <img
              src={classDetails.bannerUrl}
              alt={classDetails.name}
              loading="lazy"
              className="w-full h-auto max-h-[35vh] sm:max-h-[40vh] object-cover rounded-xl border"
            />
          )
        ) : (
          <div className="placeholder w-full aspect-[3/1] max-h-[35vh] sm:max-h-[40vh] rounded-xl bg-muted border" />
        )}
      </div>

      <Card className="details-card">
        <CardContent className="space-y-6">
          <div className="details-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-sky-500">
                {classDetails.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {classDetails.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{classDetails.capacity} spots</Badge>
              <Badge
                variant={classDetails.status === "active" ? "default" : "secondary"}
                data-status={classDetails.status}
              >
                {classDetails.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="details-grid grid gap-4 md:grid-cols-2">
            <div className="instructor rounded-xl border bg-card/50 p-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70">
                Instructor
              </p>
              <div className="mt-3 flex items-center gap-3 min-w-0">
                <Avatar className="size-12 sm:size-14 md:size-16 shrink-0">
                  {classDetails.teacher?.image ? (
                    <AvatarImage src={classDetails.teacher.image} alt={teacherName} />
                  ) : null}
                  <AvatarFallback className="text-sm sm:text-base font-semibold">
                    {teacherInitials || "NA"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="font-semibold truncate text-sky-500">
                    {teacherName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {classDetails.teacher?.email ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="department rounded-xl border bg-card/50 p-4">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70">
                Department
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-lg sm:text-xl font-semibold truncate text-sky-500">
                  {classDetails.department?.name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {classDetails.department?.description ?? "—"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="subject space-y-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/70">
              Subject
            </p>

            <div className="space-y-1">
              <Badge variant="outline">
                Code: <span>{classDetails.subject?.code ?? "—"}</span>
              </Badge>
              <p className="font-medium">{classDetails.subject?.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">
                {classDetails.subject?.description ?? "—"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="join space-y-3">
            <h2 className="text-lg font-semibold">Join Class</h2>

            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Ask your teacher for the invite code.</li>
              <li>Click on “Join Class” button.</li>
              <li>Paste the code and click “Join”.</li>
            </ol>

            <Button size="lg" className="w-full" disabled>
              Join Class
            </Button>
            <p className="text-xs text-muted-foreground">
              Note: the join action isn’t wired up yet (button has no handler).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable table={studentsTable} />
        </CardContent>
      </Card>
    </ShowView>
  );
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export default ClassesShow;