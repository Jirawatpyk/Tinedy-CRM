import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import { CustomerForm } from '@/components/forms/CustomerForm'

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const session = await auth()

  // Check authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Check role permission (Admin only)
  if (session.user.role !== UserRole.ADMIN) {
    redirect('/access-denied')
  }

  // Fetch customer data
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      contactChannel: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-muted-foreground">
            Update customer information for {customer.name}.
          </p>
        </div>

        <CustomerForm mode="edit" customer={customer} />
      </div>
    </div>
  )
}
