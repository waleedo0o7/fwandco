import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access/roles'
import { publicRead } from '../access/public'

export const Groups: CollectionConfig = {
  slug: 'groups',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'members',
      type: 'join',
      collection: 'people',
      on: 'group',
    },
  ],
}
