"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  ExternalLink,
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
} from "lucide-react"
import Link from "next/link"
import { AddProjectDialog } from "./add-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  title: string
  description?: string
  link?: string
  image_url?: string
  created_at: string
  user_id?: string
}

interface ProjectsSectionProps {
  projects: Project[]
  isOwnProfile: boolean
  userId?: string
  onProjectUpdate?: (project: Project) => void
  onProjectDelete?: (projectId: string) => void
}

export function ProjectsSection({ projects, isOwnProfile, userId, onProjectUpdate, onProjectDelete }: ProjectsSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const supabase = createClient()

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", userId)

      if (error) throw error

      onProjectDelete?.(projectId)
      toast.success("Project deleted successfully!")
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    }
  }

  const getProjectIcon = (link?: string) => {
    if (!link) return <Globe className="h-4 w-4" />

    const url = link.toLowerCase()

    if (url.includes("github.com")) return <Github className="h-4 w-4" />
    if (url.includes("figma.com")) return <Figma className="h-4 w-4" />
    if (url.includes("dribbble.com")) return <Dribbble className="h-4 w-4" />
    if (url.includes("behance.net")) return <Behance className="h-4 w-4" />
    if (url.includes("codepen.io")) return <CodePen className="h-4 w-4" />
    if (url.includes("youtube.com") || url.includes("youtu.be")) return <Youtube className="h-4 w-4" />
    if (url.includes("instagram.com")) return <Instagram className="h-4 w-4" />
    if (url.includes("twitter.com") || url.includes("x.com")) return <Twitter className="h-4 w-4" />
    if (url.includes("linkedin.com")) return <Linkedin className="h-4 w-4" />

    return <Globe className="h-4 w-4" />
  }

  const getPlatformName = (link?: string) => {
    if (!link) return "Website"

    const url = link.toLowerCase()

    if (url.includes("github.com")) return "GitHub"
    if (url.includes("figma.com")) return "Figma"
    if (url.includes("dribbble.com")) return "Dribbble"
    if (url.includes("behance.net")) return "Behance"
    if (url.includes("codepen.io")) return "CodePen"
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube"
    if (url.includes("instagram.com")) return "Instagram"
    if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter"
    if (url.includes("linkedin.com")) return "LinkedIn"

    return "Website"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Projects</CardTitle>
        {isOwnProfile && (
           <AddProjectDialog
             userId={userId || ""}
             trigger={
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Add Project</span>
              </Button>
            }
          />
        )}
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                {project.image_url && (
                  <div className="aspect-video bg-gray-100 rounded-md mb-4 overflow-hidden">
                    <img
                      src={project.image_url || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{project.title}</h3>
                  <div className="flex items-center space-x-2 ml-2">
                    {project.link && (
                      <Badge variant="secondary" className="text-xs flex items-center space-x-1">
                        {getProjectIcon(project.link)}
                        <span>{getPlatformName(project.link)}</span>
                      </Badge>
                    )}
                    {isOwnProfile && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <EditProjectDialog
                            project={project}
                            onProjectUpdated={onProjectUpdate}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                {project.description && (
                  <div className="min-h-[3rem] max-h-[4rem] overflow-hidden mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed break-words">{project.description}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Badge variant="outline" className="text-xs">
                    {formatDate(project.created_at)}
                  </Badge>
                  {project.link && (
                    <Link
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>View Project</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No projects added yet</p>
            {isOwnProfile && (
               <AddProjectDialog
                 userId={userId || ""}
                 trigger={
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Add Your First Project
                  </Button>
                }
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
