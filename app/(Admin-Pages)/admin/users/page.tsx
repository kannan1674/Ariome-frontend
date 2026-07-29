'use client'

import { PremiumDateFilter } from '@/components/admin/PremiumDateFilter'
import { fetchUsers, formatUserDate } from '@/lib/admin/adminApi'
import type { AdminUser } from '@/lib/admin/types'
import { isSameDay } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'

const ROLE_LABEL: Record<AdminUser['role'], string> = {
  user: 'User',
  teacher: 'Teacher',
  admin: 'Admin',
}

const ROLE_STYLES: Record<AdminUser['role'], string> = {
  user: 'bg-gray-100 text-gray-700',
  teacher: 'bg-teal-50 text-teal-700',
  admin: 'bg-indigo-50 text-indigo-700',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinedDate, setJoinedDate] = useState<Date | undefined>()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchUsers()
      setUsers(list)
    } catch {
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredUsers = useMemo(() => {
    if (!joinedDate) return users
    return users.filter((u) => {
      const created = new Date(u.createdAt)
      if (Number.isNaN(created.getTime())) return false
      return isSameDay(created, joinedDate)
    })
  }, [users, joinedDate])

  const columns = useMemo<MRT_ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 160,
        Cell: ({ row }) => (
          <div>
            <span className="font-medium text-gray-900">{row.original.name}</span>
            <span className="block text-xs text-gray-500">
              {row.original.firstName} {row.original.lastName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 200,
        Cell: ({ cell }) => (
          <span className="text-gray-700">{cell.getValue<string>() || '—'}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        size: 130,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 100,
        filterVariant: 'select',
        filterSelectOptions: ['user', 'teacher', 'admin'],
        Cell: ({ cell }) => {
          const role = cell.getValue<AdminUser['role']>()
          return (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_STYLES[role] || ROLE_STYLES.user}`}
            >
              {ROLE_LABEL[role] || role}
            </span>
          )
        },
      },
      {
        accessorKey: 'emailVerified',
        header: 'Verified',
        size: 90,
        filterVariant: 'select',
        filterSelectOptions: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
        accessorFn: (row) => (row.emailVerified ? 'true' : 'false'),
        Cell: ({ row }) => (
          <span
            className={
              row.original.emailVerified
                ? 'text-emerald-600 font-medium'
                : 'text-gray-400'
            }
          >
            {row.original.emailVerified ? 'Yes' : 'No'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        size: 110,
        Cell: ({ cell }) => (
          <span className="text-gray-600">{formatUserDate(cell.getValue<string>())}</span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-600">
            All registered accounts on the platform.
          </p>
        </div>
        <PremiumDateFilter
          value={joinedDate}
          onChange={setJoinedDate}
          placeholder="Filter by joined date"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-indigo-600" aria-label="Loading" />
        </div>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={filteredUsers}
          enableColumnActions={false}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableGlobalFilter
          enablePagination
          enableSorting
          initialState={{
            pagination: { pageSize: 15, pageIndex: 0 },
            sorting: [{ id: 'createdAt', desc: true }],
          }}
          muiPaginationProps={{
            rowsPerPageOptions: [10, 15, 25, 50],
          }}
          muiSearchTextFieldProps={{
            placeholder: 'Search users…',
            size: 'small',
          }}
          muiTablePaperProps={{
            sx: {
              border: '1px solid #e5e7eb',
              boxShadow: 'none',
              borderRadius: '12px',
            },
          }}
          muiTableContainerProps={{
            sx: { borderRadius: '12px' },
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: '#f5f5f5',
              color: '#4B5675',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRight: '1px solid #e5e7eb',
              '&:last-child': { borderRight: 'none' },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              fontSize: '0.875rem',
              paddingY: '10px',
              borderRight: '1px solid #e5e7eb',
              '&:last-child': { borderRight: 'none' },
            },
          }}
          renderEmptyRowsFallback={() => (
            <p className="py-10 text-center text-sm text-gray-500">
              {joinedDate
                ? 'No users joined on this date.'
                : 'No users found.'}
            </p>
          )}
        />
      )}
    </div>
  )
}
