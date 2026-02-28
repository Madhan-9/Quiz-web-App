-- Allow students to update their own quiz attempts (for suggestions)
CREATE POLICY "Users can update their own attempts"
ON public.quiz_attempts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);