import { CheckoutFlow } from "@/components/CheckoutFlow";

export const metadata = {
  title: "Confirmation de la commande",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-app px-4 py-6">
      <h1 className="display text-3xl">
        Confirmation de la commande
      </h1>

      <p className="mt-1 text-sm text-ink-faint">
        Votre paiement confirme votre commande. Choisissez votre
        opérateur Mobile Money pour la valider définitivement.
      </p>

      <div className="mt-6">
        <CheckoutFlow />
      </div>
    </div>
  );
}