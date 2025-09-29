"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, Upload, LinkIcon } from "lucide-react"
import { toast } from "sonner"

interface AddProjectDialogProps {
  userId: string
  onProjectAdded?: () => void
  trigger?: React.ReactNode
}

export function AddProjectDialog({ userId, onProjectAdded, trigger }: AddProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    image_url: "",
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("projects").insert({
        user_id: userId,
        title: formData.title,
        description: formData.description || null,
        link: formData.link || null,
        image_url: formData.image_url || null,
      })

      if (error) throw error

      setFormData({ title: "", description: "", link: "", image_url: "" })
      setOpen(false)
      onProjectAdded?.()
      toast.success("Project added successfully!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("Error adding project:", message)
      toast.error(`Failed to add project: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your project..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link" className="flex items-center space-x-1">
              <LinkIcon className="h-4 w-4" />
              <span>Project Link</span>
            </Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://github.com/username/project"
            />
            <p className="text-xs text-gray-500">
              Supports GitHub, Figma, Dribbble, Behance, CodePen, YouTube, and more
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="flex items-center space-x-1">
              <Upload className="h-4 w-4" />
              <span>Project Image URL</span>
            </Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/project-screenshot.png"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? "Adding..." : "Add Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
