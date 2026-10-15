// Copy for the site's sections, from the client's reference images (2026-10-12). The client
// confirmed on 2026-10-13 that the data provided is the complete, final record, so this wording
// is recorded as provided (SRC.reference) rather than as drafts.
// Facts (roles, organisations, dates, places, education, ventures) are NOT here: they come from
// profile.ts and site.ts, where they are verified. Where a reference image states a fact the
// verified record does not have (a start date, a place, a description that differs from Sai's
// own), the site shows the verified record and lib/content/review.ts lists the difference.
import { SRC, verified } from './schema.ts'

const given = <T>(value: T) => verified(value, SRC.reference)

export type Step = { title: string; text: string }
export type Detail = { tags: string[]; text?: string }

export const page = {
  // The line above the name in the hero (client's hero reference).
  hero: { focus: given(['Healthcare', 'Product', 'Strategy']) },
  labels: given({
    about: 'About',
    perspective: 'My perspective',
    principles: 'Guiding principles',
    work: 'How I work',
    path: 'Path',
    ventures: 'Ventures',
    experience: 'Experience',
    education: 'Education',
    connect: 'Let’s connect',
    present: 'Present',
    viewRecord: 'View public record',
    lookFor: 'What I look for',
  }),
  about: {
    // Set in three lines: bold, regular, then the accent line with its full stop.
    heading: given(['Solving', 'real healthcare', 'problems.']),
    sub: given('Turning complex challenges into practical solutions that people actually use.'),
    body: given([
      'I’m interested in the intersection of healthcare, technology and strategy, identifying real problems, shaping practical solutions and helping the people who need them.',
      'My approach blends product thinking, evidence and collaboration, so that change in healthcare is real and measurable.',
    ]),
    pillars: given<Step[]>([
      { title: 'Problem first', text: 'Start from real needs on the ground.' },
      { title: 'People focused', text: 'Design solutions that work for teams and patients.' },
      { title: 'Measurable impact', text: 'Translate ideas into tangible outcomes.' },
    ]),
    principles: given<Step[]>([
      { title: 'Curiosity', text: 'Stay open to new perspectives.' },
      { title: 'Clarity', text: 'Make complex problems understandable.' },
      { title: 'Collaboration', text: 'Work across disciplines to find better solutions.' },
      { title: 'Impact', text: 'Focus on long term value, not quick wins.' },
    ]),
  },
  work: {
    heading: given('From insight to impact.'),
    intro: given(
      'I follow a structured yet flexible approach to turn complex healthcare challenges into practical solutions, combining product thinking, evidence and collaboration to deliver outcomes teams can measure.',
    ),
    centre: given('Insight to impact'),
    steps: given<Step[]>([
      { title: 'Understand', text: 'Dive deep into the problem, context and people.' },
      { title: 'Analyse', text: 'Translate insights into clear strategy and opportunities.' },
      { title: 'Build', text: 'Work with teams to execute practical solutions.' },
      { title: 'Measure', text: 'Focus on real outcomes and continuous improvement.' },
    ]),
  },
  path: {
    heading: given('A focused and intentional journey.'),
    intro: given('My path brings together product, strategy and execution, all focused on better healthcare.'),
    items: given<Step[]>([
      {
        title: 'Product focus in healthcare',
        text: 'Worked on healthcare focused products, contributing to strategy, execution and stakeholder alignment.',
      },
      {
        title: 'Business advisory and growth',
        text: 'Supported growth and strategic initiatives across organisations in the healthcare ecosystem.',
      },
      {
        title: 'Exploring early stage ideas',
        text: 'Exploring and supporting early stage ideas and investments in healthcare and related areas.',
      },
    ]),
  },
  ventures: { heading: given('Turning insight into impact.') },
  experience: {
    heading: given('Where I’ve worked.'),
    sub: given('A progression from engineering to strategy and product, across healthcare and technology.'),
    // Per role (by verified title): tags, and a description only where Sai's own verified note
    // does not exist. A verified note always wins.
    roles: given<Record<string, Detail>>({
      'Senior Product Manager': {
        tags: ['Product', 'Strategy', 'Healthcare'],
        text: 'Working on healthcare products, contributing to strategy, execution and stakeholder alignment.',
      },
      'Requirements Analyst': { tags: ['Requirements', 'Pathology', 'Product'] },
      'Techno Functional Consultant & Business Strategy': {
        tags: ['Consulting', 'Strategy', 'Healthcare'],
        text: 'Worked on client engagements in the healthcare domain, bridging technology and business requirements.',
      },
      'Marketing Lead': { tags: ['Marketing', 'Growth', 'Media'], text: 'Led marketing initiatives and supported growth activities.' },
      'Software Engineer': { tags: ['Engineering', 'Development', 'Projects'] },
      'Associate Software Developer': { tags: ['Development', 'Angular', 'Java'] },
    }),
  },
  education: {
    heading: given('A strong foundation.'),
    sub: given(
      'My academic journey gave me the technical foundation and strategic perspective to work where healthcare and technology meet.',
    ),
    // By verified qualification.
    items: given<Record<string, Detail>>({
      'Master of Business Administration': {
        tags: ['Strategy', 'Leadership', 'Healthcare'],
        text: 'Built a strong foundation in business strategy, leadership and innovation, with a focus on the healthcare and technology ecosystem.',
      },
      'B.Tech, Computer Science Engineering': {
        tags: ['Engineering', 'Software Development', 'Problem Solving'],
        text: 'Developed a strong technical foundation in computer science, focusing on software development, algorithms and systems thinking.',
      },
    }),
  },
  connect: {
    // Set in three lines; the last carries the gradient.
    heading: given(['Open to', 'meaningful', 'conversations.']),
    body: given('I’m always open to discussing ideas, opportunities and collaborations in healthcare and technology.'),
    channels: given({
      email: 'Email',
      linkedin: 'LinkedIn',
      call: 'Schedule a call',
      callText: 'Let’s find a time to chat',
      linkedinSoon: 'Profile link coming soon',
      callSoon: 'Booking link coming soon',
    }),
    card: given({ kicker: 'Let’s build together', heading: ['Ideas today.', 'Better healthcare', 'tomorrow.'], button: 'Get in touch' }),
  },
}
