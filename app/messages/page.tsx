"use client";

  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import { createClient } from "@/lib/supabase/client";
  import { ConversationList } from "@/components/messaging/conversation-list";
  import { ChatInterface } from "@/components/messaging/chat-interface";
  import { Card } from "@/components/ui/card";
  import { MessageSquare } from "lucide-react";
  import type { RealtimeChannel } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
}

interface Participant {
  id: string;
  full_name: string;
  profile_image_url?: string;
  headline?: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount: number;
  updated_at: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
   const router = useRouter();
    const supabase = createClient();

   useEffect(() => {
     loadConversations();

     // Set up real-time subscription for conversations and messages
     const channel = supabase
       .channel("messages-changes")
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "conversations",
         },
         (payload) => {
           console.log("Conversation change detected:", payload);
           loadConversations();
         },
       )
       .on(
         "postgres_changes",
         {
           event: "*",
           schema: "public",
           table: "messages",
         },
         (payload) => {
           console.log("Message change detected:", payload);
           if (selectedConversationId) {
             loadMessages(selectedConversationId);
           }
         },
       )
       .subscribe();

     return () => {
       channel.unsubscribe();
     };
    }, [selectedConversationId]);

   // Add a timeout to prevent infinite loading
   useEffect(() => {
     const timeout = setTimeout(() => {
       if (isLoading) {
         setIsLoading(false);
         console.error("Loading timed out. Please refresh the page.");
       }
     }, 10000); // 10 seconds

     return () => clearTimeout(timeout);
   }, [isLoading]);

     // Handle URL and localStorage-based conversation selection
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const conversationIdFromUrl = urlParams.get("conversation");
      const conversationIdFromStorage = localStorage.getItem("selectedConversationId");

      if (conversationIdFromUrl && conversations.length > 0) {
        const conversationExists = conversations.some(conv => conv.id === conversationIdFromUrl);
        if (conversationExists) {
          setSelectedConversationId(conversationIdFromUrl);
          localStorage.setItem("selectedConversationId", conversationIdFromUrl);
        }
      } else if (conversationIdFromStorage && conversations.length > 0) {
        const conversationExists = conversations.some(conv => conv.id === conversationIdFromStorage);
        if (conversationExists) {
          setSelectedConversationId(conversationIdFromStorage);
          // Update URL to reflect the stored conversation
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("conversation", conversationIdFromStorage);
          window.history.replaceState({}, "", newUrl.toString());
        }
      }
    }, [conversations]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  const loadConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setCurrentUserId(user.id);

      // Get user's conversation IDs
      const { data: userConversations, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (error) throw error;

      const conversationIds =
        userConversations?.map((cp) => cp.conversation_id) || [];

      if (conversationIds.length === 0) {
        setConversations([]);
        return;
      }

      // Get conversations
      const { data: conversationsData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds);

      if (convError) throw convError;

      // Get all participants and last messages for each conversation
      const conversationsWithDetails: Conversation[] = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const conversationId = conv.id;

          // Get all participants
          const { data: allParticipants } = await supabase
            .from("conversation_participants")
            .select(
              `
               user_id,
               users (
                 id,
                 full_name,
                 profile_image_url,
                 headline
               )
             `,
            )
            .eq("conversation_id", conversationId);

          const participants: Participant[] =
            allParticipants?.map((p) => ({
              id: (p.users as any).id,
              full_name: (p.users as any).full_name,
              profile_image_url: (p.users as any).profile_image_url,
              headline: (p.users as any).headline,
            })) || [];

           // Get last message
           const { data: lastMessageData } = await supabase
             .from("messages")
             .select("content, created_at, sender_id")
             .eq("conversation_id", conversationId)
             .order("created_at", { ascending: false })
             .limit(1)
             .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversationId)
            .neq("sender_id", user.id)
            .is("read_at", null);

          return {
            id: conversationId,
            participants,
            lastMessage: lastMessageData || undefined,
            unreadCount: unreadCount || 0,
            updated_at: conv.updated_at,
          };
        }),
      );

      // Sort by last activity
      conversationsWithDetails.sort(
        (a, b) =>
          new Date(b.lastMessage?.created_at || b.updated_at).getTime() -
          new Date(a.lastMessage?.created_at || a.updated_at).getTime(),
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error(
        "Error loading conversations:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Get participants
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("conversation_participants")
          .select(
            `
          users (
            id,
            full_name,
            profile_image_url,
            headline
          )
        `,
          )
          .eq("conversation_id", conversationId);

      if (participantsError) throw participantsError;

      const participantsList: Participant[] =
        participantsData?.map((p) => ({
          id: (p.users as any).id,
          full_name: (p.users as any).full_name,
          profile_image_url: (p.users as any).profile_image_url,
          headline: (p.users as any).headline,
        })) || [];

      setParticipants(participantsList);

      // Mark messages as read
      if (currentUserId) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .neq("sender_id", currentUserId)
          .is("read_at", null);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
   };

    const handleConversationSelect = (conversationId: string) => {
      setSelectedConversationId(conversationId);
      // Update URL and localStorage
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("conversation", conversationId);
      window.history.replaceState({}, "", newUrl.toString());
      localStorage.setItem("selectedConversationId", conversationId);
    };

   const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!selectedConversationId || !currentUserId) return;

    try {
       // Create the message first
       const { data: newMessage, error: messageError } = await supabase
         .from("messages")
         .insert({
           conversation_id: selectedConversationId,
           sender_id: currentUserId,
           content,
         })
         .select()
         .maybeSingle();

      if (messageError) throw messageError;

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        const attachmentRecords = attachments.map((att) => ({
          message_id: newMessage.id,
          file_url: att.file_url,
          file_name: att.file_name,
          file_type: att.file_type,
          file_size: att.file_size,
        }));

        const { error: attachmentError } = await supabase
          .from("message_attachments")
          .insert(attachmentRecords);

        if (attachmentError) throw attachmentError;
      }

      // Add message to local state (attachments can be fetched later or stored separately)
      setMessages((prev) => [...prev, newMessage]);

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                lastMessage: {
                  content,
                  created_at: newMessage.created_at,
                  sender_id: currentUserId,
                },
                updated_at: newMessage.created_at,
              }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            Stay connected with your professional network
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
          {/* Conversations List */}
          <Card className="border-0 shadow-lg">
             <ConversationList
               conversations={conversations}
               currentUserId={currentUserId!}
               selectedConversationId={selectedConversationId || undefined}
               onSelectConversation={handleConversationSelect}
             />
          </Card>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg h-[500px]">
              {selectedConversationId ? (
                 <ChatInterface
                   conversationId={selectedConversationId}
                   messages={messages}
                   participants={participants}
                   currentUserId={currentUserId!}
                   onSendMessage={handleSendMessage}
                   onUpdateMessages={setMessages}
                   isLoading={isLoadingMessages}
                 />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Select a conversation to start messaging
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Choose from your existing conversations or start a new one
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
