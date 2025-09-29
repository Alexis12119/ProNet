"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { AddSkillDialog } from "./add-skill-dialog"

interface Skill {
  id: string
  name: string
  endorsements_count?: number
}

interface SkillsSectionProps {
  skills: Skill[]
  isOwnProfile: boolean
  userId?: string
  onSkillAdded?: () => void
  onSkillDeleted?: (skillId: string) => void
}

export function SkillsSection({ skills, isOwnProfile, userId, onSkillAdded, onSkillDeleted }: SkillsSectionProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Skills</CardTitle>
        {isOwnProfile && userId && (
          <AddSkillDialog
            userId={userId}
            onSkillAdded={onSkillAdded}
            trigger={
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </Button>
            }
          />
        )}
      </CardHeader>
      <CardContent>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
             {skills.map((skill) => (
               <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm flex items-center space-x-1">
                 <span>{skill.name}</span>
                 {isOwnProfile && (
                   <button
                     onClick={() => onSkillDeleted?.(skill.id)}
                     className="ml-1 text-gray-500 hover:text-red-500"
                   >
                     <X className="h-3 w-3" />
                   </button>
                 )}
               </Badge>
             ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No skills added yet</p>
             {isOwnProfile && userId && (
               <AddSkillDialog
                 userId={userId}
                 trigger={
                   <Button variant="outline" className="mt-2 bg-transparent">
                     Add Your First Skill
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
