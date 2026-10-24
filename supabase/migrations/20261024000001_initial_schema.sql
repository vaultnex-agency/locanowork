-- ==============================================================================
-- LOCANO — Initial Database Schema & Migrations
-- Target: Supabase (PostgreSQL 15+)
-- Scope: Accommodation, Food & Mess, Profiles, RBAC, Admin Notifications
-- Note: Transport is 100% untouched and kept outside this database layer.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CUSTOM TYPES & ENUMS
create type user_role as enum ('student', 'pg_owner', 'admin');
create type listing_status as enum ('pending', 'published', 'rejected', 'archived');
create type accommodation_type as enum ('PG', 'Hostel', 'Shared Apartment');
create type gender_preference as enum ('Boys', 'Girls', 'Co-ed');
create type dietary_type as enum ('Pure Veg', 'Veg & Non-Veg');
create type service_type as enum ('Dine-in Mess', 'Tiffin & Delivery', 'Dine-in & Delivery');
create type notification_type as enum (
  'signup',
  'login',
  'listing_submitted',
  'listing_approved',
  'listing_rejected',
  'enquiry_created'
);

-- 3. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  role user_role not null default 'student',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for role lookup and searches
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- 4. ACCOMMODATION LISTINGS TABLE
create table if not exists public.accommodation_listings (
  id text primary key default ('pg_' || replace(gen_random_uuid()::text, '-', '')),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  tagline text not null default '',
  type accommodation_type not null default 'PG',
  gender gender_preference not null default 'Co-ed',
  area text not null,
  approximate_location text not null default '',
  nearest_landmark text not null default '',
  monthly_rent_from integer not null check (monthly_rent_from >= 0),
  security_deposit integer not null default 0 check (security_deposit >= 0),
  sharing_options text[] not null default '{}',
  amenities text[] not null default '{}',
  room_features text[] not null default '{}',
  house_rules text[] not null default '{}',
  food_option text not null default 'Optional / Available',
  notice_period_days integer not null default 30 check (notice_period_days >= 0),
  description text not null default '',
  sample_image text default '/hero-coast.png',
  images text[] not null default '{}',
  status listing_status not null default 'pending',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_acc_status on public.accommodation_listings(status);
create index if not exists idx_acc_owner on public.accommodation_listings(owner_id);
create index if not exists idx_acc_gender on public.accommodation_listings(gender);
create index if not exists idx_acc_area on public.accommodation_listings(area);

-- 5. MESS LISTINGS TABLE
create table if not exists public.mess_listings (
  id text primary key default ('mess_' || replace(gen_random_uuid()::text, '-', '')),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  tagline text not null default '',
  cuisine text not null default 'South Indian & Coastal',
  dietary dietary_type not null default 'Pure Veg',
  service_type service_type not null default 'Dine-in Mess',
  area text not null,
  approximate_location text not null default '',
  nearest_landmark text not null default '',
  monthly_price_from integer not null check (monthly_price_from >= 0),
  per_meal_price_from integer not null default 0 check (per_meal_price_from >= 0),
  meals_served text[] not null default '{}',
  meal_plans jsonb not null default '[]'::jsonb,
  daily_menu_sample jsonb not null default '{}'::jsonb,
  timings jsonb not null default '{}'::jsonb,
  highlights text[] not null default '{}',
  kitchen_features text[] not null default '{}',
  subscription_rules text[] not null default '{}',
  description text not null default '',
  sample_image text default '/mess-tiffin.jpg',
  images text[] not null default '{}',
  status listing_status not null default 'pending',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mess_status on public.mess_listings(status);
create index if not exists idx_mess_owner on public.mess_listings(owner_id);
create index if not exists idx_mess_dietary on public.mess_listings(dietary);
create index if not exists idx_mess_area on public.mess_listings(area);

-- 6. ADMIN NOTIFICATIONS TABLE
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  notification_type notification_type not null,
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id text,
  title text not null,
  message text not null,
  read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_notif_read on public.admin_notifications(read);
create index if not exists idx_admin_notif_created on public.admin_notifications(created_at desc);

-- 7. HELPER FUNCTIONS
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trigger_acc_updated_at
  before update on public.accommodation_listings
  for each row execute function public.handle_updated_at();

create trigger trigger_mess_updated_at
  before update on public.mess_listings
  for each row execute function public.handle_updated_at();

-- 8. AUTOMATED SIGNUP TRIGGER (Creates Profile + Admin Notification)
create or replace function public.handle_new_auth_user()
returns trigger as $$
declare
  v_role user_role;
  v_full_name text;
  v_phone text;
  v_role_str text;
begin
  v_role_str := coalesce(new.raw_user_meta_data->>'role', 'student');
  -- Security: Public self-registration permits only 'student' or 'pg_owner'.
  -- The 'admin' role can NEVER be self-assigned; it must be set manually by an administrator.
  if v_role_str = 'pg_owner' then
    v_role := 'pg_owner'::user_role;
  else
    v_role := 'student'::user_role;
  end if;

  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := coalesce(new.raw_user_meta_data->>'phone', '');

  -- Insert Profile
  insert into public.profiles (id, full_name, email, phone, role, metadata)
  values (
    new.id,
    v_full_name,
    new.email,
    v_phone,
    v_role,
    coalesce(new.raw_user_meta_data, '{}'::jsonb)
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = case when excluded.phone <> '' then excluded.phone else public.profiles.phone end,
    updated_at = now();

  -- Insert Admin Notification for every registration
  insert into public.admin_notifications (
    notification_type,
    user_id,
    title,
    message,
    metadata
  ) values (
    'signup',
    new.id,
    case when v_role = 'pg_owner' then 'New PG Owner Registered' else 'New Student Registered' end,
    case when v_role = 'pg_owner'
      then 'PG Owner ' || v_full_name || ' (' || new.email || ', ' || v_phone || ') signed up. Admin follow-up required.'
      else 'Student ' || v_full_name || ' (' || new.email || ') created an account.'
    end,
    jsonb_build_object('role', v_role, 'email', new.email, 'phone', v_phone)
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Prevent role escalation trigger on profiles
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if (old.role is distinct from new.role and not public.is_admin()) then
    raise exception 'Unauthorized: Only an administrator can modify account roles.';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trigger_prevent_role_escalation on public.profiles;
create trigger trigger_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- 9. LISTING SUBMISSION NOTIFICATION TRIGGERS
create or replace function public.handle_new_listing_submission()
returns trigger as $$
begin
  if (new.status = 'pending') then
    insert into public.admin_notifications (
      notification_type,
      user_id,
      listing_id,
      title,
      message,
      metadata
    ) values (
      'listing_submitted',
      new.owner_id,
      new.id,
      'New Accommodation Listing Submitted',
      'Property "' || new.name || '" in ' || new.area || ' was submitted for approval.',
      jsonb_build_object('listing_name', new.name, 'area', new.area, 'monthly_rent_from', new.monthly_rent_from)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_acc_submitted on public.accommodation_listings;
create trigger on_acc_submitted
  after insert on public.accommodation_listings
  for each row execute function public.handle_new_listing_submission();

-- Mess submission notification trigger
create or replace function public.handle_new_mess_submission()
returns trigger as $$
begin
  if (new.status = 'pending') then
    insert into public.admin_notifications (
      notification_type,
      user_id,
      listing_id,
      title,
      message,
      metadata
    ) values (
      'listing_submitted',
      new.owner_id,
      new.id,
      'New Mess Listing Submitted',
      'Mess "' || new.name || '" in ' || new.area || ' was submitted for approval.',
      jsonb_build_object('listing_name', new.name, 'area', new.area, 'monthly_price_from', new.monthly_price_from)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_mess_submitted on public.mess_listings;
create trigger on_mess_submitted
  after insert on public.mess_listings
  for each row execute function public.handle_new_mess_submission();

-- Log user login function (RPC called by authenticated user upon successful sign-in)
create or replace function public.log_user_login()
returns void as $$
declare
  v_user public.profiles%rowtype;
begin
  if auth.uid() is null then
    return;
  end if;

  select * into v_user from public.profiles where id = auth.uid();
  if not found then
    return;
  end if;

  insert into public.admin_notifications (
    notification_type,
    user_id,
    title,
    message,
    metadata
  ) values (
    'login',
    auth.uid(),
    case when v_user.role = 'pg_owner' then 'PG Owner Logged In' else 'Student Logged In' end,
    case when v_user.role = 'pg_owner'
      then 'PG Owner ' || v_user.full_name || ' (' || v_user.email || ') logged in.'
      else 'Student ' || v_user.full_name || ' (' || v_user.email || ') logged in.'
    end,
    jsonb_build_object('role', v_user.role, 'email', v_user.email)
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.accommodation_listings enable row level security;
alter table public.mess_listings enable row level security;
alter table public.admin_notifications enable row level security;

-- PROFILES POLICIES
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    -- Prevent non-admins from escalating their role
    (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()))
    or public.is_admin()
  );

-- ACCOMMODATION LISTINGS POLICIES
create policy "Public can view published listings and demo data"
  on public.accommodation_listings for select
  using (
    status = 'published'
    or is_demo = true
    or (auth.uid() is not null and owner_id = auth.uid())
    or public.is_admin()
  );

create policy "Authenticated users can submit pending listings"
  on public.accommodation_listings for insert
  with check (
    auth.uid() is not null
    and (owner_id = auth.uid() or public.is_admin())
    and (status = 'pending' or public.is_admin())
  );

create policy "Owners can update own pending or non-published listings"
  on public.accommodation_listings for update
  using (
    (auth.uid() is not null and owner_id = auth.uid())
    or public.is_admin()
  )
  with check (
    -- Non-admins cannot set status to published
    (public.is_admin())
    or (owner_id = auth.uid() and status in ('pending', 'rejected', 'archived'))
  );

create policy "Admins can delete accommodation listings"
  on public.accommodation_listings for delete
  using (public.is_admin());

-- MESS LISTINGS POLICIES
create policy "Public can view published mess listings and demo data"
  on public.mess_listings for select
  using (
    status = 'published'
    or is_demo = true
    or (auth.uid() is not null and owner_id = auth.uid())
    or public.is_admin()
  );

create policy "Authenticated owners can submit pending mess listings"
  on public.mess_listings for insert
  with check (
    auth.uid() is not null
    and (owner_id = auth.uid() or public.is_admin())
    and (status = 'pending' or public.is_admin())
  );

create policy "Owners can update own pending mess listings"
  on public.mess_listings for update
  using (
    (auth.uid() is not null and owner_id = auth.uid())
    or public.is_admin()
  )
  with check (
    (public.is_admin())
    or (owner_id = auth.uid() and status in ('pending', 'rejected', 'archived'))
  );

create policy "Admins can delete mess listings"
  on public.mess_listings for delete
  using (public.is_admin());

-- ADMIN NOTIFICATIONS POLICIES
create policy "Admins can view and manage notifications"
  on public.admin_notifications for all
  using (public.is_admin());
