import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Customer } from '@tinedy/types'
import '@testing-library/jest-dom'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Mock fetch
global.fetch = jest.fn()

const mockCustomer: Customer = {
  id: '1',
  name: 'John Doe',
  phone: '0812345678',
  address: '123 Test Street',
  contactChannel: 'LINE',
  status: 'ACTIVE',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}

describe('CustomerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<CustomerForm mode="create" />)

      expect(screen.getByText('Add New Customer')).toBeInTheDocument()
      expect(screen.getByLabelText('Name *')).toHaveValue('')
      expect(screen.getByLabelText('Phone Number *')).toHaveValue('')
      expect(screen.getByLabelText('Contact Channel *')).toHaveValue('')
      expect(screen.getByLabelText('Address')).toHaveValue('')
      expect(screen.getByText('Create Customer')).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      render(<CustomerForm mode="create" />)

      fireEvent.click(screen.getByText('Create Customer'))

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Phone number is required')).toBeInTheDocument()
        expect(
          screen.getByText('Contact channel is required')
        ).toBeInTheDocument()
      })
    })

    it('should submit valid data and redirect on success', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      })

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('Contact Channel *'), {
        target: { value: 'LINE' },
      })
      fireEvent.change(screen.getByLabelText('Address'), {
        target: { value: '123 Test Street' },
      })

      fireEvent.click(screen.getByText('Create Customer'))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            phone: '0812345678',
            contactChannel: 'LINE',
            address: '123 Test Street',
          }),
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/customers')
      })
    })

    it('should display server validation errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          errors: {
            phone: 'Phone number already exists',
          },
        }),
      })

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('Contact Channel *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('Create Customer'))

      await waitFor(() => {
        expect(
          screen.getByText('Phone number already exists')
        ).toBeInTheDocument()
      })
    })

    it('should display general error messages', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
        }),
      })

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('Contact Channel *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('Create Customer'))

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument()
      })
    })
  })

  describe('Edit Mode', () => {
    it('should render edit form with pre-populated fields', () => {
      render(<CustomerForm mode="edit" customer={mockCustomer} />)

      expect(screen.getByText('Edit Customer')).toBeInTheDocument()
      expect(screen.getByLabelText('Name *')).toHaveValue('John Doe')
      expect(screen.getByLabelText('Phone Number *')).toHaveValue('0812345678')
      expect(screen.getByLabelText('Contact Channel *')).toHaveValue('LINE')
      expect(screen.getByLabelText('Address')).toHaveValue('123 Test Street')
      expect(screen.getByText('Update Customer')).toBeInTheDocument()
    })

    it('should submit updated data', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockCustomer, name: 'Jane Doe' }),
      })

      render(<CustomerForm mode="edit" customer={mockCustomer} />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'Jane Doe' },
      })

      fireEvent.click(screen.getByText('Update Customer'))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/customers/1', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Jane Doe',
            phone: '0812345678',
            contactChannel: 'LINE',
            address: '123 Test Street',
          }),
        })
      })
    })

    it('should handle edit validation errors', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          errors: {
            name: 'Name is required',
          },
        }),
      })

      render(<CustomerForm mode="edit" customer={mockCustomer} />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: '' },
      })

      fireEvent.click(screen.getByText('Update Customer'))

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument()
      })
    })
  })

  describe('Form Interaction', () => {
    it('should show loading state during submission', async () => {
      ;(fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve({ ok: true, json: () => mockCustomer }),
              100
            )
          })
      )

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('Contact Channel *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('Create Customer'))

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Create Customer')).toBeDisabled()
      expect(screen.getByText('Cancel')).toBeDisabled()
    })

    it('should cancel and go back', () => {
      render(<CustomerForm mode="create" />)

      fireEvent.click(screen.getByText('Cancel'))

      expect(mockBack).toHaveBeenCalled()
    })

    it('should call onSuccess callback when provided', async () => {
      const mockOnSuccess = jest.fn()
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      })

      render(<CustomerForm mode="create" onSuccess={mockOnSuccess} />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('Contact Channel *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('Create Customer'))

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
      })
    })
  })

  describe('Network Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<CustomerForm mode="create" />)

      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText('Phone Number *'), {
        target: { value: '0812345678' },
      })
      fireEvent.change(screen.getByLabelText('Contact Channel *'), {
        target: { value: 'LINE' },
      })

      fireEvent.click(screen.getByText('Create Customer'))

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })
})
