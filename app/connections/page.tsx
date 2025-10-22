"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ConnectionCard } from "@/components/connections/connection-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Users, UserPlus, Clock } from "lucide-react"

interface Connection {
  id: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  user: {
    id: string
    full_name: string
    headline?: string
    profile_image_url?: string
    location?: string
  }
  isRequester: boolean
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadConnections()
  }, [])

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (isLoading) {
        setIsLoading(false)
        // Check if session is still valid
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = "/auth/login"
        } else {
          setError("Loading timed out. Please refresh the page.")
        }
      }
    }, 10000) // 10 seconds

    return () => clearTimeout(timeout)
  }, [isLoading])

  const loadConnections = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      setCurrentUserId(user.id)

      // Get all connections (sent and received)
      const { data: connectionsData, error } = await supabase
        .from("connections")
        .select(`
          id,
          status,
          created_at,
          requester_id,
          receiver_id
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get user details for each connection
      const connectionsWithUsers: Connection[] = await Promise.all(
        (connectionsData || []).map(async (conn) => {
          const otherUserId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id
          const isRequester = conn.requester_id === user.id

           const { data: userData } = await supabase.from("users").select("*").eq("id", otherUserId).maybeSingle()

          return {
            id: conn.id,
            status: conn.status,
            created_at: conn.created_at,
            user: {
              id: userData.id,
              full_name: userData.full_name,
              headline: userData.headline,
              profile_image_url: userData.profile_image_url,
              location: userData.location,
            },
            isRequester,
          }
        }),
      )

      setConnections(connectionsWithUsers)
     } catch (error) {
       console.error("Error loading connections:", error)
       setError("Failed to load connections")
     } finally {
       setIsLoading(false)
     }
  }

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId)

      if (error) throw error

      // Update local state
      setConnections(
        connections.map((conn) => (conn.id === connectionId ? { ...conn, status: "accepted" as const } : conn)),
      )
    } catch (error) {
      console.error("Error accepting connection:", error)
    }
  }

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase.from("connections").update({ status: "rejected" }).eq("id", connectionId)

      if (error) throw error

      // Update local state
      setConnections(
        connections.map((conn) => (conn.id === connectionId ? { ...conn, status: "rejected" as const } : conn)),
      )
    } catch (error) {
      console.error("Error rejecting connection:", error)
    }
  }

  const filteredConnections = connections.filter((conn) =>
    conn.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const acceptedConnections = filteredConnections.filter((conn) => conn.status === "accepted")
  const pendingConnections = filteredConnections.filter((conn) => conn.status === "pending")
  const sentRequests = pendingConnections.filter((conn) => conn.isRequester)
  const receivedRequests = pendingConnections.filter((conn) => !conn.isRequester)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Network</h1>
          <p className="text-gray-600 mt-2">Manage your professional connections</p>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{acceptedConnections.length}</p>
                  <p className="text-sm text-gray-600">Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{receivedRequests.length}</p>
                  <p className="text-sm text-gray-600">Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{sentRequests.length}</p>
                  <p className="text-sm text-gray-600">Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections Tabs */}
        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections">Connections ({acceptedConnections.length})</TabsTrigger>
            <TabsTrigger value="requests">Requests ({receivedRequests.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            {acceptedConnections.length > 0 ? (
              acceptedConnections.map((connection) => <ConnectionCard key={connection.id} connection={connection} />)
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No connections yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start connecting with professionals in your field</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {receivedRequests.length > 0 ? (
              receivedRequests.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onAccept={handleAcceptConnection}
                  onReject={handleRejectConnection}
                />
              ))
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests</p>
                  <p className="text-sm text-gray-400 mt-2">Connection requests will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length > 0 ? (
              sentRequests.map((connection) => <ConnectionCard key={connection.id} connection={connection} />)
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No sent requests</p>
                  <p className="text-sm text-gray-400 mt-2">Requests you send will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
