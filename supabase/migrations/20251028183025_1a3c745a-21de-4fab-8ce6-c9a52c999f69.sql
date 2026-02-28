-- Update quiz_attempts score constraint to allow percentage values (0-100)
ALTER TABLE quiz_attempts DROP CONSTRAINT quiz_attempts_score_check;
ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_score_check CHECK (score >= 0 AND score <= 100);