"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Video, FileText, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { resizeImage } from "@/lib/image-utils"

interface CreatePostProps {
  user: {
    id: string
    full_name: string
    profile_image_url?: string
  }
  onPost?: (content: string, mediaUrl?: string) => void
}

export function CreatePost({ user, onPost }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const supabase = createClient()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }



  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return []

    setUploadingFiles(true)
    const uploadPromises = selectedFiles.map(async (file) => {
      let fileToUpload = file

      // Resize images
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await resizeImage(file, 800, 600)
        } catch (error) {
          console.error('Error resizing image:', error)
          // Use original file if resizing fails
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, fileToUpload)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName)

      return publicUrl
    })

    try {
      const urls = await Promise.all(uploadPromises)
      return urls
    } finally {
      setUploadingFiles(false)
    }
  }

  const handlePost = async () => {
    if (!content.trim() && selectedFiles.length === 0) return

    setIsPosting(true)
    try {
      const mediaUrls = await uploadFiles()

      // For now, we'll use the first media URL. In a full implementation, you might want to handle multiple media items
      const mediaUrl = mediaUrls[0] || null

      await onPost?.(content, mediaUrl || undefined)
      setContent("")
      setSelectedFiles([])
    } catch (error) {
      console.error("Error posting:", error)
      toast.error("Failed to create post")
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"} alt={user.full_name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
             <Textarea
               placeholder="What's on your mind?"
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="min-h-[100px] border-0 resize-none focus-visible:ring-0 text-base"
             />

             {/* File Preview */}
             {selectedFiles.length > 0 && (
               <div className="mt-4 space-y-2">
                 {selectedFiles.map((file, index) => (
                   <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                     <div className="flex items-center space-x-2">
                       {file.type.startsWith('image/') && <ImageIcon className="h-4 w-4" />}
                       {file.type.startsWith('video/') && <Video className="h-4 w-4" />}
                       {!file.type.startsWith('image/') && !file.type.startsWith('video/') && <FileText className="h-4 w-4" />}
                       <span className="text-sm">{file.name}</span>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => removeFile(index)}
                       className="text-red-600 hover:text-red-700"
                     >
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 ))}
               </div>
             )}
             <div className="flex items-center justify-between mt-4">
               <div className="flex items-center space-x-4">
                 <div className="relative">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleFileSelect}
                     className="hidden"
                     id="photo-upload"
                     multiple
                   />
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => document.getElementById('photo-upload')?.click()}
                     className="text-gray-600"
                   >
                     <ImageIcon className="h-4 w-4 mr-2" />
                     Photo
                   </Button>
                 </div>
                 <div className="relative">
                   <input
                     type="file"
                     accept="video/*"
                     onChange={handleFileSelect}
                     className="hidden"
                     id="video-upload"
                     multiple
                   />
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => document.getElementById('video-upload')?.click()}
                     className="text-gray-600"
                   >
                     <Video className="h-4 w-4 mr-2" />
                     Video
                   </Button>
                 </div>
                 <div className="relative">
                   <input
                     type="file"
                     accept=".pdf,.doc,.docx,.txt"
                     onChange={handleFileSelect}
                     className="hidden"
                     id="document-upload"
                     multiple
                   />
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => document.getElementById('document-upload')?.click()}
                     className="text-gray-600"
                   >
                     <FileText className="h-4 w-4 mr-2" />
                     Document
                   </Button>
                 </div>
               </div>
               <Button
                 onClick={handlePost}
                 disabled={(!content.trim() && selectedFiles.length === 0) || isPosting || uploadingFiles}
                 className="bg-blue-600 hover:bg-blue-700"
               >
                 {isPosting || uploadingFiles ? "Posting..." : "Post"}
               </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
