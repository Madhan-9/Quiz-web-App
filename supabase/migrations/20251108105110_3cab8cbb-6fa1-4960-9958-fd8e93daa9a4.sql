-- Add suggestions and feedback columns to quiz_attempts table
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS suggestions jsonb,
ADD COLUMN IF NOT EXISTS feedback text;