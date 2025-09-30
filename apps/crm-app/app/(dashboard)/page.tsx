import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { JobStatus, UserRole } from '@prisma/client'

async function getDashboardStats() {
  // Get real-time data from database
  const [
    totalCustomers,
    totalJobs,
    newJobs,
    inProgressJobs,
    completedJobs,
    activeCustomers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.job.count(),
    prisma.job.count({
      where: { status: JobStatus.NEW },
    }),
    prisma.job.count({
      where: { status: JobStatus.IN_PROGRESS },
    }),
    prisma.job.count({
      where: { status: JobStatus.DONE },
    }),
    prisma.customer.count({
      where: { status: 'ACTIVE' },
    }),
  ])

  return {
    totalCustomers,
    totalJobs,
    newJobs,
    inProgressJobs,
    completedJobs,
    activeCustomers,
  }
}

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Get real-time dashboard statistics
  const stats = await getDashboardStats()

  // User is logged in, show dashboard content with real data
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
        <p className="text-muted-foreground">
          ภาพรวมและสถิติการทำงานของระบบ Tinedy CRM (อัพเดทแบบเรียลไทม์)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            ลูกค้าทั้งหมด
          </h3>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ลูกค้าที่ใช้งาน: {stats.activeCustomers}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">งานใหม่</h3>
          <p className="text-2xl font-bold">{stats.newJobs}</p>
          <p className="text-xs text-muted-foreground mt-1">รอการมอบหมาย</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            งานที่กำลังดำเนินการ
          </h3>
          <p className="text-2xl font-bold">{stats.inProgressJobs}</p>
          <p className="text-xs text-muted-foreground mt-1">กำลังประมวลผล</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            งานที่เสร็จแล้ว
          </h3>
          <p className="text-2xl font-bold">{stats.completedJobs}</p>
          <p className="text-xs text-muted-foreground mt-1">
            จากทั้งหมด {stats.totalJobs} งาน
          </p>
        </div>
      </div>

      {/* Additional summary section */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-2">สรุปภาพรวม</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">งานทั้งหมด:</span>
              <span className="font-medium">{stats.totalJobs} งาน</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">อัตราการเสร็จสิ้น:</span>
              <span className="font-medium">
                {stats.totalJobs > 0
                  ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ลูกค้าเฉลี่ยต่องาน:</span>
              <span className="font-medium">
                {stats.totalJobs > 0
                  ? (stats.totalCustomers / stats.totalJobs).toFixed(1)
                  : '0'}{' '}
                ลูกค้า/งาน
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-2">การอัพเดทข้อมูล</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">ข้อมูลซิงค์แล้ว</span>
            </div>
            <div className="text-xs text-muted-foreground">
              อัพเดทล่าสุด: {new Date().toLocaleString('th-TH')}
            </div>
            <div className="text-xs text-muted-foreground">
              ข้อมูลจากฐานข้อมูลแบบเรียลไทม์
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
