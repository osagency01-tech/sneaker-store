-- ==================================================================== --
--  Tunnel de conversion — suivi anonyme par session (cookie technique,
--  aucune donnée personnelle). Écriture exclusivement via service_role
--  (route API /api/track), lecture réservée à l'admin.
-- ==================================================================== --

create table analytics_events (
  id          bigint generated always as identity primary key,
  session_id  text not null,
  event_type  text not null check (event_type in (
                'PAGE_VIEW', 'PRODUCT_VIEW', 'ADD_TO_CART', 'BEGIN_CHECKOUT', 'PURCHASE'
              )),
  product_id  uuid references products(id) on delete set null,
  path        text,
  created_at  timestamptz not null default now()
);

create index analytics_events_created_at_idx on analytics_events (created_at desc);
create index analytics_events_session_idx on analytics_events (session_id, created_at desc);
create index analytics_events_type_idx on analytics_events (event_type, created_at desc);

alter table analytics_events enable row level security;

-- Aucune policy publique : seules les routes serveur (service_role, qui
-- contourne le RLS) écrivent, et seul l'admin lit ses propres analyses.
create policy "analytics_admin_read" on analytics_events
  for select using (is_admin());
