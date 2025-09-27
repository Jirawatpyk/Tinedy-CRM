'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, Home, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: Home },
  { name: 'ลูกค้า', href: '/customers', icon: Users },
  { name: 'การตั้งค่า', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium border-l-4 rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 px-2 pb-4">
          <button
            onClick={() => signOut()}
            className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full rounded-md"
          >
            <LogOut
              className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
              aria-hidden="true"
            />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  )
}
