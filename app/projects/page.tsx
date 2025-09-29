"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Github,
  Figma,
  Globe,
  Dribbble,
  Bean as Behance,
  Codepen as CodePen,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Search,
  Filter,
} from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description?: string
  link?: string
  image_url?: string
  created_at: string
  user: {
    id: string
    full_name: string
    profile_image_url?: string
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          user:users(id, full_name, profile_image_url)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProjectIcon = (link?: string) => {
    if (!link) return <Globe className="h-5 w-5" />

    const url = link.toLowerCase()

    if (url.includes("github.com")) return <Github className="h-5 w-5" />
    if (url.includes("figma.com")) return <Figma className="h-5 w-5" />
    if (url.includes("dribbble.com")) return <Dribbble className="h-5 w-5" />
    if (url.includes("behance.net")) return <Behance className="h-5 w-5" />
    if (url.includes("codepen.io")) return <CodePen className="h-5 w-5" />
    if (url.includes("youtube.com") || url.includes("youtu.be")) return <Youtube className="h-5 w-5" />
    if (url.includes("instagram.com")) return <Instagram className="h-5 w-5" />
    if (url.includes("twitter.com") || url.includes("x.com")) return <Twitter className="h-5 w-5" />
    if (url.includes("linkedin.com")) return <Linkedin className="h-5 w-5" />

    return <Globe className="h-5 w-5" />
  }

  const getPlatformName = (link?: string) => {
    if (!link) return "website"

    const url = link.toLowerCase()

    if (url.includes("github.com")) return "github"
    if (url.includes("figma.com")) return "figma"
    if (url.includes("dribbble.com")) return "dribbble"
    if (url.includes("behance.net")) return "behance"
    if (url.includes("codepen.io")) return "codepen"
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube"
    if (url.includes("instagram.com")) return "instagram"
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter"
    if (url.includes("linkedin.com")) return "linkedin"

    return "website"
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPlatform = platformFilter === "all" || getPlatformName(project.link) === platformFilter

    return matchesSearch && matchesPlatform
  })

  const platforms = ["all", "github", "figma", "dribbble", "behance", "codepen", "youtube", "website"]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Showcase</h1>
        <p className="text-gray-600">Discover amazing projects from the ProNet community</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform === "all" ? "All Platforms" : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

       {/* Projects Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredProjects.map((project) => (
           <Card key={project.id} className="hover:shadow-lg transition-shadow bg-white border-0">
             <CardContent className="p-0">
               {project.image_url && (
                 <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
                   <img
                     src={project.image_url || "/placeholder.svg"}
                     alt={project.title}
                     className="w-full h-full object-cover"
                   />
                 </div>
               )}
               <div className="p-6">
                 <div className="flex items-start justify-between mb-3">
                   <h3 className="font-semibold text-gray-900 text-lg leading-tight">{project.title}</h3>
                   {project.link && <div className="flex items-center space-x-1 ml-2">{getProjectIcon(project.link)}</div>}
                 </div>

                 {project.description && (
                   <div className="min-h-[3rem] max-h-[4rem] overflow-hidden mb-4">
                     <p className="text-sm text-gray-600 leading-relaxed break-words">{project.description}</p>
                   </div>
                 )}

                 <div className="flex items-center justify-between mb-4">
                   <Link
                     href={`/profile/${project.user.id}`}
                     className="flex items-center space-x-2 hover:text-blue-600"
                   >
                     <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                       {project.user.profile_image_url ? (
                        <img
                          src={project.user.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                          alt={project.user.full_name}
                          className="w-full h-full object-cover"
                        />
                       ) : (
                         <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                           {project.user.full_name.charAt(0)}
                         </div>
                       )}
                     </div>
                     <span className="text-sm font-medium">{project.user.full_name}</span>
                   </Link>

                   {project.link && (
                     <Badge variant="secondary" className="text-xs">
                       {getPlatformName(project.link)}
                     </Badge>
                   )}
                 </div>

                 {project.link && (
                   <Button asChild size="sm" className="w-full">
                     <Link href={project.link} target="_blank" rel="noopener noreferrer">
                       View Project
                     </Link>
                   </Button>
                 )}
               </div>
             </CardContent>
           </Card>
         ))}
       </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
