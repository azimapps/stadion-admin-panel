"use client"

import { useState, useEffect, useCallback } from "react"

import { DataTable } from "./components/data-table"
import { managersService, Manager, ManagerFormValues } from "@/services/manager"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState<Manager[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log("Fetching users from backend...")
      const data = await managersService.getAll()
      console.log("Users fetched successfully:", data)
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Foydalanuvchilarni yuklashda xatolik yuz berdi")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAddUser = async (userData: ManagerFormValues) => {
    try {
      console.log("Adding user to backend:", userData)
      const newUser = await managersService.create(userData)
      console.log("User added successfully:", newUser)
      setUsers(prev => [newUser, ...prev])
      toast.success("Foydalanuvchi muvaffaqiyatli qo'shildi")
    } catch (error) {
      throw error
    }
  }

  const handleDeleteUser = async (id: number) => {
    try {
      console.log(`Deleting user with ID ${id} from backend...`)
      await managersService.delete(id)
      console.log("User deleted successfully")
      setUsers(prev => prev.filter(user => user.id !== id))
      toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi")
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Foydalanuvchini o'chirishda xatolik yuz berdi")
      throw error
    }
  }

  const handleEditUser = async (updatedUser: Manager) => {
    try {
      const { id, stadium_ids: newStadiums = [], ...rest } = updatedUser
      const originalUser = users.find(u => u.id === id);

      // 1. Update basic info (PUT doesn't support stadium_ids)
      const result = await managersService.update(id, rest)

      // 2. Sync stadiums if changed
      if (originalUser) {
        const originalStadiums = originalUser.stadium_ids || [];

        const added = newStadiums.filter(sId => !originalStadiums.includes(sId));
        const removed = originalStadiums.filter(sId => !newStadiums.includes(sId));

        // Execute updates
        await Promise.all([
          ...added.map(sId => managersService.addStadiumAccess(id, sId)),
          ...removed.map(sId => managersService.removeStadiumAccess(id, sId))
        ]);
      }

      await fetchUsers()
      toast.success("Foydalanuvchi ma'lumotlari yangilandi")
    } catch (error) {
      console.error("Failed to update user:", error)
      throw error // Re-throw so dialog can handle loading state
    }
  }

  if (isLoading) {
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
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
        />
      </div>
    </div>
  )
}
