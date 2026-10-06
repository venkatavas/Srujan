'use client'

import { useState } from 'react'

export function EmailActions({ email }: { email?: string }) {
  const [copied, setCopied] = useState(false)
  if (!email) return null
  return (
    <span className="contact__actions">
      <a href={`mailto:${email}`}>Write</a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          } catch {}
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </span>
  )
}
