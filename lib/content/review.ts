// Facts to confirm with Sai: gaps, conflicts and wording questions about what the live site
// shows. Listed on /review (for Sai), never on the page itself. Nothing here is
// resolved by guessing: each item waits for Sai's answer. Draft wording is listed separately on
// /review (from lib/content/audit.ts), so it is not repeated here.

export type ReviewKind = 'missing' | 'conflict' | 'confirm'
export type ReviewItem = { area: string; kind: ReviewKind; item: string }

export const FACTS_TO_CONFIRM: ReviewItem[] = [
  {
    area: 'Experience',
    kind: 'missing',
    item: 'Start date and place of the Senior Product Manager role at Clinisys. A reference image says "2023 - now" and "Bengaluru, Karnataka, India", but neither was given; the site shows "Present" only.',
  },
  { area: 'Experience', kind: 'missing', item: 'Clinisys, Requirements Analyst: when did it end (the promotion date)?' },
  {
    area: 'Experience',
    kind: 'missing',
    item: 'Times of India, Marketing Lead: month, end date and place. A reference image says "Jan 2021 - Dec 2021" and "India"; only "2021" is known, so the site shows "2021".',
  },
  {
    area: 'Experience',
    kind: 'conflict',
    item: 'Gait Global: your CV and LinkedIn differ. LinkedIn: "Techno Functional Consultant & Business Strategy", Jul 2022 - Feb 2023. CV: "Techno Functional Consultant (BA)", July 2022 - March 2023. The site shows the LinkedIn title and dates (and the full name "Gait Global" from the CV). Which is right?',
  },
  {
    area: 'Experience',
    kind: 'confirm',
    item: 'Gait Global description "client engagements in the healthcare domain": is the healthcare domain correct?',
  },
  {
    area: 'Experience',
    kind: 'confirm',
    item: 'Tech Mahindra: the site keeps your LinkedIn wording ("SuccessFactors consultant, end-to-end project management"; "Angular 4 and Java developer on enhancement projects"), not the reworded versions in the reference image. Keep? Your CV also lists a single role (Software Engineer, May 2018 - August 2020); the site shows the two roles from LinkedIn.',
  },
  {
    area: 'Experience',
    kind: 'conflict',
    item: 'The MBA (2020 - 2022) overlaps Tech Mahindra (to Aug 2020), Times of India (2021) and Gait Global (from Jul 2022). Was it part-time? There are also gaps: Aug 2020 - 2021 and Feb (March on your CV) - Jul 2023.',
  },
  {
    area: 'Ventures',
    kind: 'conflict',
    item: 'Floryn Health role wording: "Director & Business Advisor" (one role) or "Director · Business Advisor" (two)?',
  },
  {
    area: 'Ventures',
    kind: 'confirm',
    item: 'Feedec "Roorkee, India" comes from the Google Play developer address. Does it describe the company?',
  },
  { area: 'Education', kind: 'confirm', item: 'Official institution names: your CV says "GITAM University" and "Jindal Global University", as the site does. Keep these, or use the full names (e.g. "O.P. Jindal Global University")?' },
  { area: 'Education', kind: 'confirm', item: 'Show your results (B.Tech 80.3%, MBA GPA 7.81 / 8.0)? Hidden for now.' },
  { area: 'Let’s connect', kind: 'missing', item: 'A booking link for "Schedule a call" (email and LinkedIn are confirmed).' },
]
