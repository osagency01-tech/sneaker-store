-- ==================================================================== --
--  Livraison gratuite + adresse simplifiée (pays seul requis au MVP).
-- ==================================================================== --

-- Ville et adresse deviennent optionnelles (on ne demande que le pays)
alter table customers alter column city drop not null;
alter table customers alter column address drop not null;

-- Valeur par défaut pour les frais (déjà 0 par défaut, on s'en assure)
alter table orders alter column shipping set default 0;
