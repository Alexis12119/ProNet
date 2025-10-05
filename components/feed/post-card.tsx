"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditPostDialog } from "./edit-post-dialog"
import { CommentDialog } from "./comment-dialog"

interface Post {
  id: string
  content: string
  media_url?: string
  created_at: string
  user: {
    id: string
    full_name: string
    headline?: string
    profile_image_url?: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface PostCardProps {
  post: Post
  onLike?: (postId: string) => void
  onShare?: (postId: string) => void
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, content: string, mediaUrl?: string) => void
  currentUserId?: string
}

export function PostCard({ post, onLike, onShare, onDelete, onUpdate, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)

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

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
    onLike?.(post.id)
  }

  return (
    <Card id={`post-${post.id}`} className="border-0 shadow-lg">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Link href={`/profile/${post.user.id}`}>
              <Avatar className="h-12 w-12">
                 <AvatarImage src={post.user.profile_image_url} alt={post.user.full_name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(post.user.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.user.id}`} className="hover:underline">
                <h3 className="font-semibold text-gray-900">{post.user.full_name}</h3>
              </Link>
              {post.user.headline && <p className="text-sm text-gray-600">{post.user.headline}</p>}
              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(post.created_at)}</p>
            </div>
          </div>
          {currentUserId === post.user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditPostDialog
                  postId={post.id}
                  initialContent={post.content}
                  initialMediaUrl={post.media_url}
                  onUpdate={onUpdate}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          {post.media_url && (
            <div className="mt-4 rounded-lg overflow-hidden">
              <img src={post.media_url || "/placeholder.svg"} alt="Post media" className="w-full h-auto" />
            </div>
          )}
        </div>

        {/* Engagement Stats */}
        {(likesCount > 0 || post.comments_count > 0) && (
          <div className="flex items-center justify-between py-2 mb-3 border-b border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {likesCount > 0 && (
                <span className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                  <span>{likesCount}</span>
                </span>
              )}
              {post.comments_count > 0 && <span>{post.comments_count} comments</span>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 ${isLiked ? "text-red-600" : "text-gray-600"}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>Like</span>
          </Button>
           <CommentDialog
             postId={post.id}
             trigger={
               <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600">
                 <MessageCircle className="h-4 w-4" />
                 <span>Comment</span>
               </Button>
             }
           />
           <Button
             variant="ghost"
             size="sm"
             onClick={() => onShare?.(post.id)}
             className="flex items-center space-x-2 text-gray-600"
           >
             <Share className="h-4 w-4" />
             <span>Share</span>
           </Button>
        </div>
      </CardContent>
    </Card>
  )
}
