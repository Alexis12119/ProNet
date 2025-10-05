"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

interface Conversation {
  id: string
  participants: {
    id: string
    full_name: string
    profile_image_url?: string
    headline?: string
  }[]
  lastMessage?: {
    content: string
    created_at: string
    sender_id: string
  }
  unreadCount: number
  updated_at: string
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
}

export function ConversationList({
  conversations,
  currentUserId,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getOtherParticipant = (participants: Conversation["participants"]) => {
    return participants.find((p) => p.id !== currentUserId)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv.participants)
    return otherParticipant?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation.participants)
            if (!otherParticipant) return null

            const isSelected = selectedConversationId === conversation.id
            const isFromCurrentUser = conversation.lastMessage?.sender_id === currentUserId

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={otherParticipant.profile_image_url}
                        alt={otherParticipant.full_name}
                      />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                      {getInitials(otherParticipant.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{otherParticipant.full_name}</h3>
                      <div className="flex items-center space-x-2">
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessage.created_at)}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs px-2 py-1">{conversation.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                    {otherParticipant.headline && (
                      <p className="text-sm text-gray-600 truncate mb-1">{otherParticipant.headline}</p>
                    )}
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {isFromCurrentUser ? "You: " : ""}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
