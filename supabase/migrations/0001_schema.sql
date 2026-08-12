-- ==================================================================== --
--  Schéma boutique sneakers — MVP 1
-- ==================================================================== --

create extension if not exists "pgcrypto";

-- Catégories ----------------------------------------------------------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- Produits ------------------------------------------------------------
create type product_status as enum ('active', 'draft', 'archived');

create table products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  brand       text,
  description text,
  price       integer not null check (price >= 0),   -- XOF entier
  category_id uuid references categories(id) on delete set null,
  status      product_status not null default 'draft',
  created_at  timestamptz not null default now()
);
create index products_status_idx on products(status);
create index products_category_idx on products(category_id);

-- Images produit ------------------------------------------------------
create table product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url        text not null,
  position   integer not null default 0
);
create index product_images_product_idx on product_images(product_id);

-- Variantes (pointures) ----------------------------------------------
create table product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size       text not null,
  sku        text unique,
  stock      integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);
create index product_variants_product_idx on product_variants(product_id);

-- Clients -------------------------------------------------------------
create table customers (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  phone      text not null,
  email      text,
  city       text not null,
  address    text not null,
  country    text not null default 'CI',
  created_at timestamptz not null default now()
);

-- Commandes -----------------------------------------------------------
create type order_status as enum
  ('PENDING_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED');

create table orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  customer_id   uuid not null references customers(id) on delete restrict,
  status        order_status not null default 'PENDING_PAYMENT',
  subtotal      integer not null check (subtotal >= 0),
  shipping      integer not null default 0 check (shipping >= 0),
  total         integer not null check (total >= 0),
  access_token  uuid not null default gen_random_uuid(),  -- lien de suivi sécurisé
  created_at    timestamptz not null default now()
);
create index orders_status_idx on orders(status);
create index orders_token_idx on orders(access_token);

-- Lignes de commande (snapshot) --------------------------------------
create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  variant_id   uuid references product_variants(id) on delete set null,
  product_name text not null,
  size         text not null,
  unit_price   integer not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0)
);
create index order_items_order_idx on order_items(order_id);

-- Paiements -----------------------------------------------------------
create type payment_status as enum ('PENDING','SUCCESS','FAILED');

create table payments (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references orders(id) on delete cascade,
  provider           text not null default 'sebpay',
  external_reference text not null unique,
  provider_tx_id     text,
  amount             integer not null check (amount >= 0),
  status             payment_status not null default 'PENDING',
  operator           text,
  created_at         timestamptz not null default now()
);
create index payments_order_idx on payments(order_id);
create index payments_ref_idx on payments(external_reference);

-- Profils admin -------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin',
  full_name  text,
  created_at timestamptz not null default now()
);
