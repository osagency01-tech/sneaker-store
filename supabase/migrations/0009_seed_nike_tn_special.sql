-- ==================================================================== --
--  Nike Tn Spécial — 25 coloris, prix promo (21 500 FCFA, barré 25 000).
--  NOTE: déjà appliquée en base via scripts/seed-tn-special.mjs +
--  scripts/import-product-image.mjs (images réelles détourées uploadées
--  sur Supabase Storage). Ce fichier documente l'état final pour
--  permettre de reconstituer la table sur une base vierge.
--  Idempotent via slug / on-conflict.
-- ==================================================================== --

with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, compare_at_price, category_id, status)
select 'Tn Spécial', 'nike-tn-special', 'Nike', 'Nike Tn Spécial', 21500, 25000, c.id, 'active'
from c on conflict (slug) do update
  set price = excluded.price, compare_at_price = excluded.compare_at_price, status = 'active';

insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/doernbecher.png', 0 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/bleached-aqua.png', 1 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/hyper-blue-og.png', 2 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/sunset-og.png', 3 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/voltage-purple.png', 4 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/tiger.png', 5 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/25th-anniversary.png', 6 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/paris.png', 7 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/tiffany.png', 8 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/black-flames.png', 9 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/eclair-lightning.png', 10 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/aqua.png', 11 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/sky-blue.png', 12 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/grape.png', 13 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/rainbow.png', 14 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/volt.png', 15 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/atomic-pink.png', 16 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/team-orange.png', 17 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/pure-platinum.png', 18 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/triple-black.png', 19 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/white-tiger.png', 20 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/hyper-jade.png', 21 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/university-red.png', 22 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/sunset-pulse.png', 23 from products p where p.slug = 'nike-tn-special';
insert into product_images (product_id, url, position)
select p.id, 'https://raafgxuwmamaovqnqopz.supabase.co/storage/v1/object/public/product-images/nike-tn-special/laser-blue.png', 24 from products p where p.slug = 'nike-tn-special';

insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-tn-special-38', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-tn-special-39', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-tn-special-40', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-tn-special-41', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-tn-special-42', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-tn-special-43', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-tn-special-44', 10 from products p where p.slug = 'nike-tn-special'
on conflict (product_id, size) do nothing;
