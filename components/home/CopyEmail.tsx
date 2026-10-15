'use client'

// "Copy email" under the email route: useful where no mail app is set up. It renders only once the
// page's script runs (a button that does nothing without JavaScript would be a dead end), says
// "Copied" briefly, and announces the result to screen readers. If the browser refuses clipboard
// access, it says so and points to the address shown above, which can always be selected by hand.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const subscribe = () => () => {}

export function CopyEmail({ email }: { email: string }) {
  const enhanced = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  if (!enhanced) return null

  const copy = async () => {
    setState('idle') // empties the live region, so a repeat copy is announced again
    try {
      await navigator.clipboard.writeText(email)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState('idle'), 2400)
  }

  return (
    <span className="st-copy">
      <button type="button" className="st-copy__btn" onClick={copy}>
        {state === 'copied' ? 'Copied' : 'Copy email'}
      </button>
      <span className={state === 'failed' ? 'st-copy__note' : 'sk-bar__sr'} role="status">
        {state === 'copied' ? 'Email address copied' : state === 'failed' ? 'Copying was blocked; select the address above instead.' : ''}
      </span>
    </span>
  )
}
