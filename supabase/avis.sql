-- ─────────────────────────────────────────────────────────────
--  Avis clientes — schéma Supabase
--  Glam Dress by HBR
--
--  À appliquer dans Supabase → SQL Editor → New query → Run.
--  Rien n'est publié automatiquement : un avis déposé arrive avec
--  le statut « en_attente » et n'est visible du public qu'après
--  passage à « publie » par la boutique.
--
--  Ce fichier n'est PAS exécuté par le site : c'est le schéma de
--  référence, à jouer une fois quand le projet Supabase sera créé.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

create table if not exists public.avis (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- Contenu
  prenom       text not null check (char_length(btrim(prenom)) between 1 and 60),
  occasion     text          check (char_length(occasion) <= 80),
  texte        text not null check (char_length(btrim(texte)) between 20 and 800),
  note         smallint      check (note between 1 and 5),

  -- Preuve de consentement : sans cette case cochée, l'avis est refusé
  -- par la base elle-même (voir la policy d'insertion).
  consentement boolean not null default false,

  -- Modération
  statut       text not null default 'en_attente'
               check (statut in ('en_attente', 'publie', 'refuse')),
  publie_le    timestamptz,
  modere_par   text,

  -- Anti-spam : on ne stocke JAMAIS l'adresse IP en clair, seulement
  -- une empreinte salée, utile pour repérer un envoi en série.
  ip_hash      text
);

create index if not exists avis_statut_idx on public.avis (statut, created_at desc);
create index if not exists avis_publies_idx on public.avis (publie_le desc) where statut = 'publie';

-- Date de publication renseignée automatiquement au passage en « publie »
create or replace function public.avis_set_publie_le()
returns trigger
language plpgsql
as $$
begin
  if new.statut = 'publie' and (old.statut is distinct from 'publie') then
    new.publie_le := now();
  elsif new.statut <> 'publie' then
    new.publie_le := null;
  end if;
  return new;
end;
$$;

drop trigger if exists avis_publie_le on public.avis;
create trigger avis_publie_le
  before insert or update on public.avis
  for each row execute function public.avis_set_publie_le();

-- ── Sécurité (RLS) ───────────────────────────────────────────
alter table public.avis enable row level security;

-- 1. Le public ne lit QUE les avis publiés et consentis.
drop policy if exists "lecture des avis publies" on public.avis;
create policy "lecture des avis publies"
  on public.avis for select
  to anon, authenticated
  using (statut = 'publie' and consentement = true);

-- 2. Le public peut déposer un avis, mais :
--      · consentement obligatoire
--      · statut forcé à « en_attente » (impossible de s'auto-publier)
drop policy if exists "depot d un avis avec consentement" on public.avis;
create policy "depot d un avis avec consentement"
  on public.avis for insert
  to anon, authenticated
  with check (consentement = true and statut = 'en_attente');

-- 3. Aucune policy de mise à jour ni de suppression pour anon :
--    seule la boutique (service_role, ou le tableau de bord Supabase)
--    peut modérer. Le site n'a pas les moyens de publier lui-même.

-- ── Modération ───────────────────────────────────────────────
-- Le plus simple, sans rien coder : Supabase → Table editor → avis,
-- puis passer « statut » à « publie » ou « refuse ».
--
-- En SQL :
--   update public.avis set statut = 'publie', modere_par = 'boutique'
--   where id = '…';
--
-- ── Lecture côté site ────────────────────────────────────────
-- GET /rest/v1/avis?select=prenom,occasion,texte,note,publie_le&order=publie_le.desc
-- avec l'en-tête apikey = clé « anon » (publique par nature).
-- La RLS garantit qu'aucun avis non publié ne remonte.
