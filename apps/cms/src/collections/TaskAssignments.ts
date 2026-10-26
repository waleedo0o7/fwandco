import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access/roles'
import { publicRead } from '../access/public'

export const TaskAssignments: CollectionConfig = {
  slug: 'task-assignments',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['person', 'task', 'assignedAt'],
  },
  indexes: [
    {
      fields: ['person', 'task'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'person',
      type: 'relationship',
      index: true,
      relationTo: 'people',
      required: true,
    },
    {
      name: 'task',
      type: 'relationship',
      index: true,
      relationTo: 'tasks',
      required: true,
    },
    {
      name: 'assignedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'note',
      type: 'textarea',
    },
  ],
}
