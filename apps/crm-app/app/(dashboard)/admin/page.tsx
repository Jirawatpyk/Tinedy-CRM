'use client'

import { withRole } from '@/components/shared/withRole'
import { useRole } from '@/lib/hooks/useRole'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function AdminPage() {
  const { role } = useRole()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ยินดีต้อนรับ Admin</CardTitle>
            <CardDescription>คุณเข้าสู่ระบบในฐานะ: {role}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              หน้านี้สามารถเข้าถึงได้เฉพาะผู้ดูแลระบบเท่านั้น
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>จัดการผู้ใช้</CardTitle>
            <CardDescription>เพิ่ม แก้ไข และลบผู้ใช้ในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">จัดการผู้ใช้</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การตั้งค่าระบบ</CardTitle>
            <CardDescription>กำหนดค่าและตั้งค่าระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              การตั้งค่า
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>สถิติระบบ</CardTitle>
            <CardDescription>ข้อมูลสถิติและการใช้งานระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">ผู้ใช้ทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">ลูกค้าทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-600">งานทั้งหมด</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">งานที่เสร็จสิ้น</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withRole(AdminPage, {
  requiredRoles: ['ADMIN'],
  fallbackPath: '/unauthorized',
})
