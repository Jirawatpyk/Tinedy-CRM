import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserX, ArrowLeft, Users } from 'lucide-react'

export default function CustomerNotFound() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto space-y-6 text-center">
        <div>
          <UserX className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            ไม่พบข้อมูลลูกค้า
          </h2>
          <p className="mt-2 text-gray-600">
            ลูกค้าที่คุณค้นหาไม่มีอยู่ในระบบ หรืออาจถูกลบไปแล้ว
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/customers">
            <Button className="w-full">
              <Users className="w-4 h-4 mr-2" />
              ดูรายการลูกค้าทั้งหมด
            </Button>
          </Link>

          <Link href="/customers/new">
            <Button variant="outline" className="w-full">
              เพิ่มลูกค้าใหม่
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับสู่หน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
