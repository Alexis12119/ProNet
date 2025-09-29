"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CreatePost } from "@/components/feed/create-post"
import { PostCard } from "@/components/feed/post-card"
import { toast } from "sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"

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

interface User {
  id: string
  full_name: string
  profile_image_url?: string
}

function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const postsChannelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    loadUserAndPosts()

    // Set up real-time subscription for posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post change detected:', payload)
          // Reload posts when changes occur
          loadUserAndPosts()
        }
      )
      .subscribe()

    postsChannelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Scroll to post if hash is present
    const hash = window.location.hash
    if (hash && hash.startsWith('#post-')) {
      const postId = hash.substring(6) // Remove '#post-'
      const postElement = document.getElementById(`post-${postId}`)
      if (postElement) {
        // Add a small delay to ensure rendering is complete
        setTimeout(() => {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    }
  }, [posts])

  const loadUserAndPosts = async () => {
    try {
      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Get user profile
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (profile) {
        setUser(profile)
      }

      // Get posts from connections and own posts
      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          media_url,
          created_at,
          users!posts_user_id_fkey (
            id,
            full_name,
            headline,
            profile_image_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      // Transform posts data and add engagement info
      const transformedPosts: Post[] = await Promise.all(
        (postsData || []).map(async (post) => {
          // Get likes count
          const { count: likesCount } = await supabase
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)

          // Get comments count
          const { count: commentsCount } = await supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)

          // Check if current user liked this post
          const { data: userLike } = await supabase
            .from("post_likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", authUser.id)
            .single()

          return {
            id: post.id,
            content: post.content,
            media_url: post.media_url,
            created_at: post.created_at,
             user: {
               id: (post.users as any).id,
               full_name: (post.users as any).full_name,
               headline: (post.users as any).headline,
               profile_image_url: (post.users as any).profile_image_url,
             },
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            is_liked: !!userLike,
          }
        }),
      )

      setPosts(transformedPosts)
    } catch (error) {
      console.error("Error loading feed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async (content: string, mediaUrl?: string) => {
    if (!user) return

    try {
      const { data: newPost, error } = await supabase
        .from("posts")
        .insert({
          content,
          user_id: user.id,
          media_url: mediaUrl,
        })
        .select()
        .single()

      if (error) throw error

      // Add new post to the beginning of the feed
      const postWithUser: Post = {
        id: newPost.id,
        content: newPost.content,
        media_url: newPost.media_url,
        created_at: newPost.created_at,
        user: {
          id: user.id,
          full_name: user.full_name,
          profile_image_url: user.profile_image_url,
        },
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
      }

      setPosts([postWithUser, ...posts])
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

   const handleLike = async (postId: string) => {
     if (!user) return

     try {
       // Check if already liked
       const { data: existingLike } = await supabase
         .from("post_likes")
         .select("id")
         .eq("post_id", postId)
         .eq("user_id", user.id)
         .single()

       if (existingLike) {
         // Unlike
         await supabase.from("post_likes").delete().eq("id", existingLike.id)
       } else {
         // Like
         await supabase.from("post_likes").insert({
           post_id: postId,
           user_id: user.id,
         })
       }

       // Refresh posts to update counts
       loadUserAndPosts()
     } catch (error) {
       console.error("Error toggling like:", error)
     }
   }



    const handleShare = async (postId: string) => {
      try {
        const shareUrl = `${window.location.origin}/feed#post-${postId}`
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Post link copied to clipboard!")
      } catch (error) {
        console.error("Error sharing:", error)
        toast.error("Failed to copy link")
      }
    }



    const handleDelete = async (postId: string) => {
      if (!user) return

      try {
        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", postId)
          .eq("user_id", user.id)

        if (error) throw error

        // Refresh posts
        loadUserAndPosts()
        toast.success("Post deleted successfully!")
      } catch (error) {
        console.error("Error deleting post:", error)
        toast.error("Failed to delete post")
      }
    }

    const handleUpdate = (postId: string, content: string, mediaUrl?: string) => {
      // Update the post in local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, content, media_url: mediaUrl }
            : post
        )
      )
    }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Create Post */}
          {user && <CreatePost user={user} onPost={handleCreatePost} />}

          {/* Posts Feed */}
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onShare={handleShare}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                currentUserId={user?.id}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet. Create your first post above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed...</p>
        </div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  )
}
