-- Allow any authenticated user to create quizzes (not just teachers)
-- This enables students to save AI-generated quizzes
DROP POLICY IF EXISTS "Teachers can create quizzes" ON quizzes;

CREATE POLICY "Authenticated users can create quizzes" 
ON quizzes 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);