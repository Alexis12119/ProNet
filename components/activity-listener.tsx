"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function ActivityListener() {
  useEffect(() => {
    let checkIntervalId: NodeJS.Timeout

    const checkAndRefreshSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session && session.expires_at) {
          const expiresAt = session.expires_at
          const now = Math.floor(Date.now() / 1000)
          const timeUntilExpiry = expiresAt - now

          // Refresh if token expires within next 5 minutes
          if (timeUntilExpiry < 300) {
            console.log('Refreshing session - token expires soon')
            await supabase.auth.refreshSession()
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }

    // Check session expiry every 2 minutes instead of on every activity
    checkIntervalId = setInterval(checkAndRefreshSession, 2 * 60 * 1000)

    // Also check when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndRefreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial check on mount
    checkAndRefreshSession()

    return () => {
      clearInterval(checkIntervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null
}