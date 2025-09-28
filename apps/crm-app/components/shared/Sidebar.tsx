'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Users, Home, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navigation = [
  { name: 'แดชบอร์ด', href: '/', icon: Home },
  { name: 'ลูกค้า', href: '/customers', icon: Users },
  { name: 'การตั้งค่า', href: '/admin/settings', icon: Settings },
]

function SidebarContent() {
  const [currentPath, setCurrentPath] = useState('/')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  return (
    <div className="flex flex-col w-64 min-w-64 bg-white shadow-lg border-r">
      <div className="flex flex-col flex-1 min-h-screen">
        <div className="flex-1 pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Tinedy CRM</h2>
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href === '/customers' &&
                  currentPath.startsWith('/customers'))
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

export function Sidebar() {
  return <SidebarContent />
}
