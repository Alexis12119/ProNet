"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar } from "lucide-react"
import Link from "next/link"

interface FeedbackCardProps {
  feedback: {
    id: string
    rating: number
    comment?: string
    created_at: string
    job: {
      id: string
      title: string
      description?: string
      completed_at: string
    }
    client: {
      id: string
      full_name: string
      headline?: string
      profile_image_url?: string
    }
  }
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-700"
    if (rating >= 3.5) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        {/* Job Title and Rating */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{feedback.job.title}</h3>
            {feedback.job.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{feedback.job.description}</p>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Completed {formatDate(feedback.job.completed_at)}</span>
            </div>
          </div>
          <Badge className={`${getRatingColor(feedback.rating)} font-semibold`}>{feedback.rating}.0 ★</Badge>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center space-x-1 mb-4">
          {renderStars(feedback.rating)}
          <span className="text-sm text-gray-600 ml-2">({feedback.rating}/5)</span>
        </div>

        {/* Client Feedback */}
        {feedback.comment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 italic leading-relaxed">"{feedback.comment}"</p>
          </div>
        )}

        {/* Client Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${feedback.client.id}`}>
              <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={feedback.client.profile_image_url}
                    alt={feedback.client.full_name}
                  />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                  {getInitials(feedback.client.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${feedback.client.id}`} className="hover:underline">
                <p className="font-medium text-gray-900">{feedback.client.full_name}</p>
              </Link>
              {feedback.client.headline && <p className="text-sm text-gray-600">{feedback.client.headline}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Reviewed on</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(feedback.created_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
