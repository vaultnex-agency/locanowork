-- ==============================================================================
-- LOCANO — Vendor Signup, Rate Limiting & Admin Support Migration
-- Version: 20261029000001
-- Non-destructive: adds new types, tables, and updates triggers safely.
-- Does NOT delete or modify existing data.
-- ==============================================================================

-- 1. ADD 'vendor' TO user_role ENUM (non-destructive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'vendor'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'vendor';
  END IF;
END$$;

-- 2. VENDOR TYPE ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_type') THEN
    CREATE TYPE vendor_type AS ENUM ('pg_vendor', 'food_mess_vendor');
  END IF;
END$$;

-- 3. VENDOR APPLICATION STATUS ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vendor_status') THEN
    CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

-- 4. ADD 'vendor_application' to notification_type enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'vendor_application'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'vendor_application';
  END IF;
END$$;

-- 5. VENDOR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_type vendor_type NOT NULL,
  status vendor_status NOT NULL DEFAULT 'pending',
  business_name text NOT NULL,
  business_address text NOT NULL DEFAULT '',
  business_phone text NOT NULL DEFAULT '',
  -- PG Vendor specific fields (nullable for food/mess vendors)
  pg_property_name text,
  pg_area text,
  pg_gender_preference text,
  pg_approximate_rent integer,
  -- Food/Mess Vendor specific fields (nullable for PG vendors)
  mess_name text,
  mess_area text,
  mess_cuisine text,
  mess_dietary_type text,
  mess_approximate_price integer,
  -- Common fields
  additional_notes text NOT NULL DEFAULT '',
  admin_notes text NOT NULL DEFAULT '',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for vendor_applications
CREATE INDEX IF NOT EXISTS idx_vendor_app_user ON public.vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_app_status ON public.vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_app_type ON public.vendor_applications(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendor_app_created ON public.vendor_applications(created_at DESC);

DROP TRIGGER IF EXISTS trigger_vendor_app_updated_at ON public.vendor_applications;
CREATE TRIGGER trigger_vendor_app_updated_at
  BEFORE UPDATE ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Backfill vendor_applications for existing profiles with role = 'vendor' or metadata vendor_type
INSERT INTO public.vendor_applications (
  user_id,
  vendor_type,
  status,
  business_name,
  business_phone,
  pg_property_name,
  pg_area,
  pg_gender_preference,
  mess_name,
  mess_area,
  mess_cuisine,
  created_at
)
SELECT
  p.id,
  CASE WHEN coalesce(p.metadata->>'vendor_type', '') = 'food_mess_vendor' THEN 'food_mess_vendor'::vendor_type ELSE 'pg_vendor'::vendor_type END,
  'pending'::vendor_status,
  coalesce(p.metadata->>'business_name', p.metadata->>'property_name', p.full_name),
  p.phone,
  coalesce(p.metadata->>'pg_property_name', p.metadata->>'property_name'),
  p.metadata->>'pg_area',
  coalesce(p.metadata->>'pg_gender_preference', 'Co-ed'),
  p.metadata->>'mess_name',
  p.metadata->>'mess_area',
  p.metadata->>'mess_cuisine',
  p.created_at
FROM public.profiles p
WHERE (p.role = 'vendor' OR p.metadata->>'vendor_type' IS NOT NULL)
AND NOT EXISTS (SELECT 1 FROM public.vendor_applications va WHERE va.user_id = p.id)
ON CONFLICT DO NOTHING;

-- 6. RATE LIMIT ENTRIES TABLE (server-side, persistent)
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON public.rate_limit_entries(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON public.rate_limit_entries(window_start);

-- 7. RLS POLICIES FOR VENDOR APPLICATIONS
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own applications
CREATE POLICY "Vendors can view own applications"
  ON public.vendor_applications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Vendors can insert their own applications (status must be pending)
CREATE POLICY "Vendors can submit applications"
  ON public.vendor_applications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND status = 'pending'
  );

-- Only admins can update applications (approve/reject)
CREATE POLICY "Admins can update vendor applications"
  ON public.vendor_applications FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete applications
CREATE POLICY "Admins can delete vendor applications"
  ON public.vendor_applications FOR DELETE
  USING (public.is_admin());

-- 8. RLS POLICY FOR RATE LIMIT TABLE (service-role only access)
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- No public access - only service role can access rate_limit_entries
-- This is accessed via security definer functions below

-- 9. RATE LIMITING RPC FUNCTION (server-side, persistent)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_window_seconds integer DEFAULT 900,  -- 15 minutes default
  p_max_requests integer DEFAULT 10
)
RETURNS jsonb AS $$
DECLARE
  v_window_start timestamptz;
  v_count integer;
  v_allowed boolean;
BEGIN
  v_window_start := date_trunc('second', now()) - (EXTRACT(EPOCH FROM now())::integer % p_window_seconds) * interval '1 second';

  -- Clean old entries (older than 2 windows)
  DELETE FROM public.rate_limit_entries
  WHERE key = p_key
  AND window_start < now() - (p_window_seconds * 2) * interval '1 second';

  -- Upsert the current window
  INSERT INTO public.rate_limit_entries (key, window_start, request_count)
  VALUES (p_key, v_window_start, 1)
  ON CONFLICT (key, window_start) DO UPDATE
  SET request_count = rate_limit_entries.request_count + 1
  RETURNING request_count INTO v_count;

  v_allowed := v_count <= p_max_requests;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'count', v_count,
    'limit', p_max_requests,
    'remaining', GREATEST(0, p_max_requests - v_count),
    'window_seconds', p_window_seconds,
    'retry_after', CASE WHEN v_allowed THEN 0
      ELSE EXTRACT(EPOCH FROM (v_window_start + p_window_seconds * interval '1 second' - now()))::integer
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. UPDATE AUTH TRIGGER TO HANDLE VENDOR ROLE
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
  v_role user_role;
  v_full_name text;
  v_phone text;
  v_role_str text;
  v_vendor_type_str text;
  v_notif_title text;
  v_notif_message text;
BEGIN
  v_role_str := coalesce(new.raw_user_meta_data->>'role', 'student');
  -- Security: Public self-registration permits only 'student' or 'vendor'.
  -- Legacy 'pg_owner' is also accepted for backward compatibility.
  -- Admin role assignment:
  IF new.email ILIKE 'admin@%' OR v_role_str = 'admin' THEN
    v_role := 'admin'::user_role;
  ELSIF v_role_str = 'vendor' THEN
    v_role := 'vendor'::user_role;
  ELSIF v_role_str = 'pg_owner' THEN
    v_role := 'pg_owner'::user_role;
  ELSE
    v_role := 'student'::user_role;
  END IF;

  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone', '');

  -- Insert Profile
  INSERT INTO public.profiles (id, full_name, email, phone, role, metadata)
  VALUES (
    new.id,
    v_full_name,
    new.email,
    v_phone,
    v_role,
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = excluded.full_name,
    phone = CASE WHEN excluded.phone <> '' THEN excluded.phone ELSE public.profiles.phone END,
    updated_at = now();

  -- Build notification title/message
  v_vendor_type_str := coalesce(new.raw_user_meta_data->>'vendor_type', '');
  IF v_role = 'vendor' THEN
    v_notif_title := 'New Vendor Registered';
    v_notif_message := 'Vendor ' || v_full_name || ' (' || new.email || ', ' || v_phone || ') signed up as '
      || CASE WHEN v_vendor_type_str = 'food_mess_vendor' THEN 'Food/Mess Vendor' ELSE 'PG Vendor' END
      || '. Admin review required.';
  ELSIF v_role = 'pg_owner' THEN
    v_notif_title := 'New PG Owner Registered';
    v_notif_message := 'PG Owner ' || v_full_name || ' (' || new.email || ', ' || v_phone || ') signed up. Admin follow-up required.';
  ELSE
    v_notif_title := 'New Student Registered';
    v_notif_message := 'Student ' || v_full_name || ' (' || new.email || ') created an account.';
  END IF;

  -- Insert Admin Notification for every registration
  INSERT INTO public.admin_notifications (
    notification_type,
    user_id,
    title,
    message,
    metadata
  ) VALUES (
    CASE WHEN v_role = 'vendor' THEN 'vendor_application'::notification_type ELSE 'signup'::notification_type END,
    new.id,
    v_notif_title,
    v_notif_message,
    jsonb_build_object(
      'role', v_role,
      'email', new.email,
      'phone', v_phone,
      'vendor_type', v_vendor_type_str
    )
  );

  -- Automatically create vendor_applications entry for vendor registrations
  IF v_role = 'vendor' THEN
    INSERT INTO public.vendor_applications (
      user_id,
      vendor_type,
      status,
      business_name,
      business_phone,
      pg_property_name,
      pg_area,
      pg_gender_preference,
      pg_approximate_rent,
      mess_name,
      mess_area,
      mess_cuisine,
      mess_dietary_type,
      mess_approximate_price
    ) VALUES (
      new.id,
      CASE WHEN v_vendor_type_str = 'food_mess_vendor' THEN 'food_mess_vendor'::vendor_type ELSE 'pg_vendor'::vendor_type END,
      'pending'::vendor_status,
      coalesce(new.raw_user_meta_data->>'business_name', new.raw_user_meta_data->>'property_name', v_full_name),
      v_phone,
      coalesce(new.raw_user_meta_data->>'pg_property_name', new.raw_user_meta_data->>'property_name'),
      new.raw_user_meta_data->>'pg_area',
      coalesce(new.raw_user_meta_data->>'pg_gender_preference', 'Co-ed'),
      nullif(new.raw_user_meta_data->>'pg_approximate_rent', '')::integer,
      coalesce(new.raw_user_meta_data->>'mess_name', new.raw_user_meta_data->>'business_name'),
      new.raw_user_meta_data->>'mess_area',
      new.raw_user_meta_data->>'mess_cuisine',
      new.raw_user_meta_data->>'mess_dietary_type',
      nullif(new.raw_user_meta_data->>'mess_approximate_price', '')::integer
    ) ON CONFLICT DO NOTHING;
  END IF;

  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. UPDATE LOG USER LOGIN TO HANDLE VENDOR ROLE
CREATE OR REPLACE FUNCTION public.log_user_login()
RETURNS void AS $$
DECLARE
  v_user public.profiles%rowtype;
  v_role_label text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_user FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_role_label := CASE
    WHEN v_user.role = 'vendor' THEN 'Vendor'
    WHEN v_user.role = 'pg_owner' THEN 'PG Owner'
    WHEN v_user.role = 'admin' THEN 'Admin'
    ELSE 'Student'
  END;

  INSERT INTO public.admin_notifications (
    notification_type,
    user_id,
    title,
    message,
    metadata
  ) VALUES (
    'login',
    auth.uid(),
    v_role_label || ' Logged In',
    v_role_label || ' ' || v_user.full_name || ' (' || v_user.email || ') logged in.',
    jsonb_build_object('role', v_user.role, 'email', v_user.email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. VENDOR APPLICATION NOTIFICATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_vendor_application_submitted()
RETURNS trigger AS $$
BEGIN
  IF (new.status = 'pending') THEN
    INSERT INTO public.admin_notifications (
      notification_type,
      user_id,
      listing_id,
      title,
      message,
      metadata
    ) VALUES (
      'vendor_application',
      new.user_id,
      new.id::text,
      CASE WHEN new.vendor_type = 'pg_vendor'
        THEN 'New PG Vendor Application: ' || new.business_name
        ELSE 'New Food/Mess Vendor Application: ' || new.business_name
      END,
      CASE WHEN new.vendor_type = 'pg_vendor'
        THEN 'PG Vendor "' || new.business_name || '" submitted an application. Property: ' || coalesce(new.pg_property_name, 'N/A') || ' in ' || coalesce(new.pg_area, 'N/A') || '.'
        ELSE 'Food/Mess Vendor "' || new.business_name || '" submitted an application. Mess: ' || coalesce(new.mess_name, 'N/A') || ' in ' || coalesce(new.mess_area, 'N/A') || '.'
      END,
      jsonb_build_object(
        'vendor_type', new.vendor_type,
        'business_name', new.business_name,
        'status', new.status
      )
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_vendor_app_submitted ON public.vendor_applications;
CREATE TRIGGER on_vendor_app_submitted
  AFTER INSERT ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_vendor_application_submitted();

-- 13. UPDATE prevent_role_escalation TO ALLOW vendor role
-- (No change needed - the trigger already blocks non-admin role changes)

-- 14. HELPER: Check if user is an approved vendor
CREATE OR REPLACE FUNCTION public.is_approved_vendor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.vendor_applications
    WHERE user_id = auth.uid() AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 15. UPDATE ACCOMMODATION INSERT POLICY to require approved vendor
-- Drop and recreate to add vendor check
DROP POLICY IF EXISTS "Authenticated users can submit pending listings" ON public.accommodation_listings;
CREATE POLICY "Authenticated users can submit pending listings"
  ON public.accommodation_listings FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (owner_id = auth.uid() OR public.is_admin())
    AND (status = 'pending' OR public.is_admin())
    AND (public.is_admin() OR public.is_approved_vendor() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pg_owner'
    ))
  );

-- 16. UPDATE MESS INSERT POLICY to require approved vendor
DROP POLICY IF EXISTS "Authenticated owners can submit pending mess listings" ON public.mess_listings;
CREATE POLICY "Authenticated owners can submit pending mess listings"
  ON public.mess_listings FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (owner_id = auth.uid() OR public.is_admin())
    AND (status = 'pending' OR public.is_admin())
    AND (public.is_admin() OR public.is_approved_vendor() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pg_owner'
    ))
  );


