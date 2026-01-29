"use client"

import { useState } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"

import initialUsersData from "./data.json"

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsersData)

  const handleAddUser = (userData: UserFormValues) => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      name: userData.name,
      phone: userData.phone,
      stadium_ids: userData.stadium_ids,
      is_active: userData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setUsers(prev => [newUser, ...prev])
  }

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user =>
      user.id === updatedUser.id ? { ...updatedUser, updated_at: new Date().toISOString() } : user
    ))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
      </div>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
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
