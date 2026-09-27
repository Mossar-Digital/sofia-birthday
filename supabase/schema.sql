-- ════════════════════════════════════════════════════════════════════
--  Cadeau d'anniversaire — schéma Supabase
--  À coller dans : Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Table de configuration ───────────────────────────────────────
-- Une seule ligne (id = 1) qui contient tout le contenu du site en JSON.
create table if not exists public.site_config (
  id         integer primary key default 1,
  data       jsonb   not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  -- Verrou : empêche l'insertion d'une deuxième ligne par erreur.
  constraint site_config_single_row check (id = 1)
);

insert into public.site_config (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- ── 2. Sécurité au niveau des lignes ────────────────────────────────
alter table public.site_config enable row level security;

-- Lecture publique : la page d'accueil est rendue côté serveur avec la
-- clé anon. Le mot de passe est retiré du JSON avant l'envoi au
-- navigateur (voir src/lib/store.ts → toPublicConfig).
drop policy if exists "site_config lecture publique" on public.site_config;
create policy "site_config lecture publique"
  on public.site_config
  for select
  using (true);

-- Écriture : réservée à la clé service_role, utilisée uniquement par les
-- routes d'API protégées par ADMIN_SECRET_KEY.
--
-- Si vous NE renseignez PAS SUPABASE_SERVICE_ROLE_KEY, décommentez la
-- politique ci-dessous pour autoriser l'écriture avec la clé anon.
-- L'accès au studio reste protégé par ADMIN_SECRET_KEY, mais la clé anon
-- étant publique, quelqu'un qui la récupère pourrait écrire dans la table.
-- La clé service_role est nettement préférable.
--
-- drop policy if exists "site_config ecriture anon" on public.site_config;
-- create policy "site_config ecriture anon"
--   on public.site_config
--   for all
--   using (true)
--   with check (true);

-- ── 3. Buckets de stockage ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do update set public = true;

-- ── 4. Politiques de stockage ───────────────────────────────────────
-- Lecture publique : indispensable, les <img> et <audio> de Sofia
-- chargent ces fichiers sans authentification.
drop policy if exists "medias lecture publique" on storage.objects;
create policy "medias lecture publique"
  on storage.objects
  for select
  using (bucket_id in ('photos', 'audio'));

-- Téléversement : le studio envoie les fichiers directement depuis le
-- navigateur avec la clé anon, ce qui contourne la limite de 4,5 Mo des
-- fonctions serverless. Cela implique d'autoriser l'insertion en anon.
drop policy if exists "medias televersement" on storage.objects;
create policy "medias televersement"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id in ('photos', 'audio'));

-- Remplacement d'un fichier existant (même nom).
drop policy if exists "medias mise a jour" on storage.objects;
create policy "medias mise a jour"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id in ('photos', 'audio'))
  with check (bucket_id in ('photos', 'audio'));

-- ── Vérification ────────────────────────────────────────────────────
-- select id, jsonb_pretty(data), updated_at from public.site_config;
