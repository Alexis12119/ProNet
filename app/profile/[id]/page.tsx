"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ProfileHeader } from "@/components/profile/profile-header"
import { SkillsSection } from "@/components/profile/skills-section"
import { ProjectsSection } from "@/components/profile/projects-section"
import { AddProjectDialog } from "@/components/profile/add-project-dialog"
import { AddSkillDialog } from "@/components/profile/add-skill-dialog"
import { toast } from "sonner"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profileUser, setProfileUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "connected">("none")
  const [averageRating, setAverageRating] = useState(0)
  const [totalJobs, setTotalJobs] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()

    // Set up real-time subscription for skills
    const channel = supabase
      .channel('skills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_skills'
        },
        (payload) => {
          console.log('Skill change detected:', payload)
          if (payload.new?.user_id === profileUser?.id || payload.old?.user_id === profileUser?.id) {
            loadProfile()
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [profileUser?.id])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect("/auth/login")
        return
      }
      setCurrentUser(user)

      const { id } = await params
      const { data: profileData, error: userError } = await supabase.from("users").select("*").eq("id", id).single()

      if (userError || !profileData) {
        notFound()
        return
      }
      setProfileUser(profileData)

      const isOwnProfile = user.id === id

      // Get user skills
      const { data: userSkills } = await supabase
        .from("user_skills")
        .select(`
          id,
          skills (
            id,
            name
          )
        `)
        .eq("user_id", id)

      setSkills(userSkills?.map((us: any) => ({
        id: us.skills.id,
        name: us.skills.name,
        endorsements_count: 0,
      })) || [])

      // Get user projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
      setProjects(projectsData || [])

      // Check connection status
      if (!isOwnProfile) {
        const { data: connection } = await supabase
          .from("connections")
          .select("status")
          .or(
            `and(requester_id.eq.${user.id},receiver_id.eq.${id}),and(requester_id.eq.${id},receiver_id.eq.${user.id})`,
          )
          .single()

        setConnectionStatus(connection ? (connection.status === "accepted" ? "connected" : "pending") : "none")
      }

      // Get jobs and ratings
      const { data: jobsData } = await supabase
        .from("jobs_history")
        .select(`
          id,
          feedback (
            rating
          )
        `)
        .eq("user_id", id)

      const jobsWithRatings = jobsData?.filter((job: any) => job.feedback && job.feedback.length > 0) || []
      setTotalJobs(jobsData?.length || 0)
      setAverageRating(
        jobsWithRatings.length > 0
          ? jobsWithRatings.reduce((sum: number, job: any) => sum + (job.feedback[0]?.rating || 0), 0) / jobsWithRatings.length
          : 0
      )
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

   const handleMessage = async () => {
     if (!currentUser || !profileUser) return

     try {
       // Ensure user is authenticated
       const { data: { session } } = await supabase.auth.getSession()
       if (!session || !session.user) {
         toast.error("You must be logged in to start a conversation")
         return
       }

       // Check if conversation already exists
       const { data: profileConversations } = await supabase
         .from("conversation_participants")
         .select("conversation_id")
         .eq("user_id", profileUser.id)

       const profileConversationIds = profileConversations?.map(cp => cp.conversation_id) || []

       const { data: existingConv } = await supabase
         .from("conversation_participants")
         .select("conversation_id")
         .eq("user_id", currentUser.id)
         .in("conversation_id", profileConversationIds)

       if (existingConv && existingConv.length > 0) {
         // Navigate to existing conversation
         router.push("/messages")
         return
       }

       // Create new conversation
       const { data: conversation, error: convError } = await supabase
         .from("conversations")
         .insert({})
         .select()
         .single()

       if (convError) throw convError

       // Add participants
       const { error: partError } = await supabase
         .from("conversation_participants")
         .insert([
           { conversation_id: conversation.id, user_id: currentUser.id },
           { conversation_id: conversation.id, user_id: profileUser.id }
         ])

       if (partError) throw partError

       router.push("/messages")
       toast.success("Conversation started!")
     } catch (error) {
       console.error("Error starting conversation:", error)
       const message = error instanceof Error ? error.message : "Unknown error"
       toast.error(`Failed to start conversation: ${message}`)
     }
   }

   const handleConnect = async () => {
     if (!currentUser || !profileUser) return

     try {
       const { error } = await supabase
         .from("connections")
         .insert({
           requester_id: currentUser.id,
           receiver_id: profileUser.id,
           status: "pending"
         })

       if (error) throw error

       toast.success("Connection request sent!")
       router.refresh()
     } catch (error) {
       const message = error instanceof Error ? error.message : "Unknown error"
       console.error("Error sending connection request:", message)
       toast.error(`Failed to send connection request: ${message}`)
     }
    }

    const handleProjectAdded = async () => {
      // Refresh projects when a new project is added
      try {
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", profileUser.id)
          .order("created_at", { ascending: false })
        setProjects(projectsData || [])
      } catch (error) {
        console.error("Error refreshing projects:", error)
      }
    }

    const handleProjectUpdated = (updatedProject: any) => {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
    }

    const handleProjectDeleted = (projectId: string) => {
      setProjects(prev => prev.filter(p => p.id !== projectId))
    }

   if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <ProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            connectionStatus={connectionStatus}
            averageRating={averageRating}
            totalJobs={totalJobs}
            onMessage={handleMessage}
            onConnect={handleConnect}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
               <ProjectsSection
                 projects={projects}
                 isOwnProfile={isOwnProfile}
                 userId={profileUser.id}
                 onProjectUpdate={handleProjectUpdated}
                 onProjectDelete={handleProjectDeleted}
               />
               {isOwnProfile && (
                 <div className="hidden">
                   <AddProjectDialog userId={profileUser.id} onProjectAdded={handleProjectAdded} />
                 </div>
               )}
            </div>

            <div className="space-y-6">
               <SkillsSection
                 skills={skills}
                 isOwnProfile={isOwnProfile}
                 userId={profileUser.id}
                 onSkillAdded={loadProfile}
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
