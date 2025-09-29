"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Edit, X } from "lucide-react"
import { resizeImage } from "@/lib/image-utils"

interface EditPostDialogProps {
  postId: string
  initialContent: string
  initialMediaUrl?: string
  onUpdate?: (postId: string, content: string, mediaUrl?: string) => void
  trigger?: React.ReactNode
}

export function EditPostDialog({ postId, initialContent, initialMediaUrl, onUpdate, trigger }: EditPostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl || "")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setContent(initialContent)
    setMediaUrl(initialMediaUrl || "")
  }, [initialContent, initialMediaUrl])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return mediaUrl

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
      const fileName = `post-${postId}-${Date.now()}.${fileExt}`

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
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const newMediaUrl = await uploadFile()

      const { error } = await supabase
        .from("posts")
        .update({
          content,
          media_url: newMediaUrl || null,
        })
        .eq("id", postId)

      if (error) throw error

      setOpen(false)
      toast.success("Post updated successfully!")
      // Call the update callback
      onUpdate?.(postId, content, newMediaUrl || undefined)
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
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
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] border-0 resize-none focus-visible:ring-0 text-base"
          />

          {/* Current Media Preview */}
          {mediaUrl && (
            <div className="relative">
              <img
                src={mediaUrl}
                alt="Post media"
                className="w-full h-auto rounded-md max-h-64 object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMediaUrl("")}
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
                id="edit-media-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('edit-media-upload')?.click()}
                disabled={uploadingFile}
              >
                {uploadingFile ? "Uploading..." : "Change Media"}
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
              disabled={!content.trim() || isLoading || uploadingFile}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading || uploadingFile ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}