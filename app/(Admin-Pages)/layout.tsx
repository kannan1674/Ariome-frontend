'use client'

import AdminLayout from '@/app/components/layouts/admin/admin-layout'
import { getProfileInfo } from '@/lib/Actions/authActions'
import { isAdmin, resolveUserRole } from '@/lib/auth/resolveUserRole'
import { isAuthenticated } from '@/lib/utils/tokenStorage'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPagesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, sessionBootstrapped, isLoading } = useAppSelector((s) => s.authState)
  const role = resolveUserRole(user)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/signin')
      return
    }
    if (!sessionBootstrapped) {
      void dispatch(getProfileInfo() as never)
    }
  }, [dispatch, router, sessionBootstrapped])

  useEffect(() => {
    if (!sessionBootstrapped || isLoading) return
    if (!isAuthenticated()) {
      router.replace('/signin')
      return
    }
    if (!isAdmin(role)) {
      router.replace(role === 'teacher' ? '/teacher' : '/home')
    }
  }, [router, role, sessionBootstrapped, isLoading])

  if (!sessionBootstrapped || isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50">
        <Loader2 className="size-10 animate-spin text-indigo-600" aria-label="Loading" />
      </div>
    )
  }

  if (!isAdmin(role)) {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}
