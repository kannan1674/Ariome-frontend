'use client'

import TeacherLayout from '@/app/components/layouts/teacher/teacher-layout'
import { getProfileInfo } from '@/lib/Actions/authActions'
import { isAdmin, isTeacher, resolveUserRole } from '@/lib/auth/resolveUserRole'
import { isAuthenticated } from '@/lib/utils/tokenStorage'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function TeacherPagesLayout({ children }: { children: React.ReactNode }) {
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
    if (isAdmin(role)) {
      router.replace('/admin/teachers')
      return
    }
    if (!isTeacher(role)) {
      router.replace('/home')
    }
  }, [router, role, sessionBootstrapped, isLoading])

  if (!sessionBootstrapped || isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50">
        <Loader2 className="size-10 animate-spin text-teal-600" aria-label="Loading" />
      </div>
    )
  }

  if (!isTeacher(role)) {
    return null
  }

  return <TeacherLayout>{children}</TeacherLayout>
}
