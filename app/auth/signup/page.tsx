"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Briefcase, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    headline: "",
    bio: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const [fullNameError, setFullNameError] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  const [fullNameTouched, setFullNameTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const validateEmail = (email: string) => {
    return email.includes("@") && email.includes(".")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Live validation
    if (name === "email" && emailTouched) {
      if (value.trim() === "") {
        setEmailError("This field is required")
      } else if (!validateEmail(value)) {
        setEmailError("Please enter a valid email address")
      } else {
        setEmailError(null)
      }
    }
    if (name === "password" && passwordTouched) {
      if (value.trim() === "") {
        setPasswordError("This field is required")
      } else {
        setPasswordError(validatePassword(value))
      }
    }
    if (name === "confirmPassword" && confirmPasswordTouched) {
      if (value.trim() === "") {
        setConfirmPasswordError("This field is required")
      } else if (value !== formData.password) {
        setConfirmPasswordError("Passwords do not match")
      } else {
        setConfirmPasswordError(null)
      }
    }
    if (name === "fullName" && fullNameTouched) {
      if (value.trim() === "") {
        setFullNameError("This field is required")
      } else {
        setFullNameError(null)
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validate fields
    if (formData.email.trim() === "") {
      setEmailError("This field is required")
      setEmailTouched(true)
      setIsLoading(false)
      return
    }
    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address")
      setEmailTouched(true)
      setIsLoading(false)
      return
    }
    if (formData.password.trim() === "") {
      setPasswordError("This field is required")
      setPasswordTouched(true)
      setIsLoading(false)
      return
    }
    const passwordValidationError = validatePassword(formData.password)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      setPasswordTouched(true)
      setIsLoading(false)
      return
    }
    if (formData.confirmPassword.trim() === "") {
      setConfirmPasswordError("This field is required")
      setConfirmPasswordTouched(true)
      setIsLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      setConfirmPasswordTouched(true)
      setIsLoading(false)
      return
    }
    if (formData.fullName.trim() === "") {
      setFullNameError("This field is required")
      setFullNameTouched(true)
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            headline: formData.headline,
            bio: formData.bio,
          },
        },
      })
      if (error) throw error
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Join ProNet</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Create your professional profile</p>
        </div>

        <Card className="shadow-xl border">
          <CardHeader className="space-y-1 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold">Create account</CardTitle>
            <CardDescription className="text-sm">Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSignUp} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="fullName">Full Name</Label>
                 <div className="relative">
                   <Input
                     id="fullName"
                     name="fullName"
                     type="text"
                     placeholder="John Doe"
                     required
                     value={formData.fullName}
                     onChange={handleInputChange}
                     onBlur={() => setFullNameTouched(true)}
                     className={`h-10 sm:h-11 ${fullNameError ? "border-red-500 pr-10" : ""}`}
                   />
                   {fullNameError && (
                     <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                   )}
                 </div>
                 {fullNameError && <p className="text-sm text-red-500">{fullNameError}</p>}
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <div className="relative">
                   <Input
                     id="email"
                     name="email"
                     type="email"
                     placeholder="john@example.com"
                     required
                     value={formData.email}
                     onChange={handleInputChange}
                     onBlur={() => setEmailTouched(true)}
                     className={`h-10 sm:h-11 ${emailError ? "border-red-500 pr-10" : ""}`}
                   />
                   {emailError && (
                     <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                   )}
                 </div>
                 {emailError && <p className="text-sm text-red-500">{emailError}</p>}
               </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  name="headline"
                  type="text"
                  placeholder="Software Engineer at TechCorp"
                  value={formData.headline}
                  onChange={handleInputChange}
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="resize-none"
                />
              </div>
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <div className="relative">
                   <Input
                     id="password"
                     name="password"
                     type={showPassword ? "text" : "password"}
                     required
                     value={formData.password}
                     onChange={handleInputChange}
                     onBlur={() => setPasswordTouched(true)}
                     className={`h-10 sm:h-11 ${passwordError ? "border-red-500" : ""} pr-20`}
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                   >
                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                   {passwordError && (
                     <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                   )}
                 </div>
                 {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
               </div>
               <div className="space-y-2">
                 <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <div className="relative">
                   <Input
                     id="confirmPassword"
                     name="confirmPassword"
                     type={showConfirmPassword ? "text" : "password"}
                     required
                     value={formData.confirmPassword}
                     onChange={handleInputChange}
                     onBlur={() => setConfirmPasswordTouched(true)}
                     className={`h-10 sm:h-11 ${confirmPasswordError ? "border-red-500" : ""} pr-20`}
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                   >
                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                   {confirmPasswordError && (
                     <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                   )}
                 </div>
                 {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}
               </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-10 sm:h-11 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
