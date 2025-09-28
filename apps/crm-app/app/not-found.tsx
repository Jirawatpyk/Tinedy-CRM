import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-6 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            ไม่พบหน้าที่ต้องการ
          </h2>
          <p className="mt-2 text-gray-600">
            หน้าที่คุณค้นหาอาจถูกย้าย ลบ หรือไม่มีอยู่จริง
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              กลับสู่หน้าหลัก
            </Button>
          </Link>

          <Link href="/customers">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ไปหน้ารายการลูกค้า
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  )
}
