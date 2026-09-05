/* Avis clients — structure de données réutilisable.
   Les avis sont actuellement stockés dans ce fichier et sélectionnés
   de façon déterministe par produit.
*/

export type Review = {
  author: string;
  rating: 4 | 5;
  comment: string;
  verified: boolean;
  daysAgo: number;
};

/* =========================
   AVIS SNEAKERS
   ========================= */

const POOL: Review[] = [
  {
    author: "Kouassi Jean",
    rating: 5,
    comment:
      "La paire correspond bien aux photos. Livraison rapide et bonne qualité.",
    verified: true,
    daysAgo: 6,
  },
  {
    author: "Client anonyme",
    rating: 5,
    comment:
      "Très satisfait de mon achat, rien à redire sur la qualité.",
    verified: true,
    daysAgo: 14,
  },
  {
    author: "Yao Kevin",
    rating: 4,
    comment:
      "Belle paire, elle taille un peu grand. Je conseille de prendre une demi-pointure en dessous.",
    verified: true,
    daysAgo: 21,
  },
  {
    author: "Awa",
    rating: 5,
    comment:
      "Reçu rapidement à Abidjan, rien à signaler. Emballage soigné.",
    verified: false,
    daysAgo: 9,
  },
  {
    author: "Konan Ibrahim",
    rating: 5,
    comment:
      "J'avais un peu hésité avant de commander mais franchement je suis satisfait.",
    verified: true,
    daysAgo: 30,
  },
  {
    author: "N'Guessan Marc",
    rating: 4,
    comment:
      "Bon rapport qualité/prix. Le confort est là, la finition est correcte.",
    verified: true,
    daysAgo: 45,
  },
  {
    author: "Koffi Arnaud",
    rating: 5,
    comment:
      "Très belle paire, conforme aux photos. Je recommande.",
    verified: true,
    daysAgo: 12,
  },
  {
    author: "Fatou",
    rating: 5,
    comment:
      "Exactement ce que j'attendais. La taille correspond bien à ma pointure habituelle.",
    verified: false,
    daysAgo: 18,
  },
  {
    author: "Traoré Moussa",
    rating: 5,
    comment:
      "Qualité vraiment bonne pour le prix. Deuxième commande chez eux, toujours nickel.",
    verified: true,
    daysAgo: 3,
  },
  {
    author: "Client anonyme",
    rating: 4,
    comment:
      "Livraison un peu plus longue que prévu mais le produit est conforme.",
    verified: true,
    daysAgo: 25,
  },
  {
    author: "Marc",
    rating: 5,
    comment:
      "Confortable dès les premières heures. Je suis content de mon choix.",
    verified: false,
    daysAgo: 40,
  },
  {
    author: "Aïcha Diabaté",
    rating: 5,
    comment:
      "Commande arrivée en bon état, la paire est identique aux photos du site.",
    verified: true,
    daysAgo: 8,
  },
  {
    author: "Yao Kevin",
    rating: 5,
    comment:
      "Deuxième achat sur le site, toujours satisfait de la qualité et du suivi.",
    verified: true,
    daysAgo: 50,
  },
  {
    author: "Client anonyme",
    rating: 5,
    comment:
      "Très bonne expérience du début à la fin, je recommande sans hésiter.",
    verified: true,
    daysAgo: 15,
  },
  {
    author: "Ibrahim",
    rating: 4,
    comment:
      "Bonne paire, un peu rigide au début mais ça s'assouplit bien après quelques jours.",
    verified: false,
    daysAgo: 33,
  },
  {
    author: "N'Guessan Marc",
    rating: 5,
    comment:
      "Le paiement Mobile Money a été simple et le suivi de commande clair.",
    verified: true,
    daysAgo: 20,
  },
  {
    author: "Sophie",
    rating: 5,
    comment:
      "Jolie paire, confortable, correspond bien à la description du site.",
    verified: false,
    daysAgo: 5,
  },
  {
    author: "Konan Ibrahim",
    rating: 4,
    comment:
      "Satisfait dans l'ensemble, la boîte est arrivée un peu abîmée mais la paire est intacte.",
    verified: true,
    daysAgo: 27,
  },
];

/* =========================
   AVIS DES SACS
   ========================= */

const BAG_REVIEWS: Review[] = [
  {
    author: "Aminata",
    rating: 5,
    comment:
      "Très joli sac, la qualité est vraiment bonne et il correspond parfaitement aux photos.",
    verified: true,
    daysAgo: 7,
  },
  {
    author: "Kévin",
    rating: 5,
    comment:
      "Le sac est pratique et assez spacieux pour mes affaires. Très satisfait de mon achat.",
    verified: true,
    daysAgo: 16,
  },
  {
    author: "Mariam",
    rating: 5,
    comment:
      "Belle finition et livraison rapide. Le sac est encore plus beau en vrai.",
    verified: true,
    daysAgo: 24,
  },
];

/* =========================
   PRODUITS SACS
   ========================= */

const SAC_COULEUR_ID = "e431c80f-4df5-4591-9ccc-599837290786";
const SAC_MOTIF_ID = "10481c6a-865a-43d4-8c97-7be8c71b7099";

function hashString(s: string): number {
  let h = 0;

  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }

  return h;
}

/* =========================
   AVIS PAR PRODUIT
   ========================= */

export function getReviewsForProduct(productId: string): Review[] {
  /*
   * Les sacs ont leurs propres avis.
   * Ils ne récupèrent donc plus les avis des sneakers.
   */

  if (productId === SAC_COULEUR_ID) {
    return BAG_REVIEWS;
  }

  if (productId === SAC_MOTIF_ID) {
    return BAG_REVIEWS;
  }

  /*
   * Tous les autres produits conservent
   * le système actuel des avis sneakers.
   */

  const seed = hashString(productId);
  const count = 6 + (seed % 3); // 6, 7 ou 8 avis

  const indices = POOL.map((_, i) => i);

  let s = seed || 1;

  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, count).map((i) => POOL[i]);
}

export function getReviewSummary(
  reviews: Review[]
): { average: number; count: number } {
  const count = reviews.length;

  const average =
    count === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / count;

  return {
    average: Math.round(average * 10) / 10,
    count,
  };
}