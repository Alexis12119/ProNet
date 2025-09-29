"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MoreVertical, Phone, Video } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  read_at?: string
}

interface Participant {
  id: string
  full_name: string
  profile_image_url?: string
  headline?: string
}

interface ChatInterfaceProps {
  conversationId: string
  messages: Message[]
  participants: Participant[]
  currentUserId: string
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

export function ChatInterface({
  conversationId,
  messages,
  participants,
  currentUserId,
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getOtherParticipant = () => {
    return participants.find((p) => p.id !== currentUserId)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    onSendMessage(newMessage)
    setNewMessage("")
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const otherParticipant = getOtherParticipant()

  if (!otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Conversation not found</p>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, Message[]>,
  )

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherParticipant.profile_image_url || "/placeholder.svg"}
                alt={otherParticipant.full_name}
              />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {getInitials(otherParticipant.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{otherParticipant.full_name}</h3>
              {otherParticipant.headline && <p className="text-sm text-gray-600">{otherParticipant.headline}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-xs text-gray-600">{formatDate(date)}</span>
              </div>
            </div>

            {/* Messages for this date */}
            {dayMessages.map((message, index) => {
              const isFromCurrentUser = message.sender_id === currentUserId
              const showAvatar =
                index === dayMessages.length - 1 ||
                dayMessages[index + 1]?.sender_id !== message.sender_id ||
                new Date(dayMessages[index + 1]?.created_at).getTime() - new Date(message.created_at).getTime() >
                  5 * 60 * 1000 // 5 minutes

              return (
                <div
                  key={message.id}
                  className={`flex items-end space-x-2 ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  {!isFromCurrentUser && (
                    <Avatar className={`h-8 w-8 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                      <AvatarImage
                        src={otherParticipant.profile_image_url || "/placeholder.svg"}
                        alt={otherParticipant.full_name}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {getInitials(otherParticipant.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isFromCurrentUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isFromCurrentUser ? "text-blue-100" : "text-gray-500"} text-right`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!newMessage.trim() || isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
