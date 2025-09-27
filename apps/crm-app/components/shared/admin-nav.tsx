'use client'

import Link from 'next/link'
import { useRole } from '@/lib/hooks/useRole'
import { Button } from '@/components/ui/button'

export function AdminNav() {
  const { isAdmin, isManager } = useRole()

  if (!isAdmin() && !isManager()) {
    return null
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center space-x-4">
        <Link href="/" className="text-lg font-semibold">
          Tinedy CRM
        </Link>

        <div className="flex space-x-2">
          {isAdmin() && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/users">จัดการผู้ใช้</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/settings">การตั้งค่า</Link>
              </Button>
            </>
          )}

          {(isAdmin() || isManager()) && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/manager">Manager Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
