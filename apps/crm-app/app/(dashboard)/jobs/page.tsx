import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { JobsTable } from '@/components/jobs/JobsTable'
import Link from 'next/link'

export default async function JobsPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATIONS') {
    redirect('/')
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">งานบริการ</h1>
          <p className="mt-2 text-sm text-gray-700">
            รายการงานบริการทั้งหมดในระบบ
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link href="/jobs/new">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              สร้างงานใหม่
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <JobsTable />
      </div>
    </div>
  )
}
