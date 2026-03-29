-- Run this SQL in your Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run

-- =============================================
-- 0. PROFILES TABLE + AUTO-TRIGGER
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamptz DEFAULT now(),
    full_name text,
    username text,
    avatar_url text,
    is_admin boolean DEFAULT false
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles"  ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Public read profiles"   ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-create a profile row whenever someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    LOWER(REPLACE(split_part(new.email, '@', 1), '.', '_')),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill: create profiles for users who already signed up before this trigger existed
INSERT INTO public.profiles (id, full_name, username, avatar_url, updated_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  LOWER(REPLACE(split_part(email, '@', 1), '.', '_')),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 1. PORTFOLIO_ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS portfolio_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    category text NOT NULL DEFAULT 'Voting Platform',
    description text,
    badge text,
    cover_image text,
    gallery_images text[] DEFAULT '{}'::text[]
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public read portfolio_items" ON portfolio_items;
DROP POLICY IF EXISTS "Admin insert portfolio_items" ON portfolio_items;
DROP POLICY IF EXISTS "Admin update portfolio_items" ON portfolio_items;
DROP POLICY IF EXISTS "Admin delete portfolio_items" ON portfolio_items;

CREATE POLICY "Public read portfolio_items"  ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin insert portfolio_items" ON portfolio_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update portfolio_items" ON portfolio_items FOR UPDATE USING (true);
CREATE POLICY "Admin delete portfolio_items" ON portfolio_items FOR DELETE USING (true);

-- =============================================
-- 2. SERVICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    icon text DEFAULT 'Code2',
    badge text,
    points text[] DEFAULT '{}'::text[],
    whatsapp_msg text,
    cover_image text,
    display_order int DEFAULT 0
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read services"  ON services;
DROP POLICY IF EXISTS "Admin insert services" ON services;
DROP POLICY IF EXISTS "Admin update services" ON services;
DROP POLICY IF EXISTS "Admin delete services" ON services;

CREATE POLICY "Public read services"  ON services FOR SELECT USING (true);
CREATE POLICY "Admin insert services" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update services" ON services FOR UPDATE USING (true);
CREATE POLICY "Admin delete services" ON services FOR DELETE USING (true);

-- =============================================
-- 3. STORAGE BUCKET FOR IMAGE UPLOADS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies first
DROP POLICY IF EXISTS "Public access portfolio bucket" ON storage.objects;
DROP POLICY IF EXISTS "Upload to portfolio bucket"     ON storage.objects;
DROP POLICY IF EXISTS "Update portfolio bucket"        ON storage.objects;
DROP POLICY IF EXISTS "Delete portfolio bucket"        ON storage.objects;

CREATE POLICY "Public access portfolio bucket"
    ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Upload to portfolio bucket"
    ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Update portfolio bucket"
    ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio');

CREATE POLICY "Delete portfolio bucket"
    ON storage.objects FOR DELETE USING (bucket_id = 'portfolio');
-- =============================================
-- 4. PURCHASES TABLE (Payment History)
-- =============================================
CREATE TABLE IF NOT EXISTS purchases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    reference text NOT NULL UNIQUE,
    description text NOT NULL DEFAULT 'LCX STUDIOS Purchase',
    amount numeric(10, 2) NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'success',
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_reference_idx ON purchases(reference);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own purchases" ON purchases;
DROP POLICY IF EXISTS "Service role insert purchases" ON purchases;
DROP POLICY IF EXISTS "Admin read all purchases" ON purchases;

-- Users can only read their own purchases
CREATE POLICY "Users see own purchases"
    ON purchases FOR SELECT
    USING (auth.uid() = user_id);

-- Edge function (service role) can insert purchases
CREATE POLICY "Service role insert purchases"
    ON purchases FOR INSERT WITH CHECK (true);

-- =============================================
-- ALSO RUN THIS if you are an admin and can't see purchases in the dashboard:
-- =============================================
DROP POLICY IF EXISTS "Admin read all purchases" ON purchases;
CREATE POLICY "Admin read all purchases"
    ON purchases FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );


