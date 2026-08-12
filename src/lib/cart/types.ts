/* Le panier vit côté client (localStorage). On n'y stocke que des
   références et des snapshots d'affichage. Le PRIX FAISANT FOI est
   toujours recalculé côté serveur à partir des variant_id. */
export type CartLine = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  size: string;
  price: number;      // affichage seulement
  image: string | null;
  quantity: number;
};

export type CartState = { lines: CartLine[] };
