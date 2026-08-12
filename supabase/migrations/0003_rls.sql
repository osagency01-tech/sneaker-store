-- ==================================================================== --
--  Row Level Security.
--  Principe : le public (anon) ne LIT que le catalogue actif. Il n'écrit
--  jamais directement commandes/paiements/stock — tout passe par le
--  service_role côté serveur (qui contourne le RLS). L'admin authentifié
--  a un accès complet en lecture/écriture via la table profiles.
-- ==================================================================== --

alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table product_variants enable row level security;
alter table customers        enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table payments         enable row level security;
alter table profiles         enable row level security;

-- Helper : l'utilisateur courant est-il admin ?
create or replace function is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- --- Catalogue : lecture publique du contenu actif ------------------
create policy "cat_public_read" on categories
  for select using (true);

create policy "prod_public_read" on products
  for select using (status = 'active' or is_admin());

create policy "img_public_read" on product_images
  for select using (
    exists (select 1 from products p
            where p.id = product_id and (p.status = 'active' or is_admin()))
  );

create policy "var_public_read" on product_variants
  for select using (
    exists (select 1 from products p
            where p.id = product_id and (p.status = 'active' or is_admin()))
  );

-- --- Admin : accès complet (write) sur le catalogue -----------------
create policy "cat_admin_all" on categories
  for all using (is_admin()) with check (is_admin());
create policy "prod_admin_all" on products
  for all using (is_admin()) with check (is_admin());
create policy "img_admin_all" on product_images
  for all using (is_admin()) with check (is_admin());
create policy "var_admin_all" on product_variants
  for all using (is_admin()) with check (is_admin());

-- --- Données sensibles : admin uniquement via RLS -------------------
-- (le serveur écrit avec service_role, qui ignore le RLS)
create policy "cust_admin_read" on customers
  for select using (is_admin());
create policy "order_admin_read" on orders
  for select using (is_admin());
create policy "item_admin_read" on order_items
  for select using (is_admin());
create policy "pay_admin_read" on payments
  for select using (is_admin());

-- --- Profils --------------------------------------------------------
create policy "profile_self_read" on profiles
  for select using (id = auth.uid());
