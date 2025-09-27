import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            ไม่มีสิทธิ์เข้าถึง
          </h2>
          <p className="text-gray-600 mb-8">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">กลับหน้าหลัก</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">เข้าสู่ระบบใหม่</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
