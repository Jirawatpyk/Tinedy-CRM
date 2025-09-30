import '@testing-library/jest-dom'

// Note: NODE_ENV is automatically set by Jest/Next.js build system
// Manual assignment causes read-only property errors in production builds

// Force React to use development build for better error messages and act() support
if (typeof global !== 'undefined') {
  // @ts-ignore
  global.IS_REACT_ACT_ENVIRONMENT = true
}

// Mock Next.js server modules for API route testing
jest.mock('next/server', () => ({
  NextRequest: jest.requireActual('next/dist/server/web/spec-extension/request')
    .NextRequest,
  NextResponse: {
    json: (data: any, init?: ResponseInit) => ({
      json: async () => data,
      status: init?.status || 200,
      statusText: init?.statusText || 'OK',
      headers: init?.headers || new Headers(),
    }),
  },
}))

// Mock Next.js Request
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  method: options?.method || 'GET',
  headers: new Map(),
  json: jest.fn().mockResolvedValue({}),
  nextUrl: {
    searchParams: new URLSearchParams(),
  },
  ...options,
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock Prisma Client for browser environment
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    checklistTemplate: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
  // Service Type enum
  ServiceType: {
    CLEANING: 'CLEANING',
    TRAINING: 'TRAINING',
    INSTALLATION: 'INSTALLATION',
    REPAIR: 'REPAIR',
    CONSULTATION: 'CONSULTATION',
    OTHER: 'OTHER',
  },
  // Job Status enum (Story 2.6 requirement)
  JobStatus: {
    NEW: 'NEW',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD',
  },
  // User Role enum
  UserRole: {
    ADMIN: 'ADMIN',
    OPERATIONS: 'OPERATIONS',
    TRAINING: 'TRAINING',
    QC_MANAGER: 'QC_MANAGER',
  },
  // Customer Status enum
  CustomerStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    BLACKLISTED: 'BLACKLISTED',
  },
  // Priority enum
  Priority: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
  },
}))
