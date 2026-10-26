import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access/roles'
import { publicRead } from '../access/public'

export const People: CollectionConfig = {
  slug: 'people',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['name', 'group', 'jobTitle', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'jobTitle',
      type: 'text',
    },
    {
      name: 'group',
      type: 'relationship',
      index: true,
      relationTo: 'groups',
      required: true,
    },
    {
      name: 'phoneNumbers',
      type: 'join',
      collection: 'phone-numbers',
      on: 'person',
    },
    {
      name: 'addresses',
      type: 'join',
      collection: 'addresses',
      on: 'person',
    },
    {
      name: 'taskAssignments',
      type: 'join',
      collection: 'task-assignments',
      on: 'person',
    },
  ],
}
