import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', {
      name: /welcome to tinedy crm/i,
    })
    expect(heading).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Home />)
    const description = screen.getByText(
      /internal crm system for managing customers/i
    )
    expect(description).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<Home />)
    expect(screen.getByText('Customer Management')).toBeInTheDocument()
    expect(screen.getByText('Job Tracking')).toBeInTheDocument()
    expect(screen.getByText('Quality Control')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<Home />)
    expect(
      screen.getByRole('button', { name: /get started/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /learn more/i })
    ).toBeInTheDocument()
  })
})
