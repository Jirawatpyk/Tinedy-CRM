export type UserRole = 'ADMIN' | 'OPERATIONS' | 'MANAGER'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  lineUserId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  customerId: string
  title: string
  description?: string
  status: 'new' | 'in-progress' | 'completed'
  assignedToId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}