// Facts and verified wording the site renders: the positioning, the ventures and the career.
// Facts are `verified` with a source, or left out entirely; the mockup's city, its 2023 timeline
// entry and its descriptions of Floryn Health and Feedec are replaced by what the public record
// supports. Wording still to approve is `draft` (shown on previews, never rendered once a draft).
import { draft, SRC, verified } from './schema.ts'

const mock = 'Client mockup copy — Sai to approve'

export const home = {
  // Three verified current roles (see `experience.career`): Clinisys, Floryn Health, the ventures.
  title: verified('Senior Product Manager · Director & Business Advisor · Venture Capitalist', SRC.client),
  // The approved positioning: the hero's title and supporting line (client brief, 2026-10-12).
  // A positioning, not a job title: the verified roles stay in `title` and the career.
  positioning: verified(
    { title: 'Digital Health Strategist', line: 'Building the future of healthcare.' },
    { label: 'Provided by Sai Srujan Pasala', accessed: '2026-10-12' },
  ),
}

export const ventures = {
  body: verified('Back and build solutions that create real value.', SRC.reference),
  // What flows into a product (from the client's reference image).
  inputs: verified(
    [
      { label: 'Market insight', lines: ['Unmet needs', 'Opportunities'] },
      { label: 'Real problems', lines: ['From operators', 'and users'] },
      { label: 'Capabilities', lines: ['Technology', 'Network'] },
      { label: 'Conviction', lines: ['Long-term value', 'Real-world impact'] },
    ],
    SRC.reference,
  ),
  // Company lines are sourced facts only.
  // Sai's role in each (as the client states it) and what the public record says the company is.
  companies: [
    {
      id: 'floryn-health',
      name: 'Floryn Health',
      role: verified('Director · Business Advisor · Venture Capitalist', SRC.client),
      line: verified('Private limited company · India', SRC.tracxnFloryn),
    },
    {
      id: 'feedec',
      name: 'Feedec',
      role: verified('Venture Capitalist', SRC.client),
      line: verified('Social commerce platform · Roorkee, India', SRC.playFeedec),
    },
  ],
}

export type CareerRole = { from?: string; to?: string; title: string; org: string; place?: string; note?: string }
export type CareerGroup = { roles: CareerRole[] }

export const experience = {
  // The career as given (LinkedIn experience and the client), oldest first, in four periods.
  // Dates appear only where they were given: for the ventures, only that they are current.
  career: verified<CareerGroup[]>(
    [
      {
        roles: [
          {
            from: 'May 2018',
            to: 'Apr 2019',
            title: 'Associate Software Developer',
            org: 'Tech Mahindra',
            place: 'Hyderabad, Telangana, India',
            note: 'Angular 4 and Java developer on enhancement projects',
          },
          {
            from: 'Apr 2019',
            to: 'Aug 2020',
            title: 'Software Engineer',
            org: 'Tech Mahindra',
            place: 'Hyderabad, Telangana, India',
            note: 'SuccessFactors consultant, end-to-end project management',
          },
        ],
      },
      {
        roles: [{ from: '2021', title: 'Marketing Lead', org: 'Times of India' }],
      },
      {
        roles: [
          {
            from: 'Jul 2022',
            to: 'Feb 2023',
            title: 'Techno Functional Consultant & Business Strategy',
            // The full company name, from Sai's CV (SRC.cv); LinkedIn shows "GAIT". The CV gives a
            // different title and end date (lib/content/review.ts); LinkedIn's are kept until Sai says.
            org: 'Gait Global',
            place: 'Hyderabad, Telangana, India',
          },
        ],
      },
      {
        roles: [
          {
            from: 'Jul 2023',
            title: 'Requirements Analyst',
            org: 'Clinisys',
            place: 'Bengaluru, Karnataka, India · Hybrid',
            note: 'Customer requirements for anatomical pathology products',
          },
          // Promoted; the client gave no start date for the new role.
          { to: 'Present', title: 'Senior Product Manager', org: 'Clinisys' },
        ],
      },
    ],
    SRC.linkedin,
  ),
  // Notes Sai has not given yet, keyed by role title (reference-image copy, to approve).
  notes: {
    'Marketing Lead': draft('Content strategy, campaign execution and audience growth', mock),
  } as Record<string, ReturnType<typeof draft<string>>>,
}
