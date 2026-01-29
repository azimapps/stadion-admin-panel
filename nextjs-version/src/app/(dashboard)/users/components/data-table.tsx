"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Search,
  Activity,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserFormDialog } from "./user-form-dialog"
import { UserViewDialog } from "./user-view-dialog"

interface User {
  id: number
  name: string
  phone: string
  stadium_ids: number[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserFormValues {
  name: string
  phone: string
  stadium_ids: number[]
  is_active: boolean
}

interface DataTableProps {
  users: User[]
  onDeleteUser: (id: number) => void
  onEditUser: (user: User) => void
  onAddUser: (userData: UserFormValues) => void
}

export function DataTable({ users, onDeleteUser, onEditUser, onAddUser }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const getStatusColor = (active: boolean) => {
    return active
      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
  }

  const exactFilter = (row: Row<User>, columnId: string, value: string) => {
    return row.getValue(columnId) === value
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: "Ism",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-medium">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Telefon",
      cell: ({ row }) => <span className="text-sm">{row.getValue("phone")}</span>,
    },
    {
      accessorKey: "stadium_ids",
      header: "Stadionlar",
      cell: ({ row }) => {
        const ids = row.getValue("stadium_ids") as number[]
        return <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded-full text-xs">{ids.length} ta stadion</span>
      },
    },
    {
      accessorKey: "is_active",
      header: "Holat",
      cell: ({ row }) => {
        const active = row.getValue("is_active") as boolean
        return (
          <Badge variant="secondary" className={getStatusColor(active)}>
            {active ? "Faol" : "Nofaol"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Qo'shilgan sana",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()}</span>
      },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">Amallar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-border/50">
                <UserViewDialog
                  user={user}
                  trigger={
                    <DropdownMenuItem className="cursor-pointer py-2.5" onSelect={(e) => e.preventDefault()}>
                      <Eye className="mr-2 size-4 text-muted-foreground" />
                      Batafsil ko'rish
                    </DropdownMenuItem>
                  }
                />
                <UserFormDialog
                  user={user}
                  onEditUser={onEditUser}
                  trigger={
                    <DropdownMenuItem className="cursor-pointer py-2.5" onSelect={(e) => e.preventDefault()}>
                      <Pencil className="mr-2 size-4 text-muted-foreground" />
                      Tahrirlash
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  O'chirish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })



  return (
    <div className="w-full space-y-6">
      {/* Search and Main Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Managerlarni qidirish..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) =>
                table.getColumn("is_active")?.setFilterValue(value === "all" ? "" : value === "active")
              }
            >
              <SelectTrigger className="h-11 w-[140px] rounded-xl bg-background/50 border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Holat" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="inactive">Nofaol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center">
          <UserFormDialog onAddUser={onAddUser} />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 text-muted-foreground font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group hover:bg-muted/30 transition-colors border-border/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Search className="size-8 opacity-20" />
                    <p>Ma'lumot topilmadi.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Ko'rsatish:</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="w-[70px] h-9 rounded-lg bg-background border-border/50 cursor-pointer">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top" className="rounded-lg">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground hidden sm:block">
            <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span> tadan
            <span className="font-medium text-primary mx-1">{table.getFilteredSelectedRowModel().rows.length}</span> tasi tanlandi
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium mr-2">
            <span className="text-muted-foreground">Sahifa</span>
            <div className="flex items-center justify-center min-w-[40px] h-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
              {table.getState().pagination.pageIndex + 1}
            </div>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{table.getPageCount()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 px-4 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              Oldingi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 px-4 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              Keyingi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
