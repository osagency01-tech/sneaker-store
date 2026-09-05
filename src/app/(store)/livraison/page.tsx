import type { Metadata } from "next";

export const metadata: Metadata = { title: "Livraison" };

export default function LivraisonPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="display text-3xl">Livraison</h1>
      <p className="mt-2 text-sm text-ink-faint">
        Ce que vous devez savoir avant de commander.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Zones de livraison</h2>
          <p>
            Nous livrons en Côte d'Ivoire et dans plusieurs pays d'Afrique de l'Ouest.
            Le pays de livraison se choisit à l'étape « Coordonnées » du paiement, ce
            qui adapte automatiquement les opérateurs Mobile Money disponibles.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Délais</h2>
          <p>
            Comptez en général 24 à 72h à Abidjan et dans les grandes villes après
            confirmation du paiement, et un peu plus pour les zones plus éloignées.
            Ces délais sont indicatifs et peuvent varier selon la disponibilité du
            livreur et votre localisation exacte.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Frais de livraison</h2>
          <p>La livraison est actuellement offerte, sans minimum d'achat.</p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Comment se passe la livraison ?</h2>
          <p>
            Une fois votre paiement confirmé, notre équipe prépare votre commande et
            vous contacte via le numéro WhatsApp renseigné à la commande pour
            organiser la remise. Vous pouvez suivre l'état de votre commande à tout
            moment grâce au lien reçu après l'achat.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Un problème avec votre livraison ?</h2>
          <p>
            Si le délai vous semble anormalement long ou si vous n'arrivez pas à
            joindre le livreur, contactez-nous avec votre numéro de commande — nous
            reprenons le suivi immédiatement.
          </p>
        </section>
      </div>
    </div>
  );
}
