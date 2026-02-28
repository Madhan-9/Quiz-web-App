-- Allow parents to view all profiles to search for their children
CREATE POLICY "Parents can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'parent'));

-- Allow teachers to view all profiles to see student information
CREATE POLICY "Teachers can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'teacher'));