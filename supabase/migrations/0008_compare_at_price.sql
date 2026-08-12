-- ==================================================================== --
--  Prix barré (promo) — colonne optionnelle sur products.
--  Quand compare_at_price > price, l'UI affiche l'ancien prix barré
--  et le nouveau prix en évidence.
-- ==================================================================== --

alter table products
  add column if not exists compare_at_price integer
    check (compare_at_price is null or compare_at_price >= 0);
