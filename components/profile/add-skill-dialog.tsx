"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Skill {
  id: string
  name: string
}

interface AddSkillDialogProps {
  userId: string
  onSkillAdded?: () => void
  trigger?: React.ReactNode
}

export function AddSkillDialog({ userId, onSkillAdded, trigger }: AddSkillDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [customSkill, setCustomSkill] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAvailableSkills()
  }, [])

  const loadAvailableSkills = async () => {
    const { data: skills } = await supabase.from("skills").select("id, name").order("name")
    if (skills) {
      setAvailableSkills(skills)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let skillId = selectedSkill?.id

      // If custom skill, create it first
      if (customSkill && !selectedSkill) {
        const { data: newSkill, error: skillError } = await supabase
          .from("skills")
          .insert({ name: customSkill })
          .select()
          .single()

        if (skillError) throw skillError
        skillId = newSkill.id
      }

      if (!skillId) return

      // Check if skill is already added
      const { data: existing } = await supabase
        .from("user_skills")
        .select("id")
        .eq("user_id", userId)
        .eq("skill_id", skillId)
        .single()

      if (existing) {
        throw new Error("Skill already added to your profile")
      }

      // Add to user_skills
      const { error } = await supabase.from("user_skills").insert({
        user_id: userId,
        skill_id: skillId,
      })

      if (error) throw error

      setSelectedSkill(null)
      setCustomSkill("")
      setOpen(false)
      onSkillAdded?.()
      toast.success("Skill added successfully!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("Error adding skill:", message)
      toast.error(`Failed to add skill: ${message}`)
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
            <span>Add Skill</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Skill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Search Existing Skills</Label>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full justify-between"
                >
                  {selectedSkill ? selectedSkill.name : "Select skill..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search skills..." />
                  <CommandList>
                    <CommandEmpty>No skill found.</CommandEmpty>
                    <CommandGroup>
                      {availableSkills.map((skill) => (
                        <CommandItem
                          key={skill.id}
                          onSelect={() => {
                            setSelectedSkill(skill)
                            setCustomSkill("")
                            setSearchOpen(false)
                          }}
                        >
                          {skill.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-skill">Or Add Custom Skill</Label>
            <Input
              id="custom-skill"
              value={customSkill}
              onChange={(e) => {
                setCustomSkill(e.target.value)
                setSelectedSkill(null)
              }}
              placeholder="Enter custom skill name"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!selectedSkill && !customSkill)}>
              {loading ? "Adding..." : "Add Skill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}