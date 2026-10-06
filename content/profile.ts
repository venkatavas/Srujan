import { SRC, draft, pending, verified } from './schema.ts'

export type Education = {
  qualification: string
  institution: string
  from: number
  to: number
  result: string
}

export const profile = {
  name: verified('Sai Srujan Pasala', SRC.client),
  // Long names split: given names hang above, surname sits on the horizon.
  nameLines: ['Sai Srujan', 'Pasala'] as const,
  positioning: draft(
    'Computer science engineer and MBA, working across technology, business, media and ventures.',
    'Composed from verified education and the career areas in the brief — client to approve wording',
  ),
  city: pending('City / base'),
  email: pending('Contact email', true),
  linkedin: pending('LinkedIn URL'),
  openTo: pending('One plain sentence on the conversations Sai is open to (board, advisory, investment)', true),
  education: verified<Education[]>(
    [
      {
        qualification: 'B.Tech, Computer Science Engineering',
        institution: 'GITAM University',
        from: 2013,
        to: 2017,
        result: '80.3%',
      },
      {
        qualification: 'Master of Business Administration',
        institution: 'Jindal Global University',
        from: 2020,
        to: 2022,
        result: 'GPA 7.81 / 8.0',
      },
    ],
    SRC.client,
  ),
  engineeringRoles: pending('Engineering employers, titles and dates (2017 onward)', true),
  leadershipRoles: pending('Senior / advisory titles, organisations and mandates'),
}

// Disciplines named in the brief — used as plain labels, never as claims of scope.
export const disciplines = {
  technology: verified(['Requirements analysis', 'Software engineering', 'Enterprise technology'], SRC.brief),
  business: verified(['Client requirements', 'Business understanding', 'Stakeholder management'], SRC.brief),
  leadership: verified('Leadership and business advisory.', SRC.brief),
}
