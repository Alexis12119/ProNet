import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Calendar,
  Edit,
  MessageSquare,
  UserPlus,
  Star,
} from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  user: {
    id: string;
    full_name: string;
    headline?: string;
    bio?: string;
    location?: string;
    profile_image_url?: string;
    created_at: string;
  };
  isOwnProfile: boolean;
  isConnected?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  averageRating?: number;
  totalJobs?: number;
  onMessage?: () => void;
  onConnect?: () => void;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isConnected,
  connectionStatus,
  averageRating,
  totalJobs,
  onMessage,
  onConnect,
}: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg" />

        {/* Profile Content */}
        <div className="px-6 pb-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage
                  src={user.profile_image_url || "/placeholder.svg"}
                  alt={user.full_name}
                />
                <AvatarFallback className="text-2xl font-semibold bg-blue-100 text-blue-700">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 sm:mt-0 sm:mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                {user.headline && (
                  <p className="text-lg text-gray-600 mt-1">{user.headline}</p>
                )}

                {averageRating && averageRating > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star
                        className={`h-5 w-5 ${getRatingColor(averageRating)} fill-current`}
                      />
                      <span
                        className={`font-semibold ${getRatingColor(averageRating)}`}
                      >
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">
                      {totalJobs} completed jobs
                    </span>
                    <Link
                      href={`/freelancer/${user.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Reviews
                    </Link>
                  </div>
                )}

                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  {user.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatJoinDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-transparent"
                    onClick={onMessage}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </Button>
                  <Button
                    className={`flex items-center space-x-2 ${
                      connectionStatus === "connected"
                        ? "bg-green-600 hover:bg-green-700"
                        : connectionStatus === "pending"
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={onConnect}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>
                      {connectionStatus === "connected"
                        ? "Connected"
                        : connectionStatus === "pending"
                          ? "Pending"
                          : "Connect"}
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-4">
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
