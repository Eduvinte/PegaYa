-- Storage policies for bucket: file
-- Path convention used by app: <folder>/<user_id>/<filename>
-- Example: avatars/<auth.uid()>/photo.png, cv/<auth.uid()>/cv.pdf

-- Ensure bucket exists (safe if already created manually).
insert into storage.buckets (id, name, public)
values ('file', 'file', true)
on conflict (id) do nothing;

-- Read: allow any authenticated user to read files from this bucket.
drop policy if exists "file: read objects" on storage.objects;
create policy "file: read objects"
on storage.objects
for select
to authenticated
using (bucket_id = 'file');

-- Upload: user can only upload into their own user folder.
drop policy if exists "file: insert own folder" on storage.objects;
create policy "file: insert own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'file'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Update: user can only update objects in their own folder.
drop policy if exists "file: update own folder" on storage.objects;
create policy "file: update own folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'file'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'file'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Delete: user can only delete objects in their own folder.
drop policy if exists "file: delete own folder" on storage.objects;
create policy "file: delete own folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'file'
  and (storage.foldername(name))[2] = auth.uid()::text
);
