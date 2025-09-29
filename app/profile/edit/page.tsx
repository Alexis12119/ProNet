"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Save, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AddSkillDialog } from "@/components/profile/add-skill-dialog";
import { resizeImage } from "@/lib/image-utils";

interface UserProfile {
  id: string;
  full_name: string;
  headline?: string;
  bio?: string;
  location?: string;
  profile_image_url?: string;
}

interface Skill {
  id: string;
  name: string;
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const supabase = createClient();

   useEffect(() => {
     loadProfile();
   }, []);



   const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);


    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };



  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };





  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploadingImage(true);
    setError(null);

    try {
      let fileToUpload = file;

      // Resize image for profile (square format)
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await resizeImage(file, 300, 300);
        } catch (error) {
          console.error('Error resizing image:', error);
          // Use original file if resizing fails
        }
      }

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_image_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, profile_image_url: publicUrl });
      toast.success("Profile photo updated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error uploading image:", message);
      toast.error(`Failed to upload image: ${message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: profile.full_name,
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      router.push(`/profile/${profile.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error saving profile:", message);
      toast.error(`Failed to save profile: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/profile/${profile.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          </div>
          <Button
            onClick={saveProfile}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={profile.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
                    alt={profile.full_name}
                  />
                  <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Profile Picture
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload a professional photo
                  </p>
                   <div className="mt-2">
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleImageUpload}
                       className="hidden"
                       id="profile-image-upload"
                       disabled={uploadingImage}
                     />
                     <Button
                       variant="outline"
                       size="sm"
                       className="bg-transparent"
                       onClick={() => document.getElementById('profile-image-upload')?.click()}
                       disabled={uploadingImage}
                     >
                       <Upload className="h-4 w-4 mr-2" />
                       {uploadingImage ? "Uploading..." : "Change Photo"}
                     </Button>
                   </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) =>
                      handleProfileUpdate("full_name", e.target.value)
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) =>
                      handleProfileUpdate("location", e.target.value)
                    }
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  value={profile.headline || ""}
                  onChange={(e) =>
                    handleProfileUpdate("headline", e.target.value)
                  }
                  placeholder="e.g., Software Engineer at TechCorp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ""}
                  onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
