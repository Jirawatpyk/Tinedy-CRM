import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { JobForm } from '@/components/jobs/JobForm'

export default async function NewJobPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">สร้างงานใหม่</h1>
          <p className="mt-2 text-sm text-gray-700">
            กรอกข้อมูลงานบริการใหม่ในระบบ
          </p>
        </div>

        <JobForm />
      </div>
    </div>
  )
}
