"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  EllipsisVertical,
  Eye,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
import { UserViewDialog } from "./user-view-dialog"
import { AppUser, AppUsersParams } from "@/services/app-user"

interface DataTableProps {
  users: AppUser[]
  total: number
  params: AppUsersParams
  isLoading: boolean
  onSearch: (search: string) => void
  onSortChange: (sort_by: 'newest' | 'most_paid') => void
  onPageChange: (skip: number) => void
  onLimitChange: (limit: number) => void
}

export function DataTable({
  users,
  total,
  params,
  isLoading,
  onSearch,
  onSortChange,
  onPageChange,
  onLimitChange
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchValue, setSearchValue] = useState("")
  const [viewUser, setViewUser] = useState<AppUser | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
  }

  const getStatusColor = (active: boolean) => {
    return active
      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      : "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
  }

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return phone.slice(-2)
  }

  const columns: ColumnDef<AppUser>[] = [
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
      accessorKey: "fullname",
      header: "Foydalanuvchi",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.fullname || user.phone} />}
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {getInitials(user.fullname, user.phone)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.fullname || "Noma'lum"}</span>
              <span className="text-xs text-muted-foreground">{user.phone}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "total_orders",
      header: "Buyurtmalar",
      cell: ({ row }) => {
        const count = row.getValue("total_orders") as number
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold">{count}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "total_spent",
      header: "Jami to'lov",
      cell: ({ row }) => {
        const amount = row.getValue("total_spent") as number
        return (
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatPrice(amount)}
          </span>
        )
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
      header: "Ro'yxatdan o'tgan",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <span className="text-sm text-muted-foreground">{date.toLocaleDateString('uz-UZ')}</span>
      },
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">Amallar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-border/50">
                <DropdownMenuItem
                  className="cursor-pointer py-2.5"
                  onSelect={() => setViewUser(user)}
                >
                  <Eye className="mr-2 size-4 text-muted-foreground" />
                  Batafsil ko'rish
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  })

  const currentPage = Math.floor((params.skip || 0) / (params.limit || 50)) + 1
  const totalPages = Math.ceil(total / (params.limit || 50))

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchValue)
  }

  // Calculate stats
  const totalSpent = users.reduce((sum, user) => sum + user.total_spent, 0)
  const totalOrders = users.reduce((sum, user) => sum + user.total_orders, 0)

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami foydalanuvchilar</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami buyurtmalar</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami to'lovlar</p>
              <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Telefon yoki ism bo'yicha qidirish..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Button type="submit" variant="secondary" className="rounded-xl">
            Qidirish
          </Button>
        </form>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Saralash:</span>
          <Select
            value={params.sort_by || 'newest'}
            onValueChange={(value: 'newest' | 'most_paid') => onSortChange(value)}
          >
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Eng yangi</SelectItem>
              <SelectItem value="most_paid">Ko'p to'lagan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
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
                  className="group hover:bg-muted/30 transition-colors border-border/50 cursor-pointer"
                  onClick={() => setViewUser(row.original)}
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
                    <p>Foydalanuvchi topilmadi.</p>
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
              value={`${params.limit || 50}`}
              onValueChange={(value) => onLimitChange(Number(value))}
            >
              <SelectTrigger className="w-[70px] h-9 rounded-lg bg-background border-border/50 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="rounded-lg">
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground hidden sm:block">
            Jami <span className="font-medium text-foreground">{total}</span> ta foydalanuvchi
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium mr-2">
            <span className="text-muted-foreground">Sahifa</span>
            <div className="flex items-center justify-center min-w-[40px] h-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
              {currentPage}
            </div>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{totalPages || 1}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((params.skip || 0) - (params.limit || 50))}
              disabled={currentPage <= 1}
              className="h-9 px-4 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              Oldingi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((params.skip || 0) + (params.limit || 50))}
              disabled={currentPage >= totalPages}
              className="h-9 px-4 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              Keyingi
            </Button>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      {viewUser && (
        <UserViewDialog
          user={viewUser}
          open={!!viewUser}
          onOpenChange={(open) => !open && setViewUser(null)}
        />
      )}
    </div>
  )
}
