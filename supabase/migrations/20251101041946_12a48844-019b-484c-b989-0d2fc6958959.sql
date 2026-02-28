-- Drop the incorrect parent policy
DROP POLICY IF EXISTS "Parents can view attempts of linked students" ON quiz_attempts;

-- Create a better policy that allows parents to view any student's quiz attempts
-- Parents need to search by mobile number, so they should be able to view attempts
-- of students whose profiles they can access
CREATE POLICY "Parents can view student attempts"
ON quiz_attempts
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'parent'::app_role)
);