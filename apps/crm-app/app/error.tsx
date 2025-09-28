'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            เกิดข้อผิดพลาด
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'เกิดข้อผิดพลาดภายในระบบ'}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button onClick={reset} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="w-full"
          >
            กลับสู่หน้าหลัก
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="text-sm text-gray-500 cursor-pointer">
              ข้อมูลการ Debug
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
