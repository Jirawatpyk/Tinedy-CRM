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
    email: 'john@example.com',
    address: '123 Test Street',
    status: 'ACTIVE',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '0987654321',
    email: 'jane@example.com',
    address: '456 Test Avenue',
    status: 'INACTIVE',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
]

describe('CustomerTable', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
  })

  it('should render loading state initially', () => {
    ;(fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () => resolve({ ok: true, json: () => ({ customers: [] }) }),
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
      json: async () => ({ customers: mockCustomers }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('0812345678')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  it('should display status badges correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument()
      expect(screen.getByText('ไม่ใช้งาน')).toBeInTheDocument()
    })
  })

  it('should filter customers by search query', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('should filter customers by phone number', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )
    fireEvent.change(searchInput, { target: { value: '0987' } })

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  it('should show results count', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('แสดง 2 จาก 2 ลูกค้า')).toBeInTheDocument()
    })
  })

  it('should show clear search option when searching', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
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
      expect(screen.getByText('ล้างการค้นหา')).toBeInTheDocument()
    })
  })

  it('should clear search when clear button is clicked', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
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
      expect(screen.getByText('ล้างการค้นหา')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('ล้างการค้นหา'))

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(searchInput).toHaveValue('')
    })
  })

  it('should handle API error gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should show retry button on error', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('ลองใหม่')).toBeInTheDocument()
    })
  })

  it('should show empty state when no customers', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: [] }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีข้อมูลลูกค้า')).toBeInTheDocument()
    })
  })

  it('should show no search results message', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ customers: mockCustomers }),
    })

    render(<CustomerTable />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      'ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทรศัพท์...'
    )
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } })

    await waitFor(() => {
      expect(
        screen.getByText('ไม่พบลูกค้าที่ตรงกับการค้นหา')
      ).toBeInTheDocument()
    })
  })
})
