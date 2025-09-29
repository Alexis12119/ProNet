"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, UserCheck, UserX, Clock } from "lucide-react"
import Link from "next/link"

interface Connection {
  id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  user: {
    id: string
    full_name: string
    headline?: string
    profile_image_url?: string
    location?: string
  }
  isRequester: boolean
}

interface ConnectionCardProps {
  connection: Connection
  onAccept?: (connectionId: string) => void
  onReject?: (connectionId: string) => void
  onMessage?: (userId: string) => void
}

export function ConnectionCard({ connection, onAccept, onReject, onMessage }: ConnectionCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusBadge = () => {
    switch (connection.status) {
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <UserCheck className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <UserX className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Link href={`/profile/${connection.user.id}`}>
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={connection.user.profile_image_url || "/placeholder.svg"}
                  alt={connection.user.full_name}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-lg">
                  {getInitials(connection.user.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <Link href={`/profile/${connection.user.id}`} className="hover:underline">
                <h3 className="font-semibold text-gray-900 text-lg">{connection.user.full_name}</h3>
              </Link>
              {connection.user.headline && <p className="text-gray-600 mt-1">{connection.user.headline}</p>}
              {connection.user.location && <p className="text-sm text-gray-500 mt-1">{connection.user.location}</p>}
              <div className="mt-2">{getStatusBadge()}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-4">
          {connection.status === "pending" && !connection.isRequester && (
            <>
              <Button onClick={() => onAccept?.(connection.id)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Accept
              </Button>
              <Button onClick={() => onReject?.(connection.id)} variant="outline" size="sm" className="bg-transparent">
                Decline
              </Button>
            </>
          )}
          {connection.status === "accepted" && (
            <Button
              onClick={() => onMessage?.(connection.user.id)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Message</span>
            </Button>
          )}
          {connection.status === "pending" && connection.isRequester && (
            <p className="text-sm text-gray-500">Connection request sent</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
