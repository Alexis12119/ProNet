"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Edit, X, Upload } from "lucide-react"
import { resizeImage } from "@/lib/image-utils"

interface Project {
  id: string
  title: string
  description?: string
  link?: string
  image_url?: string
  created_at: string
  user_id?: string
}

interface EditProjectDialogProps {
  project: Project
  onProjectUpdated?: (project: Project) => void
  trigger?: React.ReactNode
}

export function EditProjectDialog({ project, onProjectUpdated, trigger }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || "",
    link: project.link || "",
    image_url: project.image_url || "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setFormData({
      title: project.title,
      description: project.description || "",
      link: project.link || "",
      image_url: project.image_url || "",
    })
  }, [project])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return formData.image_url

    setUploadingFile(true)
    try {
      let fileToUpload = selectedFile

      // Resize images
      if (selectedFile.type.startsWith('image/')) {
        try {
          fileToUpload = await resizeImage(selectedFile, 800, 600)
        } catch (error) {
          console.error('Error resizing image:', error)
          // Use original file if resizing fails
        }
      }

      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `project-${project.id}-${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, fileToUpload)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName)

      return publicUrl
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) return

    setIsLoading(true)
    try {
      const newImageUrl = await uploadFile()

      const { data: updatedProject, error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          description: formData.description || null,
          link: formData.link || null,
          image_url: newImageUrl || null,
        })
        .eq("id", project.id)
        .select()
        .single()

      if (error) throw error

      setOpen(false)
      onProjectUpdated?.(updatedProject)
      toast.success("Project updated successfully!")
    } catch (error) {
      console.error("Error updating project:", error)
      toast.error("Failed to update project")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
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
            <Label htmlFor="link">Project Link</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Current Image Preview */}
          {formData.image_url && (
            <div className="relative">
              <img
                src={formData.image_url}
                alt="Project image"
                className="w-full h-auto rounded-md max-h-64 object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFormData({ ...formData, image_url: "" })}
                className="absolute top-2 right-2 bg-red-600 text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* File Upload */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="edit-project-media-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('edit-project-media-upload')?.click()}
                disabled={uploadingFile}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingFile ? "Uploading..." : "Change Image"}
              </Button>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isLoading || uploadingFile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading || uploadingFile ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}