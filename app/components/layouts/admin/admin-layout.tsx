'use client'

import { cn } from '@/lib/utils'
import { logout } from '@/lib/Actions/authActions'
import { useAppDispatch } from '@/lib/store'
import { Film, LayoutDashboard, LogOut, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
  { href: '/admin/videos', label: 'Videos', icon: Film, exact: false },
] as const

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    await dispatch(logout() as never)
    router.replace('/signin')
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="min-w-0 shrink">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-indigo-600">
              Ariome
            </p>
            <p className="truncate text-sm font-semibold text-gray-900">Admin</p>
          </div>

          <nav aria-label="Admin" className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition sm:gap-2 sm:px-4',
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 sm:px-3"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
