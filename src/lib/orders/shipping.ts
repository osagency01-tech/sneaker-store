/* Livraison gratuite (MVP). Fonction conservée pour un éventuel retour
   des frais plus tard, mais renvoie toujours 0. */
export const SHIPPING_FLAT = 0;
export const FREE_SHIPPING_THRESHOLD = 0;

export function computeShipping(_subtotal: number): number {
  return 0;
}
