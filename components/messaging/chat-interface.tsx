"use client"

import type React from "react"

 import { useState, useEffect, useRef } from "react"
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
import { Send, MoreVertical, Phone, Video, Paperclip, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
     const fileInputRef = useRef<HTMLInputElement>(null)
     const supabase = createClient()

    // Scroll to bottom when messages change
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, [messages])

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

          const { data: { publicUrl } } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(fileName)

          uploadedAttachments.push({
            file_url: publicUrl,
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

    const handleDeleteMessage = (messageId: string) => {
      setMessageToDelete(messageId)
      setDeleteDialogOpen(true)
    }

    const confirmDeleteMessage = async () => {
      if (!messageToDelete) return

      try {
        const { error } = await supabase
          .from("messages")
          .delete()
          .eq("id", messageToDelete)

        if (error) throw error

        // Update local state
        onUpdateMessages(prev => prev.filter(msg => msg.id !== messageToDelete))
        setMessageToDelete(null)
      } catch (error) {
        console.error("Error deleting message:", error)
      }
    }

    const otherParticipant = getOtherParticipant()

    if (!otherParticipant) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Conversation not found</p>
        </div>
      )
    }

    // Filter unique messages by ID to prevent duplicates
    const uniqueMessages = messages.filter((message, index, self) =>
      index === self.findIndex(m => m.id === message.id)
    )

    // Group messages by date
    const groupedMessages = uniqueMessages.reduce(
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
     <>
       <div className="h-full flex flex-col">
       {/* Chat Header */}
       <div className="p-4 border-b bg-white">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
             <Avatar className="h-10 w-10">
                 <AvatarImage
                   src={otherParticipant.profile_image_url}
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
                           src={otherParticipant.profile_image_url}
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
                                       <img src={att.file_url || ''} alt={att.file_name} className="max-w-full h-32 rounded object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg' }} />
                                     ) : (
                                       <a href={att.file_url || ''} target="_blank" rel="noopener noreferrer" className="text-xs underline">
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
     <ConfirmationDialog
       open={deleteDialogOpen}
       onOpenChange={setDeleteDialogOpen}
       title="Delete Message"
       description="Are you sure you want to delete this message? This action cannot be undone."
       confirmText="Delete"
       onConfirm={confirmDeleteMessage}
       variant="destructive"
     />
     </>
   )
 }
