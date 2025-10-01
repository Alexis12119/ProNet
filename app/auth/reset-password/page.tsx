"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Eye, EyeOff, CheckCircle } from "lucide-react"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/\d/.test(password)) return "Password must contain at least one number"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character"
    return null
  }
  const router = useRouter()
  const searchParams = useSearchParams()

   useEffect(() => {
     // Handle the auth callback from email
     const handleAuthCallback = async () => {
       const supabase = createClient()

       // Check if there are tokens in the URL hash
       const hash = window.location.hash.substring(1)
       const params = new URLSearchParams(hash)
       const accessToken = params.get('access_token')
       const refreshToken = params.get('refresh_token')

       if (accessToken && refreshToken) {
         const { error } = await supabase.auth.setSession({
           access_token: accessToken,
           refresh_token: refreshToken,
         })
         if (error) {
           setError("Invalid or expired reset link")
         }
         // Clean the URL
         window.history.replaceState({}, document.title, window.location.pathname)
       }

       const { data, error } = await supabase.auth.getSession()
       if (error || !data.session) {
         setError("Invalid or expired reset link")
       }
     }

     handleAuthCallback()
   }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password.trim() === "") {
      setPasswordError("This field is required")
      setIsLoading(false)
      return
    }
    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      setIsLoading(false)
      return
    }

    if (confirmPassword.trim() === "") {
      setConfirmPasswordError("This field is required")
      setIsLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Password updated!</CardTitle>
              <CardDescription>Your password has been successfully updated. Redirecting to login...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                     <Input
                       id="password"
                       type={showPassword ? "text" : "password"}
                       autoComplete="new-password"
                       required
                       value={password}
                       onChange={(e) => {
                         setPassword(e.target.value)
                         if (e.target.value.length > 0) {
                           if (e.target.value.trim() === "") {
                             setPasswordError("This field is required")
                           } else {
                             setPasswordError(validatePassword(e.target.value))
                           }
                         } else {
                           setPasswordError(null)
                         }
                       }}
                       className={`pr-10 ${passwordError ? "border-red-500" : ""}`}
                     />
                     {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                     <Input
                       id="confirmPassword"
                       type={showConfirmPassword ? "text" : "password"}
                       autoComplete="new-password"
                       required
                       value={confirmPassword}
                       onChange={(e) => {
                         setConfirmPassword(e.target.value)
                         if (e.target.value.length > 0) {
                           if (e.target.value.trim() === "") {
                             setConfirmPasswordError("This field is required")
                           } else if (password !== e.target.value) {
                             setConfirmPasswordError("Passwords do not match")
                           } else {
                             setConfirmPasswordError(null)
                           }
                         } else {
                           setConfirmPasswordError(null)
                         }
                       }}
                       className={`pr-10 ${confirmPasswordError ? "border-red-500" : ""}`}
                     />
                     {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                 <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" disabled={isLoading}>
                   {isLoading ? "Updating..." : "Update password"}
                 </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
