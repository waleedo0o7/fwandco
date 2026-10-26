import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    create: async ({ req }) => {
      if (req.user) {
        return isAdmin({ req })
      }

      const existingUsers = await req.payload.count({
        collection: 'users',
        overrideAccess: true,
      })

      return existingUsers.totalDocs === 0
    },
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') {
          return data
        }

        const existingUsers = await req.payload.count({
          collection: 'users',
          overrideAccess: true,
        })

        if (existingUsers.totalDocs === 0) {
          return { ...data, role: 'admin' }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      required: true,
    },
  ],
}
