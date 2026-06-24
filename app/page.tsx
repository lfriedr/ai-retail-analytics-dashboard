// The root page at "/" — we just redirect straight to /dashboard.
// redirect() is a Next.js server-side function that sends the user to a new URL
// before any HTML is rendered.
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
