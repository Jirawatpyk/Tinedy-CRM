import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { CustomerForm } from '@/components/forms/CustomerForm'

export default async function NewCustomerPage() {
  const session = await auth()

  // Check authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Check role permission (Admin only)
  if (session.user.role !== UserRole.ADMIN) {
    redirect('/access-denied')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Add New Customer
          </h1>
          <p className="text-muted-foreground">
            Create a new customer record in the system.
          </p>
        </div>

        <CustomerForm mode="create" />
      </div>
    </div>
  )
}
