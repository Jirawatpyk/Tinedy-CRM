'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Customer } from '@tinedy/types'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditCustomerPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Customer not found')
          }
          throw new Error('Failed to fetch customer')
        }

        const customerData = await response.json()
        setCustomer(customerData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCustomer()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading customer...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" asChild>
              <Link href="/customers">Back to Customers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The customer you're looking for could not be found.
            </p>
            <Button variant="outline" asChild>
              <Link href="/customers">Back to Customers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Edit Customer</h1>
        <p className="text-muted-foreground">
          Update customer information for {customer.name}
        </p>
      </div>

      <CustomerForm mode="edit" customer={customer} />
    </div>
  )
}