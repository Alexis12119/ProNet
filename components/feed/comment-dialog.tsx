"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { MessageCircle, Send } from "lucide-react"

interface Comment {
  id: string
  comment: string
  created_at: string
  user: {
    id: string
    full_name: string
    profile_image_url?: string
  }
}

interface CommentDialogProps {
  postId: string
  trigger?: React.ReactNode
}

export function CommentDialog({ postId, trigger }: CommentDialogProps) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      loadComments()
      loadUser()
    }
  }, [open])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select(`
          id,
          comment,
          created_at,
          users (
            id,
            full_name,
            profile_image_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setComments(commentsData?.map((c: any) => ({
        id: c.id,
        comment: c.comment,
        created_at: c.created_at,
        user: {
          id: c.users.id,
          full_name: c.users.full_name,
          profile_image_url: c.users.profile_image_url,
        }
      })) || [])
    } catch (error) {
      console.error("Error loading comments:", error)
      toast.error("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          comment: newComment,
        })

      if (error) throw error

      setNewComment("")
      loadComments() // Refresh comments
      toast.success("Comment added!")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600">
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.profile_image_url} alt={comment.user.full_name} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {getInitials(comment.user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">{comment.user.full_name}</span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment!</p>
              </div>
            )}
          </div>

          {/* Sticky Comment Input */}
          {currentUser && (
            <div className="flex-shrink-0 border-t bg-white p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.user_metadata?.avatar_url} alt={currentUser.user_metadata?.full_name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(currentUser.user_metadata?.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] border-0 resize-none focus-visible:ring-0"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}