import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Search } from 'lucide-react'

export default function JobNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">ไม่พบงานที่ต้องการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              งานที่คุณต้องการดูอาจถูกลบแล้ว หรือคุณอาจไม่มีสิทธิ์เข้าถึงงานนี้
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/customers">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับไปรายการลูกค้า
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  ไปหน้าหลัก
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
