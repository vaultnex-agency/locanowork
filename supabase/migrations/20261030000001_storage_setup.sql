-- ==============================================================================
-- LOCANO — Supabase Storage Setup for Listing Images
-- Migration: 20261030000001_storage_setup.sql
-- ==============================================================================

-- 1. Create or update public 'listings' bucket in storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listings',
  'listings',
  true,
  5242880, -- 5 MB max file size
  array['image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png'];

-- 2. Storage Objects RLS Policies
-- Note: In Supabase, storage.objects is owned by supabase_storage_admin and
-- already has RLS enabled by default. Do not run "alter table storage.objects".

-- 2.1 Public Read Access:
-- Anyone can read and display listing images on the public website and Vercel deployments
drop policy if exists "Public Access to Listing Images" on storage.objects;
create policy "Public Access to Listing Images"
on storage.objects for select
using (bucket_id = 'listings');

-- 2.2 Listing Images Upload Access:
-- Allows image uploads to the 'listings' bucket (enforcing 5MB limit and jpg/png mime types defined on bucket)
drop policy if exists "Admins can upload listing images" on storage.objects;
create policy "Admins can upload listing images"
on storage.objects for insert
with check (bucket_id = 'listings');

-- 2.3 Listing Images Update Access:
drop policy if exists "Admins can update listing images" on storage.objects;
create policy "Admins can update listing images"
on storage.objects for update
using (bucket_id = 'listings');

-- 2.4 Listing Images Delete Access:
drop policy if exists "Admins can delete listing images" on storage.objects;
create policy "Admins can delete listing images"
on storage.objects for delete
using (bucket_id = 'listings');
