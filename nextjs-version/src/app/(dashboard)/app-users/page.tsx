"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "./components/data-table"
import { appUsersService, AppUser, AppUsersParams } from "@/services/app-user"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function AppUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [params, setParams] = useState<AppUsersParams>({
    skip: 0,
    limit: 50,
    sort_by: 'newest'
  })

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await appUsersService.getAll(params)
      setUsers(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Foydalanuvchilarni yuklashda xatolik yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (search: string) => {
    setParams(prev => ({ ...prev, search, skip: 0 }))
  }

  const handleSortChange = (sort_by: 'newest' | 'most_paid') => {
    setParams(prev => ({ ...prev, sort_by, skip: 0 }))
  }

  const handlePageChange = (skip: number) => {
    setParams(prev => ({ ...prev, skip }))
  }

  const handleLimitChange = (limit: number) => {
    setParams(prev => ({ ...prev, limit, skip: 0 }))
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <DataTable
          users={users}
          total={total}
          params={params}
          isLoading={isLoading}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  )
}
