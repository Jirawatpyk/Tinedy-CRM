// Shared types for Tinedy CRM

export type UserRole = 'ADMIN' | 'OPERATIONS' | 'TRAINING' | 'QC_MANAGER'

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export type ServiceType = 'CLEANING' | 'TRAINING'

export type JobStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type QCStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'NEEDS_REVIEW'

export type TrainingStatus =
  | 'AWAITING_DOCUMENTS'
  | 'DOCUMENTS_RECEIVED'
  | 'TRAINING_IN_PROGRESS'
  | 'TRAINING_COMPLETED'
  | 'COMPLETED'

export type WebhookStatus = 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'RETRY_NEEDED'

// Database model types
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

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  customerId: string
  serviceType: ServiceType
  scheduledDate: Date
  price: number
  status: JobStatus
  notes?: string | null
  assignedUserId?: string | null
  description?: string | null
  priority: Priority
  completedAt?: Date | null
  n8nWorkflowId?: string | null
  webhookData?: any | null
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Form types
export interface CustomerFormData {
  name: string
  phone: string
  address?: string
  contactChannel: string
  status?: CustomerStatus
}

export interface JobFormData {
  customerId: string
  serviceType: ServiceType
  scheduledDate: string
  price: number
  notes?: string
  description?: string
  priority?: Priority
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}