import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access/roles'
import { publicRead } from '../access/public'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'status', 'dueDate', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'dueDate',
      type: 'date',
      index: true,
    },
    {
      name: 'assignments',
      type: 'join',
      collection: 'task-assignments',
      on: 'task',
    },
  ],
}
