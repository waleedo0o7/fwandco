import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access/roles'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  access: {
    create: () => false,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'status', 'submittedAt'],
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      index: true,
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
        { label: 'Spam', value: 'spam' },
      ],
      required: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      index: true,
      required: true,
    },
  ],
}
