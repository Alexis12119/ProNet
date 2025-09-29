"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeedbackCard } from "./feedback-card"
import { Plus, Star, TrendingUp, Award } from "lucide-react"

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

interface JobHistorySectionProps {
  jobs: JobWithFeedback[]
  isOwnProfile: boolean
  averageRating: number
  totalJobs: number
  onAddJob?: () => void
}

export function JobHistorySection({ jobs, isOwnProfile, averageRating, totalJobs, onAddJob }: JobHistorySectionProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600"
    if (rating >= 3.5) return "text-yellow-600"
    return "text-red-600"
  }

  const jobsWithFeedback = jobs.filter((job) => job.feedback)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Freelancer Performance</CardTitle>
          {isOwnProfile && (
            <Button variant="ghost" size="sm" onClick={onAddJob} className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>Add Job</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className={`h-8 w-8 ${getRatingColor(averageRating)} fill-current`} />
              </div>
              <p className={`text-3xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              </p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalJobs}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{jobsWithFeedback.length}</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job History with Feedback */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Client Feedback & Job History</CardTitle>
        </CardHeader>
        <CardContent>
          {jobsWithFeedback.length > 0 ? (
            <div className="space-y-6">
              {jobsWithFeedback.map((job) => (
                <FeedbackCard
                  key={job.id}
                  feedback={{
                    id: job.feedback!.id,
                    rating: job.feedback!.rating,
                    comment: job.feedback!.comment,
                    created_at: job.feedback!.created_at,
                    job: {
                      id: job.id,
                      title: job.title,
                      description: job.description,
                      completed_at: job.completed_at,
                    },
                    client: job.client,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No client feedback yet</p>
              <p className="text-gray-400 text-sm">
                {isOwnProfile
                  ? "Complete your first job to start building your reputation"
                  : "This freelancer hasn't received any feedback yet"}
              </p>
              {isOwnProfile && (
                <Button variant="outline" className="mt-4 bg-transparent" onClick={onAddJob}>
                  Add Your First Job
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs without feedback */}
      {jobs.filter((job) => !job.feedback).length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Completed Jobs (Pending Feedback)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs
                .filter((job) => !job.feedback)
                .map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        {job.description && <p className="text-gray-600 text-sm mt-1">{job.description}</p>}
                        <p className="text-xs text-gray-500 mt-2">
                          Completed {new Date(job.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending Review
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
