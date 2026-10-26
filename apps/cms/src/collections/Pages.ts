import type { CollectionConfig } from 'payload'

import {
  isAdmin,
  isAdminOrEditor,
  readPublishedOrAuthenticated,
} from '../access/roles'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: readPublishedOrAuthenticated,
    update: isAdminOrEditor,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'select',
      index: true,
      options: [
        { label: 'About', value: 'about' },
        { label: 'Contact', value: 'contact' },
      ],
      required: true,
      unique: true,
    },
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'contactInformation',
      type: 'group',
      admin: {
        condition: (_, siblingData) => siblingData?.slug === 'contact',
      },
      fields: [
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'address', type: 'textarea' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          maxLength: 60,
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 160,
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      required: true,
    },
  ],
  versions: {
    drafts: {
      autosave: false,
    },
    maxPerDoc: 20,
  },
}
