"use client"

import type React from "react"

 import { useState, useEffect, useRef } from "react"
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Send, MoreVertical, Phone, Video, Paperclip, Edit, Trash2 } from "lucide-react"
 import { createClient } from "@/lib/supabase/client"

 interface Message {
   id: string
   content: string
   sender_id: string
   created_at: string
   read_at?: string
   attachments?: any[]
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
   onSendMessage: (content: string, attachments?: any[]) => void
   onUpdateMessages: (updater: (prev: Message[]) => Message[]) => void
   isLoading?: boolean
 }

 export function ChatInterface({
   conversationId,
   messages,
   participants,
   currentUserId,
   onSendMessage,
   onUpdateMessages,
   isLoading,
 }: ChatInterfaceProps) {
   const [newMessage, setNewMessage] = useState("")
   const [attachments, setAttachments] = useState<File[]>([])
   const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
   const [editingContent, setEditingContent] = useState("")
   const messagesEndRef = useRef<HTMLDivElement>(null)
   const fileInputRef = useRef<HTMLInputElement>(null)
   const supabase = createClient()

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

   const handleSendMessage = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!newMessage.trim() && attachments.length === 0) return

     try {
       // Upload attachments first
       const uploadedAttachments = []
       for (const file of attachments) {
         const fileExt = file.name.split('.').pop()
         const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
         const { data, error } = await supabase.storage
           .from('message-attachments')
           .upload(fileName, file)

         if (error) throw error

         uploadedAttachments.push({
           file_url: data.path,
           file_name: file.name,
           file_type: file.type,
           file_size: file.size,
         })
       }

       // Send message with attachments
       onSendMessage(newMessage, uploadedAttachments)

       setNewMessage("")
       setAttachments([])
     } catch (error) {
       console.error("Error sending message:", error)
     }
   }

   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || [])
     setAttachments(prev => [...prev, ...files])
   }

   const removeAttachment = (index: number) => {
     setAttachments(prev => prev.filter((_, i) => i !== index))
   }

   const handleEditMessage = (messageId: string, currentContent: string) => {
     setEditingMessageId(messageId)
     setEditingContent(currentContent)
   }

   const handleSaveEdit = async () => {
     if (!editingMessageId || !editingContent.trim()) return

     try {
       const { error } = await supabase
         .from("messages")
         .update({ content: editingContent })
         .eq("id", editingMessageId)

       if (error) throw error

       // Update local state
       onUpdateMessages(prev => prev.map(msg =>
         msg.id === editingMessageId ? { ...msg, content: editingContent } : msg
       ))

       setEditingMessageId(null)
       setEditingContent("")
     } catch (error) {
       console.error("Error editing message:", error)
     }
   }

   const handleCancelEdit = () => {
     setEditingMessageId(null)
     setEditingContent("")
   }

   const handleDeleteMessage = async (messageId: string) => {
     if (!confirm("Are you sure you want to delete this message?")) return

     try {
       const { error } = await supabase
         .from("messages")
         .delete()
         .eq("id", messageId)

       if (error) throw error

       // Update local state
       onUpdateMessages(prev => prev.filter(msg => msg.id !== messageId))
     } catch (error) {
       console.error("Error deleting message:", error)
     }
   }

   const getSignedUrl = async (filePath: string) => {
     const { data } = await supabase.storage.from('message-attachments').createSignedUrl(filePath, 3600)
     return data?.signedUrl || ''
   }

   const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

   useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
   }, [messages])

   useEffect(() => {
     const loadImageUrls = async () => {
       const urls: Record<string, string> = {}
       for (const message of messages) {
         if (message.attachments) {
           for (const att of message.attachments) {
             if (att.file_type?.startsWith('image/') && att.file_url) {
               const signedUrl = await getSignedUrl(att.file_url)
               if (signedUrl) {
                 urls[att.file_url] = signedUrl
               }
             }
           }
         }
       }
       setImageUrls(urls)
     }
     if (messages.length > 0) {
       loadImageUrls()
     }
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
                 src={otherParticipant.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                   className={`flex items-end space-x-2 mb-4 ${isFromCurrentUser ? "justify-end" : "justify-start"}`}
                 >
                  {!isFromCurrentUser && (
                    <Avatar className={`h-8 w-8 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                       <AvatarImage
                         src={otherParticipant.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                         alt={otherParticipant.full_name}
                       />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {getInitials(otherParticipant.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                    <div className="relative group">
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isFromCurrentUser
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                        }`}
                      >
                        {editingMessageId === message.id ? (
                          <div>
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full bg-transparent border-none outline-none resize-none text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="text-xs">
                                Cancel
                              </Button>
                              <Button size="sm" onClick={handleSaveEdit} className="text-xs bg-white text-blue-600 hover:bg-gray-100">
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.content}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((att, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    {att.file_type?.startsWith('image/') ? (
                                      <img src={imageUrls[att.file_url] || ''} alt={att.file_name} className="max-w-full h-32 rounded object-cover" />
                                    ) : (
                                      <a href={imageUrls[att.file_url] || ''} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                                        {att.file_name}
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className={`text-xs mt-1 ${isFromCurrentUser ? "text-blue-100" : "text-gray-500"} text-right`}>
                              {formatTime(message.created_at)}
                            </p>
                          </>
                        )}
                      </div>
                      {isFromCurrentUser && editingMessageId !== message.id && (
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditMessage(message.id, message.content)}
                              className="h-6 w-6 p-0 text-white hover:bg-blue-500"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMessage(message.id)}
                              className="h-6 w-6 p-0 text-white hover:bg-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
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
         {/* Attachment Preview */}
         {attachments.length > 0 && (
           <div className="mb-2 flex flex-wrap gap-2">
             {attachments.map((file, index) => (
               <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2">
                 <span className="text-sm text-gray-700 mr-2">{file.name}</span>
                 <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   onClick={() => removeAttachment(index)}
                   className="h-4 w-4 p-0 text-gray-500 hover:text-gray-700"
                 >
                   ×
                 </Button>
               </div>
             ))}
           </div>
         )}

         <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
           <Input
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
             placeholder="Type a message..."
             className="flex-1"
             disabled={isLoading}
           />
           <input
             ref={fileInputRef}
             type="file"
             multiple
             onChange={handleFileSelect}
             className="hidden"
             accept="image/*,.pdf,.doc,.docx,.txt"
           />
           <Button
             type="button"
             variant="ghost"
             onClick={() => fileInputRef.current?.click()}
             disabled={isLoading}
             className="p-2"
           >
             <Paperclip className="h-4 w-4" />
           </Button>
           <Button type="submit" disabled={(!newMessage.trim() && attachments.length === 0) || isLoading} className="bg-blue-600 hover:bg-blue-700">
             <Send className="h-4 w-4" />
           </Button>
         </form>
       </div>
    </div>
  )
}
