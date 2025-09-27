import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // User is logged in, show dashboard content
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
        <p className="text-muted-foreground">
          ภาพรวมและสถิติการทำงานของระบบ Tinedy CRM
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            ลูกค้าทั้งหมด
          </h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">งานใหม่</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            งานที่กำลังดำเนินการ
          </h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            งานที่เสร็จแล้ว
          </h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
