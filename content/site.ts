// Section copy and diagram data, from the client's mockup. Mockup wording is `draft`
// (visible on preview, blocks production until Sai approves). Facts are `verified` with a
// source, or left out entirely — the mockup's city, its 2023 timeline entry and its
// descriptions of Floryn Health and Feedec are replaced by what the public record supports.
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
  lifecycle: ['Brief', 'Requirement', 'Stakeholders', 'Story', 'Decision'],
  // The hero's corner word stacks, from the client's reference image.
  marks: {
    left: draft(['Product', 'Technology', 'Business'], 'Mockup copy — Sai to approve'),
    right: draft(['People', 'Systems', 'Execution', 'Outcomes'], 'Mockup copy — Sai to approve'),
  },
}

export const technology = {
  caption: 'From ambiguity to specification',
  headline: draft('First, read it as an engineer.', mock),
  body: draft('A clear requirement reduces ambiguity, accelerates delivery and aligns everyone on what to build.', mock),
  // The scene's closing line, once the brief has been read into R1–R4.
  resolved: draft('Four requirements. Nothing added.', 'Mockup copy — Sai to approve'),
}

export const business = {
  caption: 'The people and the trade-off',
  headline: draft('Then, read it as a business.', mock),
  body: draft('The same requirement means different things to different people. It needs to work for all of them.', mock),
  requirement: 'Reduce onboarding time without adding headcount',
  // Interpretations of the brief — drafts.
  people: [
    { id: 'client', label: 'Client', items: [['+', 'Faster onboarding'], ['+', 'Better experience'], ['+', 'Higher satisfaction']] },
    { id: 'operations', label: 'Operations', items: [['+', 'Faster onboarding'], ['+', 'No additional headcount']], conflict: 'speed ↔ headcount' },
    { id: 'finance', label: 'Finance', items: [['+', 'Cost efficiency'], ['+', 'Maintain margins'], ['+', 'Scalable growth']] },
  ] as { id: string; label: string; items: [string, string][]; conflict?: string }[],
  outro: draft(['From requirements', 'to real-world impact'], mock),
}

export const leadership = {
  caption: 'Different perspectives. One decision.',
  headline: draft('Good decisions happen when different perspectives become one direction.', mock),
  body: draft('Analyse, align and decide with clarity.', mock),
  // The three perspectives, each with what it asks (from the client's reference image).
  circles: [
    { label: 'Technology', items: draft(['What’s possible?', 'Constraints', 'Trade-offs'], mock) },
    { label: 'Business', items: draft(['What’s viable?', 'Growth', 'ROI / Efficiency'], mock) },
    { label: 'People', items: draft(['What’s needed?', 'Adoption', 'Impact'], mock) },
  ],
  inputs: ['Requirements', 'Stakeholders', 'Constraints', 'Opportunities'],
  analysis: draft(['Evaluate', 'Compare', 'Find trade-offs', 'Identify risks'], mock),
  decision: 'A clear direction that works for all.',
  outro: draft(['From perspectives', 'to real-world impact'], mock),
}

export const ventures = {
  caption: 'Ideas into real-world impact',
  headline: draft('Turn insight into impact.', mock),
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
  // Not a company: the client's reference-image card, for Sai to approve (never verified by us).
  upcoming: draft({ title: 'Upcoming', line: 'Early-stage opportunities', sectors: 'AI · Healthcare · Consumer' }, mock),
  outro: draft(['From ideas', 'to real-world companies'], mock),
}

export type CareerRole = { from?: string; to?: string; title: string; org: string; place?: string; note?: string }
export type CareerGroup = { roles: CareerRole[] }

export const experience = {
  caption: 'A career of expanding impact',
  headline: draft(
    'From building to communicating to analysing and advising — a consistent focus on solving meaningful problems.',
    mock,
  ),
  body: draft('Different roles. Different domains. The same curiosity to understand, solve and create impact.', mock),
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
  // What each period added: editorial framing, one verb per group above.
  verbs: draft('Build · Communicate · Analyse · Advise', mock),
  // Notes Sai has not given yet, keyed by role title (reference-image copy, to approve).
  notes: {
    'Marketing Lead': draft('Content strategy, campaign execution and audience growth', mock),
  } as Record<string, ReturnType<typeof draft<string>>>,
  outro: draft(['From experience', 'to greater impact'], mock),
}

export const education = {
  caption: 'A stronger foundation',
  headline: draft('A stronger foundation for greater impact.', mock),
  body: draft('A blend of engineering rigor and business perspective that shapes how I approach problems today.', mock),
  // Keyed by qualification order in profile.education: [B.Tech, MBA].
  tags: draft(['Systems · Technology · Problem Solving', 'Business Strategy · Markets · Leadership'], mock),
  layers: [
    { label: 'Business layer', items: draft(['Strategy', 'Markets', 'Leadership', 'Global Perspective'], mock) },
    { label: 'Engineering foundation', items: draft(['Systems', 'Technology', 'Problem Solving', 'Analytical Thinking'], mock) },
  ],
  outro: draft(['From learning', 'to lasting impact'], mock),
}

export const contact = {
  caption: 'Your brief',
  headline: draft('What’s next?', mock),
  body: draft('Tell me what you’re working on. A new perspective always leads to interesting conversations.', mock),
  placeholder: 'Type your brief here…',
  focus: draft(['Product', 'Technology', 'Business', 'Opportunities'], mock),
  topics: draft(['Project', 'Opportunity', 'Advice', 'Collaboration', 'Other'], mock),
  outro: draft(['New perspectives', 'create new outcomes'], mock),
}
