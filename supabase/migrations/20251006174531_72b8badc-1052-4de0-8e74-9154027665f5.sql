-- Ensure upsert on name works by adding a unique constraint
ALTER TABLE public.logo_items
ADD CONSTRAINT logo_items_name_key UNIQUE (name);