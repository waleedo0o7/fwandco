import type { Access, FieldAccess } from 'payload'

export type CmsRole = 'admin' | 'editor'

type UserWithRole = {
  id: number | string
  role?: CmsRole | null
}

const getUser = (user: unknown): UserWithRole | null => {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return null
  }

  return user as UserWithRole
}

export const isAdmin: Access = ({ req }) => getUser(req.user)?.role === 'admin'

export const isAdminField: FieldAccess = ({ req }) =>
  getUser(req.user)?.role === 'admin'

export const isAdminOrEditor: Access = ({ req }) => {
  const role = getUser(req.user)?.role
  return role === 'admin' || role === 'editor'
}

export const isAdminOrSelf: Access = ({ req }) => {
  const user = getUser(req.user)

  if (!user) {
    return false
  }

  if (user.role === 'admin') {
    return true
  }

  return {
    id: {
      equals: user.id,
    },
  }
}

export const readPublishedOrAuthenticated: Access = ({ req }) => {
  if (getUser(req.user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
