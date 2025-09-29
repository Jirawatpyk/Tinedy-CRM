export type UserRole = 'ADMIN' | 'OPERATIONS' | 'TRAINING' | 'QC_MANAGER'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export interface Customer {
  id: string
  name: string
  phone: string
  address?: string | null
  contactChannel: string
  status: CustomerStatus
  createdAt: Date
  updatedAt: Date
}

export interface CustomerCreateInput {
  name: string
  phone: string
  address?: string
  contactChannel: string
}

export interface CustomerUpdateInput {
  name?: string
  phone?: string
  address?: string
  contactChannel?: string
}

export type JobStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'ON_HOLD'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Job {
  id: string
  customerId: string
  serviceType: string
  description?: string
  status: JobStatus
  priority: Priority
  scheduledDate?: Date
  completedAt?: Date
  assignedUserId?: string
  price?: number
  notes?: string
  n8nWorkflowId?: string
  webhookData?: any
  createdAt: Date
  updatedAt: Date
}

export interface JobCreateInput {
  customerId: string
  serviceType: string
  description?: string
  priority?: Priority
  scheduledDate?: Date
  assignedUserId?: string
  price?: number
  notes?: string
  n8nWorkflowId?: string
  webhookData?: any
}

export interface JobUpdateInput {
  serviceType?: string
  description?: string
  status?: JobStatus
  priority?: Priority
  scheduledDate?: Date
  completedAt?: Date
  assignedUserId?: string
  price?: number
  notes?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}