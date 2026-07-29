'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { loginSuccess, logout } from '@/lib/features/auth/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const authState = useAppSelector((state) => state.authState)
  const { user, isAuthenticated, isLoading } = authState || { user: null, isAuthenticated: false, isLoading: true }

  useEffect(() => {
    // Check for existing authentication on mount
    const checkAuth = async () => {
      try {
        // Check for auth token in cookies
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        })

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              dispatch(loginSuccess(data.user))
            } else {
              dispatch(logout())
            }
          } else {
            dispatch(logout())
          }
        } else {
          // Non-JSON response (404 HTML page)
          console.error('Auth session endpoint returned non-JSON response:', response.status)
          dispatch(logout())
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        dispatch(logout())
      }
    }

    // Only check if not already authenticated
    if (!isAuthenticated && !isLoading) {
      checkAuth()
    }
  }, [dispatch, isAuthenticated, isLoading])

  return {
    user,
    isAuthenticated,
    isLoading
  }
}
