import { SRC, pending, verified } from './schema.ts'

export type Education = {
  qualification: string
  institution: string
  from: number
  to: number
  result: string
}

export const profile = {
  name: verified('Sai Srujan Pasala', SRC.client),
  // Given names above, surname below.
  nameLines: ['Sai Srujan', 'Pasala'] as const,
  email: verified('pasalasaisrujan@gmail.com', { label: 'Provided by the client', accessed: '2026-10-12' }),
  linkedin: verified('https://www.linkedin.com/in/sai-srujan-pasala/', { label: 'Provided by the client', accessed: '2026-10-12' }),
  booking: pending('Calendar booking link'),
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
    // Sai's CV (SRC.cv, 2026-10-12) gives the same qualifications, institutions, years and results.
    SRC.client,
  ),
}
