import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  const mutableCookieStore = cookieStore as unknown as {
    set?: (name: string, value: string, options?: Record<string, unknown>) => void
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            const setCookie = mutableCookieStore.set
            if (!setCookie) return

            cookiesToSet.forEach(({ name, value, options }) =>
              setCookie(name, value, options as Record<string, unknown>)
            )
          } catch {
            // No-op: cookies() is read-only in some server contexts.
          }
        },
      },
    }
  )
}
