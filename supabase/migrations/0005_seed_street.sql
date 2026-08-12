-- ==================================================================== --
--  Seed enrichi — catégorie Street + modèles, 3 images par produit.
--  Idempotent (slugs uniques). Images de démo Unsplash ; à remplacer
--  par des visuels détourés dans Supabase Storage en production.
-- ==================================================================== --

insert into categories (name, slug) values ('Street', 'street')
on conflict (slug) do nothing;

-- ---- Nouveaux produits street --------------------------------------
with c as (select id from categories where slug = 'street')
insert into products (name, slug, brand, description, price, category_id, status)
select * from (values
  ('Spring Step', 'spring-step', 'Vantom',
   'Silhouette street audacieuse, semelle sculptée et coloris contrastés. Pensée pour la ville, taillée pour durer.',
   94900),
  ('L''Artiste', 'l-artiste', 'Vantom',
   'Un statement coloré. Empeigne technique multi-matières et amorti généreux pour tenir toute la journée.',
   119900),
  ('Flexus', 'flexus', 'Vantom',
   'Lignes fluides, tons crème et touches pastel. La sneaker street qui va avec tout.',
   99900)
) as v(name, slug, brand, description, price)
cross join c
on conflict (slug) do nothing;

-- Associer la catégorie street (au cas où la ligne existait déjà)
update products p set category_id = c.id
from categories c
where c.slug = 'street' and p.slug in ('spring-step','l-artiste','flexus');

-- ---- Variantes pour les nouveaux modèles ---------------------------
insert into product_variants (product_id, size, sku, stock)
select p.id, s.size, p.slug || '-' || s.size, s.stock
from products p
cross join (values
  ('40', 4), ('41', 6), ('42', 5), ('43', 5), ('44', 3), ('45', 2)
) as s(size, stock)
where p.slug in ('spring-step','l-artiste','flexus')
on conflict (product_id, size) do nothing;

-- ---- 3 images par produit (tous les produits) ----------------------
-- On nettoie d'abord les images de démo puis on réinsère 3 vues.
delete from product_images
where product_id in (select id from products);

-- Aero Court Low
insert into product_images (product_id, url, position)
select p.id, u.url, u.pos from products p
cross join (values
  ('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80', 0),
  ('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80', 1),
  ('https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80', 2)
) as u(url, pos)
where p.slug = 'aero-court-low';

-- Pulse Runner 2
insert into product_images (product_id, url, position)
select p.id, u.url, u.pos from products p
cross join (values
  ('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80', 0),
  ('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1000&q=80', 1),
  ('https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=1000&q=80', 2)
) as u(url, pos)
where p.slug = 'pulse-runner-2';

-- Rise Mid 84
insert into product_images (product_id, url, position)
select p.id, u.url, u.pos from products p
cross join (values
  ('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80', 0),
  ('https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80', 1),
  ('https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80', 2)
) as u(url, pos)
where p.slug = 'rise-mid-84';

-- Spring Step
insert into product_images (product_id, url, position)
select p.id, u.url, u.pos from products p
cross join (values
  ('https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1000&q=80', 0),
  ('https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80', 1),
  ('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80', 2)
) as u(url, pos)
where p.slug = 'spring-step';

-- L'Artiste
insert into product_images (product_id, url, position)
select p.id, u.url, u.pos from products p
cross join (values
  ('https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&q=80', 0),
  ('https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=1000&q=80', 1),
  ('https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1000&q=80', 2)
) as u(url, pos)
where p.slug = 'l-artiste';

-- Flexus
insert into product_images (product_id, url, position)
select p.id, u.url, u.pos from products p
cross join (values
  ('https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=1000&q=80', 0),
  ('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1000&q=80', 1),
  ('https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1000&q=80', 2)
) as u(url, pos)
where p.slug = 'flexus';
