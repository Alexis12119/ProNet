-- Comprehensive seed data for ProNet
-- This script creates sample users, posts, connections, and other data for testing

-- First, let's create some sample user profiles (these will be created when users sign up via Supabase Auth)
-- We'll insert profiles for existing auth users or create placeholder data

-- Insert sample user profiles
INSERT INTO public.profiles (id, full_name, headline, bio, location, website, avatar_url, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sarah Johnson', 'Senior Software Engineer at TechCorp', 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies.', 'San Francisco, CA', 'https://sarahjohnson.dev', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'Michael Chen', 'Product Designer & UX Researcher', 'Creating user-centered designs that solve real problems. Experienced in design systems, user research, and prototyping. Always learning and sharing knowledge.', 'New York, NY', 'https://michaelchen.design', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Emily Rodriguez', 'Digital Marketing Strategist', 'Helping brands grow through data-driven marketing strategies. Specializing in content marketing, SEO, and social media management.', 'Austin, TX', 'https://emilyrodriguez.com', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'David Kim', 'DevOps Engineer & Cloud Architect', 'Building robust infrastructure and CI/CD pipelines. AWS certified with expertise in Kubernetes, Docker, and infrastructure as code.', 'Seattle, WA', 'https://davidkim.tech', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'Lisa Thompson', 'Data Scientist & ML Engineer', 'Turning data into actionable insights. Experienced in Python, R, and machine learning algorithms. Passionate about AI ethics and responsible data science.', 'Boston, MA', 'https://lisathompson.ai', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000006', 'James Wilson', 'Freelance Web Developer', 'Full-stack developer specializing in modern web technologies. Available for freelance projects and consulting. Let''s build something amazing together!', 'Remote', 'https://jameswilson.dev', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO public.posts (id, user_id, content, image_url, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Just shipped a new feature that reduces our API response time by 40%! 🚀 Sometimes the smallest optimizations make the biggest difference. #webdev #performance', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Excited to share my latest design system work! Creating consistent, accessible components that scale across multiple products. Design systems are truly a game-changer for product teams. 🎨', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Content marketing tip: Your audience doesn''t want to be sold to, they want to be helped. Focus on providing value first, and the sales will follow naturally. What''s your best content marketing advice? 💡', NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'Successfully migrated our entire infrastructure to Kubernetes! The journey was challenging but the benefits are already showing: better scalability, easier deployments, and improved resource utilization. ☸️', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'Fascinating results from our latest A/B test on user onboarding! Small changes in copy and flow increased conversion by 23%. Data-driven decisions for the win! 📊', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 'Available for new freelance projects! Specializing in React, Next.js, and Node.js. If you need a reliable developer for your next project, let''s connect! 💻 #freelance #webdevelopment', NULL, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Insert sample connections
INSERT INTO public.connections (id, requester_id, addressee_id, status, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'accepted', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'accepted', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'accepted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'accepted', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO public.projects (id, user_id, title, description, project_url, github_url, image_url, technologies, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'E-commerce Platform', 'Full-stack e-commerce solution built with Next.js and Stripe integration. Features include user authentication, product catalog, shopping cart, and payment processing.', 'https://ecommerce-demo.vercel.app', 'https://github.com/sarahjohnson/ecommerce-platform', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop', ARRAY['Next.js', 'React', 'TypeScript', 'Stripe', 'PostgreSQL'], NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', 'Design System Library', 'Comprehensive design system with 50+ components, built for scalability and accessibility. Includes Figma components and React implementation.', 'https://designsystem.michaelchen.design', 'https://github.com/michaelchen/design-system', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop', ARRAY['Figma', 'React', 'Storybook', 'TypeScript'], NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', 'Content Analytics Dashboard', 'Marketing dashboard that tracks content performance across multiple channels. Built with real-time analytics and automated reporting.', 'https://analytics.emilyrodriguez.com', NULL, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', ARRAY['React', 'D3.js', 'Node.js', 'MongoDB'], NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', 'Kubernetes Monitoring Stack', 'Complete monitoring solution for Kubernetes clusters using Prometheus, Grafana, and custom alerting rules.', NULL, 'https://github.com/davidkim/k8s-monitoring', 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop', ARRAY['Kubernetes', 'Prometheus', 'Grafana', 'Docker'], NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000005', 'ML Prediction API', 'Machine learning API for predicting customer churn using advanced algorithms. Deployed on AWS with auto-scaling capabilities.', 'https://ml-api.lisathompson.ai', 'https://github.com/lisathompson/ml-prediction-api', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop', ARRAY['Python', 'scikit-learn', 'FastAPI', 'AWS', 'Docker'], NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000006', 'Task Management App', 'Modern task management application with real-time collaboration, drag-and-drop interface, and team features.', 'https://taskapp.jameswilson.dev', 'https://github.com/jameswilson/task-management', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop', ARRAY['React', 'Node.js', 'Socket.io', 'PostgreSQL'], NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample user skills relationships
INSERT INTO public.user_skills (user_id, skill_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM skills WHERE name = 'JavaScript'), NOW()),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM skills WHERE name = 'TypeScript'), NOW()),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM skills WHERE name = 'React'), NOW()),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM skills WHERE name = 'Next.js'), NOW()),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM skills WHERE name = 'Node.js'), NOW()),
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM skills WHERE name = 'UI/UX Design'), NOW()),
  ('00000000-0000-0000-0000-000000000002', (SELECT id FROM skills WHERE name = 'Graphic Design'), NOW()),
  ('00000000-0000-0000-0000-000000000003', (SELECT id FROM skills WHERE name = 'Digital Marketing'), NOW()),
  ('00000000-0000-0000-0000-000000000003', (SELECT id FROM skills WHERE name = 'Content Writing'), NOW()),
  ('00000000-0000-0000-0000-000000000004', (SELECT id FROM skills WHERE name = 'DevOps'), NOW()),
  ('00000000-0000-0000-0000-000000000005', (SELECT id FROM skills WHERE name = 'Data Analysis'), NOW()),
  ('00000000-0000-0000-0000-000000000005', (SELECT id FROM skills WHERE name = 'Machine Learning'), NOW()),
  ('00000000-0000-0000-0000-000000000005', (SELECT id FROM skills WHERE name = 'Python'), NOW()),
  ('00000000-0000-0000-0000-000000000006', (SELECT id FROM skills WHERE name = 'JavaScript'), NOW()),
  ('00000000-0000-0000-0000-000000000006', (SELECT id FROM skills WHERE name = 'React'), NOW()),
  ('00000000-0000-0000-0000-000000000006', (SELECT id FROM skills WHERE name = 'Node.js'), NOW())
ON CONFLICT (user_id, skill_id) DO NOTHING;

-- Insert sample messages (conversations between connected users)
INSERT INTO public.messages (id, sender_id, receiver_id, content, created_at, updated_at) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Hi Michael! I saw your design system work and I''m really impressed. Would love to collaborate on a project sometime.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Thanks Sarah! I''d love to collaborate. Your work on performance optimization is exactly what we need for our next project.', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'Lisa, your A/B testing insights are fascinating! Could we schedule a call to discuss how you approach experimentation?', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'James, I noticed you''re available for freelance work. We have a project that could use your React expertise. Interested?', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample post likes
INSERT INTO public.post_likes (post_id, user_id, created_at) VALUES
  ((SELECT id FROM posts WHERE content LIKE 'Just shipped a new feature%' LIMIT 1), '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day'),
  ((SELECT id FROM posts WHERE content LIKE 'Just shipped a new feature%' LIMIT 1), '00000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day'),
  ((SELECT id FROM posts WHERE content LIKE 'Excited to share my latest design%' LIMIT 1), '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 hours'),
  ((SELECT id FROM posts WHERE content LIKE 'Excited to share my latest design%' LIMIT 1), '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '18 hours'),
  ((SELECT id FROM posts WHERE content LIKE 'Content marketing tip%' LIMIT 1), '00000000-0000-0000-0000-000000000005', NOW() - INTERVAL '2 hours'),
  ((SELECT id FROM posts WHERE content LIKE 'Successfully migrated our entire%' LIMIT 1), '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days'),
  ((SELECT id FROM posts WHERE content LIKE 'Fascinating results from our latest%' LIMIT 1), '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours'),
  ((SELECT id FROM posts WHERE content LIKE 'Available for new freelance%' LIMIT 1), '00000000-0000-0000-0000-000000000004', NOW() - INTERVAL '30 minutes')
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Insert sample post comments
INSERT INTO public.post_comments (id, post_id, user_id, content, created_at, updated_at) VALUES
  (gen_random_uuid(), (SELECT id FROM posts WHERE content LIKE 'Just shipped a new feature%' LIMIT 1), '00000000-0000-0000-0000-000000000002', 'Amazing work! What optimization techniques did you use?', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), (SELECT id FROM posts WHERE content LIKE 'Content marketing tip%' LIMIT 1), '00000000-0000-0000-0000-000000000001', 'So true! I always focus on solving problems first. Great advice Emily!', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), (SELECT id FROM posts WHERE content LIKE 'Successfully migrated our entire%' LIMIT 1), '00000000-0000-0000-0000-000000000006', 'Kubernetes is a game changer! How long did the migration take?', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), (SELECT id FROM posts WHERE content LIKE 'Available for new freelance%' LIMIT 1), '00000000-0000-0000-0000-000000000003', 'Sent you a message about a potential project!', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes')
ON CONFLICT (id) DO NOTHING;
