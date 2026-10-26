import { getPayload } from 'payload'
import { z } from 'zod'

import configPromise from '../payload.config'

const seedEnvironmentSchema = z.object({
  SEED_ADMIN_EMAIL: z.email(),
  SEED_ADMIN_PASSWORD: z.string().min(12),
})

const richText = (text: string) => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})

const run = async () => {
  const seedEnvironment = seedEnvironmentSchema.parse(process.env)
  const payload = await getPayload({ config: configPromise })

  const existingAdmin = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: seedEnvironment.SEED_ADMIN_EMAIL } },
  })

  if (existingAdmin.docs[0]) {
    await payload.update({
      collection: 'users',
      data: { name: 'POC Administrator', role: 'admin' },
      id: existingAdmin.docs[0].id,
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'users',
      data: {
        email: seedEnvironment.SEED_ADMIN_EMAIL,
        name: 'POC Administrator',
        password: seedEnvironment.SEED_ADMIN_PASSWORD,
        role: 'admin',
      },
      overrideAccess: true,
    })
  }

  const ensureGroup = async (
    name: string,
    slug: string,
    description: string,
  ) => {
    const existing = await payload.find({
      collection: 'groups',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    const data = { description, name, slug }

    return existing.docs[0]
      ? payload.update({
          collection: 'groups',
          data,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({ collection: 'groups', data, overrideAccess: true })
  }

  const operations = await ensureGroup(
    'Operations',
    'operations',
    'Fictional operations team for compatibility testing.',
  )
  const clientServices = await ensureGroup(
    'Client Services',
    'client-services',
    'Fictional client services team for compatibility testing.',
  )

  const ensurePerson = async (
    name: string,
    jobTitle: string,
    group: number,
  ) => {
    const existing = await payload.find({
      collection: 'people',
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ name: { equals: name } }, { group: { equals: group } }],
      },
    })
    const data = { group, jobTitle, name }

    return existing.docs[0]
      ? payload.update({
          collection: 'people',
          data,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({ collection: 'people', data, overrideAccess: true })
  }

  const salma = await ensurePerson(
    'Salma Nabil',
    'Operations Coordinator',
    operations.id,
  )
  const youssef = await ensurePerson(
    'Youssef Adel',
    'Client Relations Specialist',
    clientServices.id,
  )

  const ensurePhone = async (
    person: number,
    number: string,
    label: 'mobile' | 'office',
  ) => {
    const existing = await payload.find({
      collection: 'phone-numbers',
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ person: { equals: person } }, { number: { equals: number } }],
      },
    })
    const data = { isPrimary: true, label, number, person }

    return existing.docs[0]
      ? payload.update({
          collection: 'phone-numbers',
          data,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({
          collection: 'phone-numbers',
          data,
          overrideAccess: true,
        })
  }

  await ensurePhone(salma.id, '+20 100 555 0101', 'mobile')
  await ensurePhone(youssef.id, '+20 2 5550 0202', 'office')

  const ensureAddress = async (
    person: number,
    label: string,
    line1: string,
  ) => {
    const existing = await payload.find({
      collection: 'addresses',
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ person: { equals: person } }, { label: { equals: label } }],
      },
    })
    const data = {
      city: 'Cairo',
      country: 'Egypt',
      isPrimary: true,
      label,
      line1,
      person,
    }

    return existing.docs[0]
      ? payload.update({
          collection: 'addresses',
          data,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({ collection: 'addresses', data, overrideAccess: true })
  }

  await ensureAddress(salma.id, 'Main office', '12 Fictional Nile Street')
  await ensureAddress(youssef.id, 'Client office', '45 Fictional Garden Avenue')

  const ensureTask = async (
    title: string,
    status: 'completed' | 'in_progress' | 'pending',
    description: string,
  ) => {
    const existing = await payload.find({
      collection: 'tasks',
      limit: 1,
      overrideAccess: true,
      where: { title: { equals: title } },
    })
    const data = { description, status, title }

    return existing.docs[0]
      ? payload.update({
          collection: 'tasks',
          data,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({ collection: 'tasks', data, overrideAccess: true })
  }

  const reviewTask = await ensureTask(
    'Review onboarding records',
    'in_progress',
    'Validate the fictional onboarding records used by this POC.',
  )
  const followUpTask = await ensureTask(
    'Prepare client follow-up',
    'pending',
    'Prepare a fictional client follow-up summary.',
  )

  const ensureAssignment = async (person: number, task: number) => {
    const existing = await payload.find({
      collection: 'task-assignments',
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ person: { equals: person } }, { task: { equals: task } }],
      },
    })
    const data = { assignedAt: new Date().toISOString(), person, task }

    return existing.docs[0]
      ? payload.update({
          collection: 'task-assignments',
          data,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({
          collection: 'task-assignments',
          data,
          overrideAccess: true,
        })
  }

  await ensureAssignment(salma.id, reviewTask.id)
  await ensureAssignment(youssef.id, followUpTask.id)

  const ensurePage = async (
    slug: 'about' | 'contact',
    title: string,
    body: string,
  ) => {
    const existing = await payload.find({
      collection: 'pages',
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
    const data = {
      _status: 'published' as const,
      content: richText(body),
      heading: title,
      seo: {
        description: `${body.slice(0, 145)} POC content.`,
        noIndex: true,
        title: `${title} | Compatibility POC`,
      },
      slug,
      title,
    }

    return existing.docs[0]
      ? payload.update({
          collection: 'pages',
          data,
          draft: false,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : payload.create({
          collection: 'pages',
          data,
          draft: false,
          overrideAccess: true,
        })
  }

  await ensurePage(
    'about',
    'About the POC',
    'This fictional page validates managed rich text content.',
  )
  await ensurePage(
    'contact',
    'Contact the test team',
    'Use the contact form to validate secure PostgreSQL persistence.',
  )

  payload.logger.info('Repeatable POC seed completed.')
  await payload.destroy()
}

await run()
