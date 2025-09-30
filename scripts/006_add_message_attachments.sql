-- Add message attachments support

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (assuming similar to messages)
-- Users can view attachments for messages they participate in
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_attachments.message_id AND cp.user_id = auth.uid()
    )
  );

-- Users can insert attachments for their own messages
CREATE POLICY "Users can insert attachments for their messages" ON public.message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id AND m.sender_id = auth.uid()
    )
  );

-- Users can update their own attachments
CREATE POLICY "Users can update their own attachments" ON public.message_attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id AND m.sender_id = auth.uid()
    )
  );

-- Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments" ON public.message_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id AND m.sender_id = auth.uid()
    )
  );
