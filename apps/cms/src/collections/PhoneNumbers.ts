import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access/roles'
import { publicRead } from '../access/public'

export const PhoneNumbers: CollectionConfig = {
  slug: 'phone-numbers',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: publicRead,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['person', 'label', 'number', 'isPrimary'],
    useAsTitle: 'number',
  },
  indexes: [
    {
      fields: ['person', 'number'],
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
      name: 'label',
      type: 'select',
      defaultValue: 'mobile',
      options: [
        { label: 'Mobile', value: 'mobile' },
        { label: 'Office', value: 'office' },
        { label: 'Home', value: 'home' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'number',
      type: 'text',
      required: true,
      validate: (value: null | string | undefined) => {
        if (!value || !/^\+?[0-9][0-9\s()-]{6,24}$/.test(value)) {
          return 'Enter a valid phone number.'
        }

        return true
      },
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
