"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
}

export function SkillsSection({ skills, isOwnProfile, userId, onSkillAdded }: SkillsSectionProps) {
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
              <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm">
                {skill.name}
                {skill.endorsements_count && skill.endorsements_count > 0 && (
                  <span className="ml-2 text-xs text-gray-500">({skill.endorsements_count})</span>
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
