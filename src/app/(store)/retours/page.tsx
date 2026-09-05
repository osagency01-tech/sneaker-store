import type { Metadata } from "next";

export const metadata: Metadata = { title: "Retours et remboursements" };

export default function RetoursPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="display text-3xl">Retours et remboursements</h1>
      <p className="mt-2 text-sm text-ink-faint">
        Conditions claires, sans mauvaise surprise.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Dans quels cas un retour est possible</h2>
          <p>
            Si la paire reçue ne correspond pas à votre commande (mauvaise pointure,
            mauvais modèle) ou présente un défaut, vous pouvez demander un retour ou
            un échange.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Délai</h2>
          <p>
            La demande doit être faite dans les 7 jours suivant la réception de votre
            commande.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">État attendu du produit</h2>
          <p>
            La paire doit être non portée à l'extérieur, dans son état d'origine,
            avec sa boîte si elle vous a été fournie.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Comment faire une demande</h2>
          <p>
            Contactez-nous via le numéro WhatsApp utilisé lors de votre commande, en
            précisant votre numéro de commande et le motif du retour. Nous vous
            indiquons ensuite la marche à suivre.
          </p>
        </section>

        <section>
          <h2 className="display mb-1.5 text-lg text-ink">Remboursement</h2>
          <p>
            Une fois le produit retourné et vérifié, le remboursement est effectué
            sur le moyen de paiement Mobile Money utilisé à la commande, sous
            quelques jours ouvrés.
          </p>
        </section>
      </div>
    </div>
  );
}
