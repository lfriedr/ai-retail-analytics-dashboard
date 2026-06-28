// Generates a unique session ID for each browser and stores it in localStorage.
// This lets each visitor have their own private slice of the database
// without needing to create an account.
export function getSessionId(): string {
  // localStorage is only available in the browser, not on the server
  if (typeof window === 'undefined') return ''

  let id = localStorage.getItem('retail_ai_session')
  if (!id) {
    // crypto.randomUUID() generates a unique ID like "a1b2c3d4-..."
    id = crypto.randomUUID()
    localStorage.setItem('retail_ai_session', id)
  }
  return id
}
