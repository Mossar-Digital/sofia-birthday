-- ════════════════════════════════════════════════════════════════════
--  Durcissement de site_config
--
--  À exécuter APRÈS avoir renseigné SUPABASE_SERVICE_ROLE_KEY dans
--  .env.local (et dans Vercel) et redémarré le serveur.
--
--  Pourquoi : la clé anon est publique — elle est livrée dans le
--  JavaScript de la page. Tant que la table accepte la lecture ou
--  l'écriture en anon, n'importe qui peut lire le mot de passe de
--  Sofia en clair, ou réécrire tout le contenu du cadeau.
--
--  Après ce script, seule la clé service_role touche la table. Elle
--  n'est utilisée que côté serveur, dans les routes protégées par
--  ADMIN_SECRET_KEY, et n'atteint jamais le navigateur.
-- ════════════════════════════════════════════════════════════════════

-- 1. Retire tout accès anon à la table.
drop policy if exists "site_config lecture publique" on public.site_config;
drop policy if exists "site_config ecriture anon"    on public.site_config;

-- 2. RLS reste actif, sans aucune politique : tout rôle public est
--    refusé. La clé service_role contourne RLS par conception.
alter table public.site_config enable row level security;

-- ── Vérification ────────────────────────────────────────────────────
-- Doit renvoyer zéro ligne :
--   select polname from pg_policy
--   where polrelid = 'public.site_config'::regclass;
--
-- Puis, avec la clé anon, ceci doit répondre 401/403 ou [] :
--   curl "$URL/rest/v1/site_config?select=data" \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
