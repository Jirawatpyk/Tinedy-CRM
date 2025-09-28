'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Customer page error:', error)
  }, [error])

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            เกิดข้อผิดพลาดในหน้าลูกค้า
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ไม่สามารถโหลดข้อมูลลูกค้าได้ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า'}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่
          </Button>

          <Link href="/customers">
            <Button variant="outline" className="w-full">
              กลับสู่รายการลูกค้า
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" className="w-full">
              กลับสู่หน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
