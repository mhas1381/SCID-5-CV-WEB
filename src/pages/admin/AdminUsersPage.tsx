import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetAdminUsersQuery, useUpdateAdminUserMutation } from '@/store/api/adminApi'
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, Button, Input, VerifiedBadge, ConfirmDialog } from '@/components/ui'
import {
  Users, Search, ShieldCheck, UserCheck, UserX, BadgeCheck, XCircle,
  ClipboardList, Stethoscope, Phone, IdCard, X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/error'
import { formatDate, toPersianNum } from '@/utils/date'
import { cn } from '@/utils/cn'
import type {
  AdminRole,
  AdminUser,
  AdminUserUpdateRequest,
  AdminVerificationStatus,
} from '@/types'

const ROLE_OPTIONS: AdminRole[] = ['clinician', 'researcher', 'admin']
const VERIFICATION_FILTERS: AdminVerificationStatus[] = [
  'pending',
  'verified',
  'failed',
  'unverified',
]

interface Filters {
  search: string
  role: string
  verification_status: string
  is_active: string
}

const EMPTY_FILTERS: Filters = {
  search: '',
  role: '',
  verification_status: '',
  is_active: '',
}

interface CardViewerProps {
  user: AdminUser | null
  isUpdating: boolean
  onApprove: () => void
  onReject: () => void
  onClose: () => void
}

function OrganizationCardViewer({
  user,
  isUpdating,
  onApprove,
  onReject,
  onClose,
}: CardViewerProps) {
  const { t } = useTranslation()
  return (
    <AnimatePresence>
      {user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 mx-4 w-full max-w-lg rounded-xl bg-[var(--glass-bg)] backdrop-blur-xl p-6 shadow-[var(--glass-shadow)] border border-[var(--glass-border)]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onClose}
              className="absolute left-4 top-4 text-[hsl(var(--muted-foreground))] hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <IdCard className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-lg font-semibold">{t('admin.users.cardTitle')}</h3>
            </div>
            <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
              {t('admin.users.cardSubtitle', { name: user.full_name })}
            </p>
            {user.organization_card ? (
              <img
                src={user.organization_card}
                alt={t('admin.users.cardAlt')}
                className="mx-auto max-h-[60vh] w-full rounded-lg border border-[hsl(var(--border))] object-contain bg-[hsl(var(--muted))]"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
                {t('admin.users.cardMissing')}
              </div>
            )}
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onReject}
                  isLoading={isUpdating}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
                >
                  <XCircle className="ltr:mr-1.5 rtl:ml-1.5 h-4 w-4" />
                  {t('admin.users.reject')}
                </Button>
                <Button
                  onClick={onApprove}
                  isLoading={isUpdating}
                  className="text-green-700 dark:text-green-100 bg-green-600 hover:bg-green-700"
                >
                  <BadgeCheck className="ltr:mr-1.5 rtl:ml-1.5 h-4 w-4" />
                  {t('admin.users.approve')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function AdminUsersPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [deactivateTarget, setDeactivateTarget] = useState<number | null>(null)
  const [cardViewerUser, setCardViewerUser] = useState<AdminUser | null>(null)

  const queryParams = {
    ...(filters.search && { search: filters.search }),
    ...(filters.role && { role: filters.role }),
    ...(filters.verification_status && {
      verification_status: filters.verification_status,
    }),
    ...(filters.is_active && { is_active: filters.is_active }),
  }

  const { data: users, isLoading } = useGetAdminUsersQuery(queryParams)
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation()

  const update = async (
    id: number,
    patch: AdminUserUpdateRequest,
    msg: string
  ) => {
    try {
      await updateUser({ id, data: patch }).unwrap()
      toast.success(msg)
    } catch (err: any) {
      toast.error(getErrorMessage(err, t('admin.users.updateError')))
    }
  }

  const ROLE_MESSAGES: Record<AdminRole, string> = {
    admin: t('admin.users.roleAdmin'),
    researcher: t('admin.users.roleResearcher'),
    clinician: t('admin.users.roleClinician'),
  }

  const changeRole = (id: number, role: AdminRole) =>
    update(id, { role }, ROLE_MESSAGES[role])

  const approveVerification = (id: number) =>
    update(id, { verification_status: 'verified' }, t('admin.users.verifiedToast'))

  const rejectVerification = (id: number) =>
    update(id, { verification_status: 'failed' }, t('admin.users.rejectedToast'))

  const approveFromViewer = (id: number) => {
    setCardViewerUser(null)
    approveVerification(id)
  }

  const rejectFromViewer = (id: number) => {
    setCardViewerUser(null)
    rejectVerification(id)
  }

  const deactivate = (id: number) => {
    setDeactivateTarget(null)
    update(id, { is_active: false }, t('admin.users.deactivatedToast'))
  }

  const activate = (id: number) =>
    update(id, { is_active: true }, t('admin.users.activatedToast'))

  const selectClass =
    'flex h-9 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-2 py-1 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]'

  if (isLoading) {
    return <LoadingSpinner size="xl" className="py-20" />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[hsl(var(--primary))]" />
            {t('admin.users.title')}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {t('admin.users.description')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <ShieldCheck className="h-4 w-4" />
          {t('admin.users.roleHint')}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.users.search')}
              </label>
              <Input
                placeholder={t('admin.users.searchPlaceholder')}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                endAdornment={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.users.roleFilter')}
              </label>
              <select
                className={selectClass}
                value={filters.role}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <option value="">{t('admin.users.all')}</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {t(`admin.users.role_${role}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.users.verificationFilter')}
              </label>
              <select
                className={selectClass}
                value={filters.verification_status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    verification_status: e.target.value,
                  }))
                }
              >
                <option value="">{t('admin.users.all')}</option>
                {VERIFICATION_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {t(`admin.users.verification_${status}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {t('admin.users.statusFilter')}
              </label>
              <select
                className={selectClass}
                value={filters.is_active}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    is_active: e.target.value,
                  }))
                }
              >
                <option value="">{t('admin.users.all')}</option>
                <option value="true">{t('admin.users.active')}</option>
                <option value="false">{t('admin.users.inactive')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t('admin.users.listTitle')}
            <span className="text-xs font-normal text-[hsl(var(--muted-foreground))] ml-2">
              ({toPersianNum(String(users?.length ?? 0))})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!users || users.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] px-6 py-12 text-center">
              {t('common.noData')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                    <th className="px-4 py-3 text-start font-medium">{t('admin.users.name')}</th>
                    <th className="px-3 py-3 text-start font-medium">{t('admin.users.role')}</th>
                    <th className="px-3 py-3 text-start font-medium">{t('admin.users.verification')}</th>
                    <th className="px-3 py-3 text-center font-medium">{t('admin.users.stats')}</th>
                    <th className="px-3 py-3 text-center font-medium">{t('admin.users.status')}</th>
                    <th className="px-4 py-3 text-start font-medium">{t('admin.users.joined')}</th>
                    <th className="px-4 py-3 text-end font-medium">{t('admin.users.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={user.id}
                      className={cn(
                        idx > 0 && 'border-t border-[hsl(var(--border))]',
                        !user.is_active && 'opacity-60'
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-xs font-bold text-[hsl(var(--accent-foreground))]">
                            {user.first_name?.charAt(0) || '؟'}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate">{user.full_name}</span>
                            <span className="block text-xs text-[hsl(var(--muted-foreground))] dir-ltr text-left">
                              <Phone className="inline h-3 w-3 ltr:mr-1 rtl:ml-1" />
                              {user.phone_number}
                            </span>
                          </span>
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <select
                          className={selectClass}
                          value={user.role}
                          disabled={isUpdating || user.is_superuser}
                          onChange={(e) =>
                            changeRole(user.id, e.target.value as AdminRole)
                          }
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {t(`admin.users.role_${role}`)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <VerifiedBadge status={user.verification_status} />
                          {user.organization_card && (
                            <button
                              title={t('admin.users.viewCard')}
                              onClick={() => setCardViewerUser(user)}
                              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-[hsl(var(--border))] transition-transform hover:scale-105"
                            >
                              <img
                                src={user.organization_card}
                                alt={t('admin.users.cardAlt')}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          )}
                          {user.verification_status === 'pending' && (
                            <span className="flex gap-1">
                              <button
                                title={t('admin.users.approve')}
                                onClick={() => approveVerification(user.id)}
                                className="rounded p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/50"
                              >
                                <BadgeCheck className="h-4 w-4" />
                              </button>
                              <button
                                title={t('admin.users.reject')}
                                onClick={() => rejectVerification(user.id)}
                                className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-3 text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
                          <span title={t('admin.users.sessions')} className="flex items-center gap-1">
                            <ClipboardList className="h-3.5 w-3.5" />
                            {toPersianNum(String(user.sessions_count))}
                          </span>
                          <span title={t('admin.users.patients')} className="flex items-center gap-1">
                            <Stethoscope className="h-3.5 w-3.5" />
                            {toPersianNum(String(user.patients_count))}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                            user.is_active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          )}
                        >
                          {user.is_active
                            ? t('admin.users.active')
                            : t('admin.users.inactive')}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-4 py-3 text-end">
                        {user.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating || user.is_superuser}
                            onClick={() => setDeactivateTarget(user.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <UserX className="ltr:mr-1.5 rtl:ml-1.5 h-4 w-4" />
                            {t('admin.users.deactivate')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => activate(user.id)}
                            className="text-green-600 dark:text-green-400"
                          >
                            <UserCheck className="ltr:mr-1.5 rtl:ml-1.5 h-4 w-4" />
                            {t('admin.users.activate')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deactivateTarget !== null}
        title={t('admin.users.deactivateTitle')}
        message={t('admin.users.deactivateConfirm')}
        confirmLabel={t('admin.users.deactivate')}
        onConfirm={() => deactivateTarget && deactivate(deactivateTarget)}
        onCancel={() => setDeactivateTarget(null)}
      />

      <OrganizationCardViewer
        user={cardViewerUser}
        isUpdating={isUpdating}
        onApprove={() => cardViewerUser && approveFromViewer(cardViewerUser.id)}
        onReject={() => cardViewerUser && rejectFromViewer(cardViewerUser.id)}
        onClose={() => setCardViewerUser(null)}
      />
    </div>
  )
}
