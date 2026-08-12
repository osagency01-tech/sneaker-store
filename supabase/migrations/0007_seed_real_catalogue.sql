-- ==================================================================== --
--  SEED CATALOGUE RÉEL — 36 modèles (généré depuis l'Excel).
--  Remplace les données de démo. Idempotent via slugs.
--  Images = placeholders ; à remplacer par Supabase Storage.
-- ==================================================================== --

-- Purge des données de démo précédentes (produits seed)
delete from products where slug in (
  'aero-court-low', 'pulse-runner-2', 'rise-mid-84', 'spring-step', 'l-artiste', 'flexus'
);

-- Catégories
insert into categories (name, slug) values
  ('Sneakers', 'sneakers'),
  ('Boots', 'boots'),
  ('Designer', 'designer')
on conflict (slug) do nothing;

-- Produits
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Force 1 Low', 'nike-air-force-1-low', 'Nike', 'Nike Air Force 1 Low', 16000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Dunk Low', 'nike-dunk-low', 'Nike', 'Nike Dunk Low', 18500, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Max 90', 'nike-air-max-90', 'Nike', 'Nike Air Max 90', 23000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Max 95', 'nike-air-max-95', 'Nike', 'Nike Air Max 95', 25000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Max 97', 'nike-air-max-97', 'Nike', 'Nike Air Max 97', 25000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Max Plus / TN', 'nike-air-max-plus---tn', 'Nike', 'Nike Air Max Plus / TN', 23000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'P-6000', 'nike-p-6000', 'Nike', 'Nike P-6000', 18000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Vomero 5', 'nike-vomero-5', 'Nike', 'Nike Vomero 5', 18000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Jordan 1 Low', 'jordan-air-jordan-1-low', 'Jordan', 'Jordan Air Jordan 1 Low', 20000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Jordan 1 Mid', 'jordan-air-jordan-1-mid', 'Jordan', 'Jordan Air Jordan 1 Mid', 23000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Jordan 4', 'jordan-air-jordan-4', 'Jordan', 'Jordan Air Jordan 4', 25000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Air Jordan 3', 'jordan-air-jordan-3', 'Jordan', 'Jordan Air Jordan 3', 28000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Samba OG', 'adidas-samba-og', 'Adidas', 'Adidas Samba OG', 20000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Campus 00s', 'adidas-campus-00s', 'Adidas', 'Adidas Campus 00s', 18000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Gazelle', 'adidas-gazelle', 'Adidas', 'Adidas Gazelle', 20000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Superstar', 'adidas-superstar', 'Adidas', 'Adidas Superstar', 16000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select '530', 'new-balance-530', 'New Balance', 'New Balance 530', 17000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select '550', 'new-balance-550', 'New Balance', 'New Balance 550', 19000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select '9060', 'new-balance-9060', 'New Balance', 'New Balance 9060', 25000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select '2002R', 'new-balance-2002r', 'New Balance', 'New Balance 2002R', 22000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'GEL-1130', 'asics-gel-1130', 'ASICS', 'ASICS GEL-1130', 18000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'GEL-Kayano 14', 'asics-gel-kayano-14', 'ASICS', 'ASICS GEL-Kayano 14', 20000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'GEL-NYC', 'asics-gel-nyc', 'ASICS', 'ASICS GEL-NYC', 20000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Suede Classic', 'puma-suede-classic', 'Puma', 'Puma Suede Classic', 16000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Palermo', 'puma-palermo', 'Puma', 'Puma Palermo', 17000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Chuck Taylor All Star', 'converse-chuck-taylor-all-star', 'Converse', 'Converse Chuck Taylor All Star', 18000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'boots')
insert into products (name, slug, brand, description, price, category_id, status)
select '6-Inch Premium Boot', 'timberland-6-inch-premium-boot', 'Timberland', 'Timberland 6-Inch Premium Boot', 35000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'boots')
insert into products (name, slug, brand, description, price, category_id, status)
select '6-Inch Waterproof', 'timberland-6-inch-waterproof', 'Timberland', 'Timberland 6-Inch Waterproof', 38000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'designer')
insert into products (name, slug, brand, description, price, category_id, status)
select 'DRKSHDW', 'rick-owens-drkshdw', 'Rick Owens', 'Rick Owens DRKSHDW', 35000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'designer')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Geobasket', 'rick-owens-geobasket', 'Rick Owens', 'Rick Owens Geobasket', 40000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'designer')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Abstract', 'rick-owens-abstract', 'Rick Owens', 'Rick Owens Abstract', 65000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'designer')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Track', 'balenciaga-track', 'Balenciaga', 'Balenciaga Track', 27000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'designer')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Track LED / Light-up', 'balenciaga-track-led---light-up', 'Balenciaga', 'Balenciaga Track LED / Light-up', 35000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'designer')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Triple S', 'balenciaga-triple-s', 'Balenciaga', 'Balenciaga Triple S', 25000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Blazer Mid', 'nike-blazer-mid', 'Nike', 'Nike Blazer Mid', 23000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';
with c as (select id from categories where slug = 'sneakers')
insert into products (name, slug, brand, description, price, category_id, status)
select 'Cortez', 'nike-cortez', 'Nike', 'Nike Cortez', 20000, c.id, 'active'
from c on conflict (slug) do update set price = excluded.price, status = 'active';

-- Images (une par coloris)
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-force-1-low+triple-white', 0 from products p where p.slug = 'nike-air-force-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-force-1-low+triple-black', 1 from products p where p.slug = 'nike-air-force-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-force-1-low+white-black', 2 from products p where p.slug = 'nike-air-force-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-force-1-low+white-red', 3 from products p where p.slug = 'nike-air-force-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-force-1-low+white-green', 4 from products p where p.slug = 'nike-air-force-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+dunk-low+panda', 0 from products p where p.slug = 'nike-dunk-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+dunk-low+grey-fog', 1 from products p where p.slug = 'nike-dunk-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+dunk-low+university-blue', 2 from products p where p.slug = 'nike-dunk-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+dunk-low+black-white', 3 from products p where p.slug = 'nike-dunk-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+dunk-low+red-white', 4 from products p where p.slug = 'nike-dunk-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-90+triple-white', 0 from products p where p.slug = 'nike-air-max-90';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-90+black-white', 1 from products p where p.slug = 'nike-air-max-90';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-90+grey', 2 from products p where p.slug = 'nike-air-max-90';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-90+beige', 3 from products p where p.slug = 'nike-air-max-90';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-90+red-white', 4 from products p where p.slug = 'nike-air-max-90';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-95+black-white', 0 from products p where p.slug = 'nike-air-max-95';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-95+triple-black', 1 from products p where p.slug = 'nike-air-max-95';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-95+grey', 2 from products p where p.slug = 'nike-air-max-95';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-95+white-red', 3 from products p where p.slug = 'nike-air-max-95';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-95+black-green', 4 from products p where p.slug = 'nike-air-max-95';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-97+silver-bullet', 0 from products p where p.slug = 'nike-air-max-97';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-97+triple-black', 1 from products p where p.slug = 'nike-air-max-97';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-97+triple-white', 2 from products p where p.slug = 'nike-air-max-97';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-97+gold', 3 from products p where p.slug = 'nike-air-max-97';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-97+red-black', 4 from products p where p.slug = 'nike-air-max-97';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+triple-black', 0 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+triple-white', 1 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+black-red', 2 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+black-blue', 3 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+black-green', 4 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+white-blue', 5 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+grey-orange', 6 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+air-max-plus---tn+volt', 7 from products p where p.slug = 'nike-air-max-plus---tn';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+p-6000+white-silver', 0 from products p where p.slug = 'nike-p-6000';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+p-6000+triple-white', 1 from products p where p.slug = 'nike-p-6000';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+p-6000+black-silver', 2 from products p where p.slug = 'nike-p-6000';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+p-6000+beige', 3 from products p where p.slug = 'nike-p-6000';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+p-6000+grey', 4 from products p where p.slug = 'nike-p-6000';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+vomero-5+cream', 0 from products p where p.slug = 'nike-vomero-5';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+vomero-5+white-silver', 1 from products p where p.slug = 'nike-vomero-5';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+vomero-5+black', 2 from products p where p.slug = 'nike-vomero-5';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+vomero-5+grey', 3 from products p where p.slug = 'nike-vomero-5';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+vomero-5+beige', 4 from products p where p.slug = 'nike-vomero-5';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+vomero-5+black-white', 5 from products p where p.slug = 'nike-vomero-5';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-low+triple-white', 0 from products p where p.slug = 'jordan-air-jordan-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-low+black-white', 1 from products p where p.slug = 'jordan-air-jordan-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-low+black-red', 2 from products p where p.slug = 'jordan-air-jordan-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-low+university-blue', 3 from products p where p.slug = 'jordan-air-jordan-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-low+green-white', 4 from products p where p.slug = 'jordan-air-jordan-1-low';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-mid+chicago', 0 from products p where p.slug = 'jordan-air-jordan-1-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-mid+black-white', 1 from products p where p.slug = 'jordan-air-jordan-1-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-mid+triple-black', 2 from products p where p.slug = 'jordan-air-jordan-1-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-mid+university-blue', 3 from products p where p.slug = 'jordan-air-jordan-1-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-1-mid+red-black', 4 from products p where p.slug = 'jordan-air-jordan-1-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-4+military-black', 0 from products p where p.slug = 'jordan-air-jordan-4';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-4+bred', 1 from products p where p.slug = 'jordan-air-jordan-4';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-4+white-cement', 2 from products p where p.slug = 'jordan-air-jordan-4';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-4+military-blue', 3 from products p where p.slug = 'jordan-air-jordan-4';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-4+black-cat', 4 from products p where p.slug = 'jordan-air-jordan-4';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-4+red-cement', 5 from products p where p.slug = 'jordan-air-jordan-4';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-3+white-cement', 0 from products p where p.slug = 'jordan-air-jordan-3';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-3+black-cement', 1 from products p where p.slug = 'jordan-air-jordan-3';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-3+white-red', 2 from products p where p.slug = 'jordan-air-jordan-3';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=jordan+air-jordan-3+black-gold', 3 from products p where p.slug = 'jordan-air-jordan-3';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+samba-og+white-black', 0 from products p where p.slug = 'adidas-samba-og';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+samba-og+black-white', 1 from products p where p.slug = 'adidas-samba-og';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+samba-og+green-white', 2 from products p where p.slug = 'adidas-samba-og';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+samba-og+red-white', 3 from products p where p.slug = 'adidas-samba-og';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+samba-og+blue-white', 4 from products p where p.slug = 'adidas-samba-og';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+samba-og+beige', 5 from products p where p.slug = 'adidas-samba-og';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+campus-00s+black-white', 0 from products p where p.slug = 'adidas-campus-00s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+campus-00s+grey', 1 from products p where p.slug = 'adidas-campus-00s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+campus-00s+green', 2 from products p where p.slug = 'adidas-campus-00s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+campus-00s+blue', 3 from products p where p.slug = 'adidas-campus-00s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+campus-00s+beige', 4 from products p where p.slug = 'adidas-campus-00s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+campus-00s+brown', 5 from products p where p.slug = 'adidas-campus-00s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+gazelle+black-white', 0 from products p where p.slug = 'adidas-gazelle';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+gazelle+red-white', 1 from products p where p.slug = 'adidas-gazelle';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+gazelle+green-white', 2 from products p where p.slug = 'adidas-gazelle';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+gazelle+blue-white', 3 from products p where p.slug = 'adidas-gazelle';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+gazelle+pink', 4 from products p where p.slug = 'adidas-gazelle';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+gazelle+beige', 5 from products p where p.slug = 'adidas-gazelle';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+superstar+white-black', 0 from products p where p.slug = 'adidas-superstar';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+superstar+triple-white', 1 from products p where p.slug = 'adidas-superstar';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+superstar+triple-black', 2 from products p where p.slug = 'adidas-superstar';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=adidas+superstar+white-red', 3 from products p where p.slug = 'adidas-superstar';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+530+white-silver', 0 from products p where p.slug = 'new-balance-530';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+530+beige', 1 from products p where p.slug = 'new-balance-530';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+530+grey', 2 from products p where p.slug = 'new-balance-530';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+530+black', 3 from products p where p.slug = 'new-balance-530';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+530+navy', 4 from products p where p.slug = 'new-balance-530';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+530+white-blue', 5 from products p where p.slug = 'new-balance-530';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+550+white-green', 0 from products p where p.slug = 'new-balance-550';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+550+white-grey', 1 from products p where p.slug = 'new-balance-550';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+550+white-red', 2 from products p where p.slug = 'new-balance-550';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+550+white-blue', 3 from products p where p.slug = 'new-balance-550';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+550+black-white', 4 from products p where p.slug = 'new-balance-550';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+9060+grey', 0 from products p where p.slug = 'new-balance-9060';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+9060+black', 1 from products p where p.slug = 'new-balance-9060';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+9060+white', 2 from products p where p.slug = 'new-balance-9060';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+9060+beige', 3 from products p where p.slug = 'new-balance-9060';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+9060+green', 4 from products p where p.slug = 'new-balance-9060';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+9060+cream', 5 from products p where p.slug = 'new-balance-9060';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+2002r+grey', 0 from products p where p.slug = 'new-balance-2002r';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+2002r+black', 1 from products p where p.slug = 'new-balance-2002r';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+2002r+beige', 2 from products p where p.slug = 'new-balance-2002r';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+2002r+cream', 3 from products p where p.slug = 'new-balance-2002r';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=new-balance+2002r+green', 4 from products p where p.slug = 'new-balance-2002r';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-1130+white-silver', 0 from products p where p.slug = 'asics-gel-1130';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-1130+triple-white', 1 from products p where p.slug = 'asics-gel-1130';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-1130+black', 2 from products p where p.slug = 'asics-gel-1130';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-1130+beige', 3 from products p where p.slug = 'asics-gel-1130';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-1130+grey', 4 from products p where p.slug = 'asics-gel-1130';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-1130+blue', 5 from products p where p.slug = 'asics-gel-1130';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-kayano-14+silver', 0 from products p where p.slug = 'asics-gel-kayano-14';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-kayano-14+white', 1 from products p where p.slug = 'asics-gel-kayano-14';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-kayano-14+black', 2 from products p where p.slug = 'asics-gel-kayano-14';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-kayano-14+cream', 3 from products p where p.slug = 'asics-gel-kayano-14';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-kayano-14+beige', 4 from products p where p.slug = 'asics-gel-kayano-14';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-kayano-14+green', 5 from products p where p.slug = 'asics-gel-kayano-14';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-nyc+cream', 0 from products p where p.slug = 'asics-gel-nyc';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-nyc+grey', 1 from products p where p.slug = 'asics-gel-nyc';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-nyc+black', 2 from products p where p.slug = 'asics-gel-nyc';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-nyc+white-silver', 3 from products p where p.slug = 'asics-gel-nyc';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=asics+gel-nyc+beige', 4 from products p where p.slug = 'asics-gel-nyc';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+suede-classic+black-white', 0 from products p where p.slug = 'puma-suede-classic';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+suede-classic+red-white', 1 from products p where p.slug = 'puma-suede-classic';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+suede-classic+green-white', 2 from products p where p.slug = 'puma-suede-classic';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+suede-classic+blue-white', 3 from products p where p.slug = 'puma-suede-classic';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+suede-classic+beige', 4 from products p where p.slug = 'puma-suede-classic';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+palermo+white-green', 0 from products p where p.slug = 'puma-palermo';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+palermo+white-blue', 1 from products p where p.slug = 'puma-palermo';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+palermo+white-red', 2 from products p where p.slug = 'puma-palermo';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+palermo+black-white', 3 from products p where p.slug = 'puma-palermo';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=puma+palermo+beige', 4 from products p where p.slug = 'puma-palermo';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=converse+chuck-taylor-all-star+black', 0 from products p where p.slug = 'converse-chuck-taylor-all-star';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=converse+chuck-taylor-all-star+white', 1 from products p where p.slug = 'converse-chuck-taylor-all-star';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=converse+chuck-taylor-all-star+cream', 2 from products p where p.slug = 'converse-chuck-taylor-all-star';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=converse+chuck-taylor-all-star+red', 3 from products p where p.slug = 'converse-chuck-taylor-all-star';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=converse+chuck-taylor-all-star+navy', 4 from products p where p.slug = 'converse-chuck-taylor-all-star';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=converse+chuck-taylor-all-star+green', 5 from products p where p.slug = 'converse-chuck-taylor-all-star';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-premium-boot+wheat', 0 from products p where p.slug = 'timberland-6-inch-premium-boot';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-premium-boot+black', 1 from products p where p.slug = 'timberland-6-inch-premium-boot';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-premium-boot+brown', 2 from products p where p.slug = 'timberland-6-inch-premium-boot';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-premium-boot+dark-brown', 3 from products p where p.slug = 'timberland-6-inch-premium-boot';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-premium-boot+beige', 4 from products p where p.slug = 'timberland-6-inch-premium-boot';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-waterproof+wheat', 0 from products p where p.slug = 'timberland-6-inch-waterproof';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-waterproof+black', 1 from products p where p.slug = 'timberland-6-inch-waterproof';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-waterproof+brown', 2 from products p where p.slug = 'timberland-6-inch-waterproof';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=timberland+6-inch-waterproof+dark-brown', 3 from products p where p.slug = 'timberland-6-inch-waterproof';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+drkshdw+black', 0 from products p where p.slug = 'rick-owens-drkshdw';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+drkshdw+white', 1 from products p where p.slug = 'rick-owens-drkshdw';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+drkshdw+grey', 2 from products p where p.slug = 'rick-owens-drkshdw';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+drkshdw+cream', 3 from products p where p.slug = 'rick-owens-drkshdw';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+geobasket+black-white', 0 from products p where p.slug = 'rick-owens-geobasket';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+geobasket+black-black', 1 from products p where p.slug = 'rick-owens-geobasket';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+geobasket+white', 2 from products p where p.slug = 'rick-owens-geobasket';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+geobasket+cream', 3 from products p where p.slug = 'rick-owens-geobasket';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+abstract+black', 0 from products p where p.slug = 'rick-owens-abstract';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+abstract+white', 1 from products p where p.slug = 'rick-owens-abstract';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+abstract+cream', 2 from products p where p.slug = 'rick-owens-abstract';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=rick-owens+abstract+grey', 3 from products p where p.slug = 'rick-owens-abstract';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track+triple-black', 0 from products p where p.slug = 'balenciaga-track';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track+triple-white', 1 from products p where p.slug = 'balenciaga-track';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track+grey', 2 from products p where p.slug = 'balenciaga-track';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track+beige', 3 from products p where p.slug = 'balenciaga-track';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track+black-red', 4 from products p where p.slug = 'balenciaga-track';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track+white-blue', 5 from products p where p.slug = 'balenciaga-track';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track-led---light-up+black', 0 from products p where p.slug = 'balenciaga-track-led---light-up';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track-led---light-up+white', 1 from products p where p.slug = 'balenciaga-track-led---light-up';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track-led---light-up+grey', 2 from products p where p.slug = 'balenciaga-track-led---light-up';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track-led---light-up+beige', 3 from products p where p.slug = 'balenciaga-track-led---light-up';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+track-led---light-up+black-red', 4 from products p where p.slug = 'balenciaga-track-led---light-up';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+triple-s+triple-black', 0 from products p where p.slug = 'balenciaga-triple-s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+triple-s+triple-white', 1 from products p where p.slug = 'balenciaga-triple-s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+triple-s+grey', 2 from products p where p.slug = 'balenciaga-triple-s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+triple-s+beige', 3 from products p where p.slug = 'balenciaga-triple-s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=balenciaga+triple-s+black-red', 4 from products p where p.slug = 'balenciaga-triple-s';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+blazer-mid+white-black', 0 from products p where p.slug = 'nike-blazer-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+blazer-mid+triple-white', 1 from products p where p.slug = 'nike-blazer-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+blazer-mid+black', 2 from products p where p.slug = 'nike-blazer-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+blazer-mid+red', 3 from products p where p.slug = 'nike-blazer-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+blazer-mid+beige', 4 from products p where p.slug = 'nike-blazer-mid';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+cortez+white-black', 0 from products p where p.slug = 'nike-cortez';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+cortez+black-white', 1 from products p where p.slug = 'nike-cortez';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+cortez+white-red', 2 from products p where p.slug = 'nike-cortez';
insert into product_images (product_id, url, position)
select p.id, 'https://placehold.co/1200x1200/png?text=nike+cortez+beige', 3 from products p where p.slug = 'nike-cortez';

-- Variantes (pointures) — stock initial par pointure
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-air-force-1-low-38', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-air-force-1-low-39', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-air-force-1-low-40', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-air-force-1-low-41', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-air-force-1-low-42', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-air-force-1-low-43', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-air-force-1-low-44', 8 from products p where p.slug = 'nike-air-force-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-dunk-low-38', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-dunk-low-39', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-dunk-low-40', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-dunk-low-41', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-dunk-low-42', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-dunk-low-43', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-dunk-low-44', 8 from products p where p.slug = 'nike-dunk-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-air-max-90-38', 4 from products p where p.slug = 'nike-air-max-90'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-air-max-90-39', 4 from products p where p.slug = 'nike-air-max-90'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-air-max-90-40', 4 from products p where p.slug = 'nike-air-max-90'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-air-max-90-43', 4 from products p where p.slug = 'nike-air-max-90'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-air-max-95-38', 4 from products p where p.slug = 'nike-air-max-95'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-air-max-95-39', 4 from products p where p.slug = 'nike-air-max-95'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-air-max-95-40', 4 from products p where p.slug = 'nike-air-max-95'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-air-max-95-42', 4 from products p where p.slug = 'nike-air-max-95'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-air-max-95-43', 4 from products p where p.slug = 'nike-air-max-95'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-air-max-97-38', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-air-max-97-39', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-air-max-97-40', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-air-max-97-41', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-air-max-97-42', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-air-max-97-43', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-air-max-97-44', 4 from products p where p.slug = 'nike-air-max-97'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-air-max-plus---tn-38', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-air-max-plus---tn-39', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-air-max-plus---tn-40', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-air-max-plus---tn-41', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-air-max-plus---tn-42', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-air-max-plus---tn-43', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-air-max-plus---tn-44', 8 from products p where p.slug = 'nike-air-max-plus---tn'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-p-6000-38', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-p-6000-39', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-p-6000-40', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-p-6000-41', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-p-6000-42', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-p-6000-43', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-p-6000-44', 4 from products p where p.slug = 'nike-p-6000'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-vomero-5-38', 4 from products p where p.slug = 'nike-vomero-5'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-vomero-5-39', 4 from products p where p.slug = 'nike-vomero-5'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-vomero-5-40', 4 from products p where p.slug = 'nike-vomero-5'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'nike-vomero-5-41', 4 from products p where p.slug = 'nike-vomero-5'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-vomero-5-43', 4 from products p where p.slug = 'nike-vomero-5'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-vomero-5-44', 4 from products p where p.slug = 'nike-vomero-5'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'jordan-air-jordan-1-low-38', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'jordan-air-jordan-1-low-39', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'jordan-air-jordan-1-low-40', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'jordan-air-jordan-1-low-41', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'jordan-air-jordan-1-low-42', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'jordan-air-jordan-1-low-43', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'jordan-air-jordan-1-low-44', 4 from products p where p.slug = 'jordan-air-jordan-1-low'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'jordan-air-jordan-1-mid-38', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'jordan-air-jordan-1-mid-39', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'jordan-air-jordan-1-mid-40', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'jordan-air-jordan-1-mid-41', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'jordan-air-jordan-1-mid-42', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'jordan-air-jordan-1-mid-43', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'jordan-air-jordan-1-mid-44', 4 from products p where p.slug = 'jordan-air-jordan-1-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'jordan-air-jordan-4-38', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'jordan-air-jordan-4-39', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'jordan-air-jordan-4-40', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'jordan-air-jordan-4-41', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'jordan-air-jordan-4-42', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'jordan-air-jordan-4-43', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'jordan-air-jordan-4-44', 8 from products p where p.slug = 'jordan-air-jordan-4'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'jordan-air-jordan-3-38', 4 from products p where p.slug = 'jordan-air-jordan-3'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'jordan-air-jordan-3-39', 4 from products p where p.slug = 'jordan-air-jordan-3'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'jordan-air-jordan-3-40', 4 from products p where p.slug = 'jordan-air-jordan-3'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'jordan-air-jordan-3-43', 4 from products p where p.slug = 'jordan-air-jordan-3'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'adidas-samba-og-38', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'adidas-samba-og-39', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'adidas-samba-og-40', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'adidas-samba-og-41', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'adidas-samba-og-42', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'adidas-samba-og-43', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'adidas-samba-og-44', 8 from products p where p.slug = 'adidas-samba-og'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'adidas-campus-00s-38', 4 from products p where p.slug = 'adidas-campus-00s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'adidas-campus-00s-39', 4 from products p where p.slug = 'adidas-campus-00s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'adidas-campus-00s-40', 4 from products p where p.slug = 'adidas-campus-00s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'adidas-campus-00s-41', 4 from products p where p.slug = 'adidas-campus-00s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'adidas-campus-00s-44', 4 from products p where p.slug = 'adidas-campus-00s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'adidas-gazelle-39', 4 from products p where p.slug = 'adidas-gazelle'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'adidas-gazelle-40', 4 from products p where p.slug = 'adidas-gazelle'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'adidas-gazelle-41', 4 from products p where p.slug = 'adidas-gazelle'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'adidas-gazelle-42', 4 from products p where p.slug = 'adidas-gazelle'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'adidas-gazelle-43', 4 from products p where p.slug = 'adidas-gazelle'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'adidas-gazelle-44', 4 from products p where p.slug = 'adidas-gazelle'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'adidas-superstar-39', 4 from products p where p.slug = 'adidas-superstar'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'adidas-superstar-42', 4 from products p where p.slug = 'adidas-superstar'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'adidas-superstar-43', 4 from products p where p.slug = 'adidas-superstar'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'adidas-superstar-44', 4 from products p where p.slug = 'adidas-superstar'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'new-balance-530-38', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'new-balance-530-39', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'new-balance-530-40', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'new-balance-530-41', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'new-balance-530-42', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'new-balance-530-43', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'new-balance-530-44', 8 from products p where p.slug = 'new-balance-530'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'new-balance-550-39', 4 from products p where p.slug = 'new-balance-550'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'new-balance-550-40', 4 from products p where p.slug = 'new-balance-550'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'new-balance-550-41', 4 from products p where p.slug = 'new-balance-550'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'new-balance-550-42', 4 from products p where p.slug = 'new-balance-550'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'new-balance-550-44', 4 from products p where p.slug = 'new-balance-550'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'new-balance-9060-38', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'new-balance-9060-39', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'new-balance-9060-40', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'new-balance-9060-41', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'new-balance-9060-42', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'new-balance-9060-43', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'new-balance-9060-44', 8 from products p where p.slug = 'new-balance-9060'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'new-balance-2002r-38', 4 from products p where p.slug = 'new-balance-2002r'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'new-balance-2002r-39', 4 from products p where p.slug = 'new-balance-2002r'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'new-balance-2002r-40', 4 from products p where p.slug = 'new-balance-2002r'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'new-balance-2002r-42', 4 from products p where p.slug = 'new-balance-2002r'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'new-balance-2002r-43', 4 from products p where p.slug = 'new-balance-2002r'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'new-balance-2002r-44', 4 from products p where p.slug = 'new-balance-2002r'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'asics-gel-1130-38', 4 from products p where p.slug = 'asics-gel-1130'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'asics-gel-1130-39', 4 from products p where p.slug = 'asics-gel-1130'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'asics-gel-1130-40', 4 from products p where p.slug = 'asics-gel-1130'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'asics-gel-1130-42', 4 from products p where p.slug = 'asics-gel-1130'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'asics-gel-1130-43', 4 from products p where p.slug = 'asics-gel-1130'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'asics-gel-1130-44', 4 from products p where p.slug = 'asics-gel-1130'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'asics-gel-kayano-14-38', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'asics-gel-kayano-14-39', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'asics-gel-kayano-14-40', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'asics-gel-kayano-14-41', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'asics-gel-kayano-14-42', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'asics-gel-kayano-14-43', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'asics-gel-kayano-14-44', 8 from products p where p.slug = 'asics-gel-kayano-14'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'asics-gel-nyc-38', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'asics-gel-nyc-39', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'asics-gel-nyc-40', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'asics-gel-nyc-41', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'asics-gel-nyc-42', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'asics-gel-nyc-43', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'asics-gel-nyc-44', 4 from products p where p.slug = 'asics-gel-nyc'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'puma-suede-classic-38', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'puma-suede-classic-39', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'puma-suede-classic-40', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'puma-suede-classic-41', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'puma-suede-classic-42', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'puma-suede-classic-43', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'puma-suede-classic-44', 4 from products p where p.slug = 'puma-suede-classic'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'puma-palermo-38', 4 from products p where p.slug = 'puma-palermo'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'puma-palermo-39', 4 from products p where p.slug = 'puma-palermo'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'puma-palermo-42', 4 from products p where p.slug = 'puma-palermo'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'puma-palermo-44', 4 from products p where p.slug = 'puma-palermo'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'converse-chuck-taylor-all-star-38', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'converse-chuck-taylor-all-star-39', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'converse-chuck-taylor-all-star-40', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'converse-chuck-taylor-all-star-41', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'converse-chuck-taylor-all-star-42', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'converse-chuck-taylor-all-star-43', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'converse-chuck-taylor-all-star-44', 8 from products p where p.slug = 'converse-chuck-taylor-all-star'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'timberland-6-inch-premium-boot-38', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'timberland-6-inch-premium-boot-39', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'timberland-6-inch-premium-boot-40', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'timberland-6-inch-premium-boot-41', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'timberland-6-inch-premium-boot-42', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'timberland-6-inch-premium-boot-43', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'timberland-6-inch-premium-boot-44', 8 from products p where p.slug = 'timberland-6-inch-premium-boot'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'timberland-6-inch-waterproof-38', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'timberland-6-inch-waterproof-39', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'timberland-6-inch-waterproof-40', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'timberland-6-inch-waterproof-41', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'timberland-6-inch-waterproof-42', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'timberland-6-inch-waterproof-43', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'timberland-6-inch-waterproof-44', 4 from products p where p.slug = 'timberland-6-inch-waterproof'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'rick-owens-drkshdw-38', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'rick-owens-drkshdw-39', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'rick-owens-drkshdw-40', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'rick-owens-drkshdw-41', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'rick-owens-drkshdw-42', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'rick-owens-drkshdw-43', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'rick-owens-drkshdw-44', 8 from products p where p.slug = 'rick-owens-drkshdw'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'rick-owens-geobasket-38', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'rick-owens-geobasket-39', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'rick-owens-geobasket-40', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'rick-owens-geobasket-41', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'rick-owens-geobasket-42', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'rick-owens-geobasket-43', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'rick-owens-geobasket-44', 8 from products p where p.slug = 'rick-owens-geobasket'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'rick-owens-abstract-38', 4 from products p where p.slug = 'rick-owens-abstract'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'rick-owens-abstract-40', 4 from products p where p.slug = 'rick-owens-abstract'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'rick-owens-abstract-43', 4 from products p where p.slug = 'rick-owens-abstract'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'rick-owens-abstract-44', 4 from products p where p.slug = 'rick-owens-abstract'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'balenciaga-track-38', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'balenciaga-track-39', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'balenciaga-track-40', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'balenciaga-track-41', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'balenciaga-track-42', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'balenciaga-track-43', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'balenciaga-track-44', 8 from products p where p.slug = 'balenciaga-track'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'balenciaga-track-led---light-up-38', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'balenciaga-track-led---light-up-39', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'balenciaga-track-led---light-up-40', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'balenciaga-track-led---light-up-41', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'balenciaga-track-led---light-up-42', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'balenciaga-track-led---light-up-43', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'balenciaga-track-led---light-up-44', 8 from products p where p.slug = 'balenciaga-track-led---light-up'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'balenciaga-triple-s-38', 4 from products p where p.slug = 'balenciaga-triple-s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'balenciaga-triple-s-39', 4 from products p where p.slug = 'balenciaga-triple-s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'balenciaga-triple-s-40', 4 from products p where p.slug = 'balenciaga-triple-s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '41', 'balenciaga-triple-s-41', 4 from products p where p.slug = 'balenciaga-triple-s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'balenciaga-triple-s-42', 4 from products p where p.slug = 'balenciaga-triple-s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'balenciaga-triple-s-44', 4 from products p where p.slug = 'balenciaga-triple-s'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-blazer-mid-38', 4 from products p where p.slug = 'nike-blazer-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-blazer-mid-39', 4 from products p where p.slug = 'nike-blazer-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-blazer-mid-40', 4 from products p where p.slug = 'nike-blazer-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '42', 'nike-blazer-mid-42', 4 from products p where p.slug = 'nike-blazer-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-blazer-mid-43', 4 from products p where p.slug = 'nike-blazer-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-blazer-mid-44', 4 from products p where p.slug = 'nike-blazer-mid'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '38', 'nike-cortez-38', 4 from products p where p.slug = 'nike-cortez'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '39', 'nike-cortez-39', 4 from products p where p.slug = 'nike-cortez'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '40', 'nike-cortez-40', 4 from products p where p.slug = 'nike-cortez'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '43', 'nike-cortez-43', 4 from products p where p.slug = 'nike-cortez'
on conflict (product_id, size) do nothing;
insert into product_variants (product_id, size, sku, stock)
select p.id, '44', 'nike-cortez-44', 4 from products p where p.slug = 'nike-cortez'
on conflict (product_id, size) do nothing;