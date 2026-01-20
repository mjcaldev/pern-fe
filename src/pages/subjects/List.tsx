import { ListView } from "@/components/refine-ui/views/list-view"
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEPARTMENTS_OPTIONS } from "@/constants"
import { CreateButton } from "@/components/refine-ui/buttons/create"
import { Subject } from "@/types"
import { useTable } from "@refinedev/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/refine-ui/data-table/data-table"
import type { ColumnDef } from "@tanstack/react-table"

const SubjectsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(() => [
      {
        id: 'code',
        accessorKey: 'code',
        size: 100,
        header: () => <p className="column-title ml-2">Code</p>,
        cell: ({ getValue }) => <Badge>{String(getValue())}</Badge>
      }
    ], []),
    refineCoreProps: {
      resource: 'subjects',
      pagination: {
        pageSize: 10,
        mode: 'server',
      },
        filters: {},
        sorters: {},
    }
    
  }
  );

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Subjects</h1>
      <div className="intro-row">
        <p>Quick access to essential metrics and management tools</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />

            <Input
            type="text"
            placeholder="Search by name..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Departments
                </SelectItem>
                {DEPARTMENTS_OPTIONS.map(department => (
                  <SelectItem key={department.value} value={department.value}>
                    {department.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateButton />
          </div>
        </div>
      </div>

      <DataTable table={subjectTable} />
    </ListView>
  )
}

export default SubjectsList