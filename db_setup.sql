-- 1. FIX USERS TABLE
-- Ensure users table exists with strict schema
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('admin', 'internal', 'customer')) NOT NULL DEFAULT 'customer',
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Remove password_hash if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
    ALTER TABLE public.users DROP COLUMN password_hash;
  END IF;
END $$;

-- 2. CREATE SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, status)
  VALUES (new.id, new.email, 'customer', 'active')
  ON CONFLICT (id) DO NOTHING; -- Handle potential race conditions
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FIX RLS FOR SIGNUP AND ACCESS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Allow admins full access
-- Note: Recursive check avoided by using a simplified check or separate Admin query if needed.
-- But standard pattern:
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
CREATE POLICY "Admins have full access" ON public.users
  FOR ALL
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- INSTRUCTION FOR ADMIN CREATION:
-- 1. Go to Supabase Auth Dashboard -> Users -> Invite User / Create User
--    Email: admin@gmail.com
--    Password: <SECURE_PASSWORD>
-- 2. Get the User ID (UUID) of the newly created admin.
-- 3. Run the following SQL to promote them to Admin (Replace <UID> with the actual UUID):
--    UPDATE public.users SET role = 'admin' WHERE id = '<UID>';
