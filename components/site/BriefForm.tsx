'use client'

import { CalendarDays, Mail } from 'lucide-react'
import { useState } from 'react'

/**
 * YOUR BRIEF — the visitor writes the next requirement and picks what it is about. Sending opens
 * their mail app addressed to Sai's verified email, the topic in the subject. Until that email is
 * confirmed, sending is disabled.
 *
 * The topics are native radios (one choice, arrow keys, no JS needed); the chips are their labels.
 * "Or connect via": each channel is a real link only once its fact is verified (the caller passes
 * only verified values); until then it is drawn, inactive, and marked "Coming soon". Never a fake
 * link.
 */
export function BriefForm({
  email,
  placeholder,
  topics = [],
  linkedin,
  booking,
}: {
  email?: string
  placeholder: string
  topics?: string[]
  linkedin?: string
  booking?: string
}) {
  const [text, setText] = useState('')
  const [topic, setTopic] = useState(topics[0] ?? '')
  const ready = !!email && text.trim().length > 0

  const channels = [
    { id: 'linkedin', label: 'LinkedIn', href: linkedin, Icon: LinkedinMark, external: true },
    { id: 'email', label: 'Email', href: email ? `mailto:${email}` : undefined, Icon: Mail, external: false },
    { id: 'booking', label: 'Book a call', href: booking, Icon: CalendarDays, external: true },
  ]

  return (
    <form
      className="panel brief-form"
      data-step={1}
      aria-labelledby="brief-title"
      onSubmit={(e) => {
        e.preventDefault()
        const body = text.trim()
        if (!email || !body) return
        const subject = `New brief${topic ? ` — ${topic}` : ''}: ${body.slice(0, 60)}`
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      }}
    >
      <div className="brief-form__head">
        <label id="brief-title" htmlFor="brief-input">
          New brief
        </label>
        <span>
          Direct message <i className="brief-form__live" aria-hidden="true" />
        </span>
      </div>

      <div className="brief-form__body">
        <div className="brief-form__field">
          <textarea
            id="brief-input"
            className="brief-form__input"
            placeholder={placeholder}
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {/* The narrative caret, resting in the empty field; focus hands over to the real one. */}
          <span className="caret brief-form__caret" aria-hidden="true" />
        </div>

        <div className="brief-form__row">
          {topics.length > 0 && (
            <fieldset className="brief-form__topics">
              <legend className="brief-form__sr">Topic</legend>
              {topics.map((t) => (
                <label key={t} className="brief-form__chip">
                  <input
                    type="radio"
                    name="topic"
                    value={t}
                    checked={topic === t}
                    onChange={() => setTopic(t)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </fieldset>
          )}
          <button type="submit" className="btn btn--accent brief-form__send" disabled={!ready}>
            Send brief <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="brief-form__foot">
          {!email && <p className="brief-form__note">Sending opens once Sai’s email is confirmed.</p>}
          <div className="brief-form__connect">
            <span id="brief-connect">Or connect via</span>
            <ul aria-labelledby="brief-connect">
              {channels.map(({ id, label, href, Icon, external }) => (
                <li key={id}>
                  {href ? (
                    <a
                      href={href}
                      aria-label={label}
                      title={label}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <Icon aria-hidden="true" strokeWidth={1.5} />
                    </a>
                  ) : (
                    <span role="link" aria-disabled="true" aria-label={`${label}, coming soon`} title="Coming soon">
                      <Icon aria-hidden="true" strokeWidth={1.5} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </form>
  )
}

/** lucide no longer ships brand marks: a small "in" drawn in the same stroke language. */
function LinkedinMark({ strokeWidth = 1.5, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M8 10.5v6" />
      <circle cx="8" cy="7.4" r="0.4" fill="currentColor" />
      <path d="M12 16.5v-6M12 13.2c0-1.6 1.1-2.7 2.5-2.7s2.5 1.1 2.5 2.7v3.3" />
    </svg>
  )
}
