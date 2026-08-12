-- ==================================================================== --
--  Données de démonstration. Images = placeholders Unsplash (à remplacer
--  par des uploads Supabase Storage en prod). Idempotent via slugs.
-- ==================================================================== --

insert into categories (name, slug) values
  ('Running', 'running'),
  ('Lifestyle', 'lifestyle'),
  ('Basketball', 'basketball')
on conflict (slug) do nothing;

-- Produit 1
with c as (select id from categories where slug = 'lifestyle')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Aero Court Low', 'aero-court-low', 'Vantom',
  'Silhouette basse épurée, tige en cuir grainé et semelle crantée légère. Un classique lifestyle qui se porte partout.',
  49900, c.id, 'active'
from c
on conflict (slug) do nothing;

-- Produit 2
with c as (select id from categories where slug = 'running')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Pulse Runner 2', 'pulse-runner-2', 'Vantom',
  'Amorti réactif pour la route, mesh respirant et maintien précis. Pensée pour les kilomètres quotidiens.',
  64900, c.id, 'active'
from c
on conflict (slug) do nothing;

-- Produit 3
with c as (select id from categories where slug = 'basketball')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Rise Mid 84', 'rise-mid-84', 'Vantom',
  'Tige montante, rembourrage à la cheville et adhérence agressive. Un hommage au basket des années 80.',
  74900, c.id, 'active'
from c
on conflict (slug) do nothing;

-- Images
insert into product_images (product_id, url, position)
select p.id, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80', 0
from products p where p.slug = 'aero-court-low'
on conflict do nothing;
insert into product_images (product_id, url, position)
select p.id, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80', 0
from products p where p.slug = 'pulse-runner-2'
on conflict do nothing;
insert into product_images (product_id, url, position)
select p.id, 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1200&q=80', 0
from products p where p.slug = 'rise-mid-84'
on conflict do nothing;

-- Variantes (pointures 40-45) pour chaque produit
insert into product_variants (product_id, size, sku, stock)
select p.id, s.size, p.slug || '-' || s.size, s.stock
from products p
cross join (values
  ('40', 3), ('41', 5), ('42', 4), ('43', 6), ('44', 2), ('45', 0)
) as s(size, stock)
where p.slug in ('aero-court-low','pulse-runner-2','rise-mid-84')
on conflict (product_id, size) do nothing;
