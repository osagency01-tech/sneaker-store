-- ==================================================================== --
--  Décrément de stock transactionnel + passage PAID.
--  Appelée UNIQUEMENT côté serveur (service_role) après confirmation
--  réelle du paiement. Idempotente : ne fait rien si la commande est
--  déjà PAID. Verrouille les lignes de variantes pour éviter la survente.
-- ==================================================================== --

create or replace function confirm_order_paid(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_status order_status;
  it record;
begin
  -- Verrou de la commande
  select status into v_status
  from orders where id = p_order_id
  for update;

  if v_status is null then
    raise exception 'Commande introuvable';
  end if;

  -- Idempotence : déjà traitée
  if v_status <> 'PENDING_PAYMENT' then
    return;
  end if;

  -- Décrément par variante, avec verrou et garde anti-négatif
  for it in
    select variant_id, sum(quantity) as qty
    from order_items
    where order_id = p_order_id and variant_id is not null
    group by variant_id
  loop
    update product_variants
      set stock = stock - it.qty
      where id = it.variant_id and stock >= it.qty;

    if not found then
      raise exception 'Stock insuffisant pour la variante %', it.variant_id;
    end if;
  end loop;

  update orders set status = 'PAID' where id = p_order_id;
end;
$$;

revoke all on function confirm_order_paid(uuid) from public, anon, authenticated;
