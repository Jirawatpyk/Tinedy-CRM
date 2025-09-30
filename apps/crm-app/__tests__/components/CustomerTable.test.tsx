import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { CustomerTable } from '@/components/shared/CustomerTable'
import '@testing-library/jest-dom'

// Mock the fetch function
global.fetch = jest.fn()

const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    phone: '0812345678',
    contactChannel: 'LINE',
    address: '123 Test Street',
    status: 'ACTIVE',
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date('2023-01-01').toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '0987654321',
    contactChannel: 'Phone',
    address: '456 Test Avenue',
    status: 'INACTIVE',
    createdAt: new Date('2023-01-02').toISOString(),
    updatedAt: new Date('2023-01-02').toISOString(),
  },
]

// Helper to create API response
const createApiResponse = (customers: any[], totalCount?: number) => ({
  customers,
  pagination: {
    currentPage: 1,
    totalPages: Math.ceil((totalCount || customers.length) / 10),
    totalCount: totalCount || customers.length,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    query: null,
    status: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
})

describe('CustomerTable', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
    ;(fetch as jest.Mock).mockReset()
  })

  it('should render loading state initially', () => {
    ;(fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => createApiResponse([]),
              }),
            100
          )
        })
    )

    render(<CustomerTable />)
    expect(screen.getByText('กำลังโหลดข้อมูลลูกค้า...')).toBeInTheDocument()
  })

  it('should render customer data correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('0812345678')).toBeInTheDocument()
    })
  })

  it('should display status badges correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument()
      expect(screen.getByText('ไม่ใช้งาน')).toBeInTheDocument()
    })
  })

  it('should filter customers by search query', async () => {
    // Initial load with all customers
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )

    // Mock server-side search response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse([mockCustomers[0]], 1),
    })

    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(
      () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })

  it('should filter customers by phone number', async () => {
    // Initial load
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )

    // Mock server-side phone search response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse([mockCustomers[1]], 1),
    })

    fireEvent.change(searchInput, { target: { value: '0987' } })

    await waitFor(
      () => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })

  it('should show results count', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('แสดง 1-2 จาก 2 ลูกค้า')).toBeInTheDocument()
    })
  })

  it('should show clear search option when searching', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      expect(screen.getByText('ล้างตัวกรอง')).toBeInTheDocument()
    })
  })

  it('should clear search when clear button is clicked', async () => {
    // Initial load
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      expect(screen.getByText('ล้างตัวกรอง')).toBeInTheDocument()
    })

    // Mock re-fetch all customers
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    fireEvent.click(screen.getByText('ล้างตัวกรอง'))

    await waitFor(
      () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(searchInput).toHaveValue('')
      },
      { timeout: 1500 }
    )
  })

  it('should handle API error gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<CustomerTable />)

    await waitFor(
      () => {
        expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it('should show retry button on error', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<CustomerTable />)

    await waitFor(
      () => {
        expect(screen.getByText('ลองใหม่')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
  })

  it('should show empty state when no customers', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse([]),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีข้อมูลลูกค้า')).toBeInTheDocument()
    })
  })

  it('should show no search results message', async () => {
    // Initial load
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse(mockCustomers),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )

    // Mock server-side empty search result
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => createApiResponse([], 0),
    })

    fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

    await waitFor(
      () => {
        expect(
          screen.getByText('ไม่พบลูกค้าที่ตรงกับตัวกรอง')
        ).toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })
})
