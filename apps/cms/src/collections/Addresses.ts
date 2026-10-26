import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access/roles'
import { publicRead } from '../access/public'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['person', 'label', 'city', 'country'],
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'person',
      type: 'relationship',
      index: true,
      relationTo: 'people',
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'line1',
      type: 'text',
      required: true,
    },
    {
      name: 'line2',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'region',
      type: 'text',
    },
    {
      name: 'postalCode',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      defaultValue: 'Egypt',
      required: true,
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
