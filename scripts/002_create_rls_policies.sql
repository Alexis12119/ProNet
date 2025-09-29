-- Row Level Security Policies for ProNet

-- Users policies
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (auth.uid() = id);

-- Skills policies (public read, authenticated write)
CREATE POLICY "skills_select_all" ON public.skills FOR SELECT USING (true);
CREATE POLICY "skills_insert_authenticated" ON public.skills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User Skills policies
CREATE POLICY "user_skills_select_all" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "user_skills_insert_own" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills_delete_own" ON public.user_skills FOR DELETE USING (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "connections_select_involved" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "connections_update_receiver" ON public.connections FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "connections_delete_involved" ON public.connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Projects policies
CREATE POLICY "projects_select_all" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Jobs History policies
CREATE POLICY "jobs_history_select_involved" ON public.jobs_history FOR SELECT USING (auth.uid() = user_id OR auth.uid() = client_id);
CREATE POLICY "jobs_history_insert_client" ON public.jobs_history FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "jobs_history_update_client" ON public.jobs_history FOR UPDATE USING (auth.uid() = client_id);

-- Feedback policies
CREATE POLICY "feedback_select_involved" ON public.feedback FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.jobs_history WHERE id = job_id
    UNION
    SELECT client_id FROM public.jobs_history WHERE id = job_id
  )
);
CREATE POLICY "feedback_insert_client" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "feedback_update_client" ON public.feedback FOR UPDATE USING (auth.uid() = client_id);

-- Posts policies
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Post Likes policies
CREATE POLICY "post_likes_select_all" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert_own" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_own" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post Comments policies
CREATE POLICY "post_comments_select_all" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "post_comments_insert_own" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_update_own" ON public.post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_comments_delete_own" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Endorsements policies
CREATE POLICY "endorsements_select_all" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "endorsements_insert_own" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "endorsements_delete_own" ON public.endorsements FOR DELETE USING (auth.uid() = endorser_id);

-- Conversations policies
CREATE POLICY "conversations_select_participant" ON public.conversations FOR SELECT USING (
  id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "conversations_insert_authenticated" ON public.conversations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Conversation Participants policies
CREATE POLICY "conversation_participants_select_own" ON public.conversation_participants FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "conversation_participants_insert_own" ON public.conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "messages_select_participant" ON public.messages FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "messages_insert_participant" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "messages_update_sender" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_authenticated" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
