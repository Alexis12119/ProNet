"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { JobHistorySection } from "@/components/freelancer/job-history-section"
import { AddJobDialog } from "@/components/freelancer/add-job-dialog"
import { ProfileHeader } from "@/components/profile/profile-header"

interface JobWithFeedback {
  id: string
  title: string
  description?: string
  completed_at: string
  client: {
    id: string
    full_name: string
    headline?: string
    profile_image_url?: string
  }
  feedback?: {
    id: string
    rating: number
    comment?: string
    created_at: string
  }
}

interface FreelancerPageProps {
  params: Promise<{ id: string }>
}

export default function FreelancerPage({ params }: FreelancerPageProps) {
  const [freelancerId, setFreelancerId] = useState<string>("")
  const [freelancer, setFreelancer] = useState<any>(null)
  const [jobs, setJobs] = useState<JobWithFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setFreelancerId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (freelancerId) {
      loadFreelancerData()
    }
  }, [freelancerId])

  const loadFreelancerData = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setCurrentUserId(user.id)

      // Get freelancer profile
      const { data: freelancerData, error: freelancerError } = await supabase
        .from("users")
        .select("*")
        .eq("id", freelancerId)
        .single()

      if (freelancerError) throw freelancerError
      setFreelancer(freelancerData)

      // Get jobs with client info and feedback
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs_history")
        .select(`
          id,
          title,
          description,
          completed_at,
          client:client_id (
            id,
            full_name,
            headline,
            profile_image_url
          )
        `)
        .eq("user_id", freelancerId)
        .order("completed_at", { ascending: false })

      if (jobsError) throw jobsError

      // Get feedback for each job
      const jobsWithFeedback: JobWithFeedback[] = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { data: feedbackData } = await supabase
            .from("feedback")
            .select("id, rating, comment, created_at")
            .eq("job_id", job.id)
            .single()

          return {
            id: job.id,
            title: job.title,
            description: job.description,
            completed_at: job.completed_at,
            client: job.client,
            feedback: feedbackData || undefined,
          }
        }),
      )

      setJobs(jobsWithFeedback)
    } catch (error) {
      console.error("Error loading freelancer data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddJob = async (jobData: {
    title: string
    description: string
    clientId: string
    completedAt: Date
  }) => {
    if (!currentUserId) return

    try {
      const { data: newJob, error } = await supabase
        .from("jobs_history")
        .insert({
          title: jobData.title,
          description: jobData.description,
          user_id: currentUserId,
          client_id: jobData.clientId,
          completed_at: jobData.completedAt.toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Reload data to show the new job
      await loadFreelancerData()
    } catch (error) {
      console.error("Error adding job:", error)
      throw error
    }
  }

  const calculateAverageRating = () => {
    const jobsWithRatings = jobs.filter((job) => job.feedback)
    if (jobsWithRatings.length === 0) return 0

    const totalRating = jobsWithRatings.reduce((sum, job) => sum + (job.feedback?.rating || 0), 0)
    return totalRating / jobsWithRatings.length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading freelancer profile...</p>
        </div>
      </div>
    )
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Freelancer not found</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUserId === freelancerId

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <ProfileHeader user={freelancer} isOwnProfile={isOwnProfile} />

          {/* Freelancer Performance & Job History */}
          <JobHistorySection
            jobs={jobs}
            isOwnProfile={isOwnProfile}
            averageRating={calculateAverageRating()}
            totalJobs={jobs.length}
            onAddJob={isOwnProfile ? () => {} : undefined}
          />

          {/* Add Job Dialog (for own profile) */}
          {isOwnProfile && (
            <div className="fixed bottom-6 right-6">
              <AddJobDialog onAddJob={handleAddJob} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
