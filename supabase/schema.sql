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

-- AUCUNE politique n'est créée ici, volontairement : avec RLS actif et
-- zéro politique, la table est fermée à tous les rôles publics.
--
-- La table contient le mot de passe de Sofia en clair. La clé anon est
-- publique — elle est livrée dans le JavaScript de la page. Lui donner
-- le droit de lecture reviendrait à publier ce mot de passe ; lui donner
-- le droit d'écriture permettrait à quiconque de réécrire le cadeau.
--
-- Seule la clé service_role accède donc à cette table. Elle contourne
-- RLS par conception, reste côté serveur, et n'est employée que par les
-- routes d'API protégées par ADMIN_SECRET_KEY.
--
-- ⚠ SUPABASE_SERVICE_ROLE_KEY est donc OBLIGATOIRE dès que Supabase est
--   configuré. Sans elle, l'application basculera sur son repli local.

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
