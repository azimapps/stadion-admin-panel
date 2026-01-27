"use client"

import { useState } from "react"
import { StatCards } from "./components/stat-cards"
import { DataTable } from "./components/data-table"

import initialUsersData from "./data.json"

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: string
  joinedDate: string
}

interface UserFormValues {
  name: string
  email: string
  phone: string
  role: string
  password?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsersData)

  const handleAddUser = (userData: UserFormValues) => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      joinedDate: new Date().toISOString().split('T')[0],
    }
    setUsers(prev => [newUser, ...prev])
  }

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  const handleEditUser = (user: User) => {
    // For now, just log the user to edit
    // In a real app, you'd open an edit dialog
    console.log("Edit user:", user)
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
