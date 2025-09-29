-- Seed sample data for ProNet

-- Insert sample skills
INSERT INTO public.skills (name) VALUES
  ('JavaScript'),
  ('TypeScript'),
  ('React'),
  ('Next.js'),
  ('Node.js'),
  ('Python'),
  ('UI/UX Design'),
  ('Graphic Design'),
  ('Project Management'),
  ('Digital Marketing'),
  ('Content Writing'),
  ('Data Analysis'),
  ('Machine Learning'),
  ('DevOps'),
  ('Mobile Development')
ON CONFLICT (name) DO NOTHING;
