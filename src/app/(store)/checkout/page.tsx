import { CheckoutFlow } from "@/components/CheckoutFlow";
export const metadata = { title: "Commander" };
export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-app px-4 py-6">
      <h1 className="display text-3xl">Commander</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Deux étapes, livraison gratuite. Pas besoin de compte.
      </p>
      <div className="mt-6">
        <CheckoutFlow />
      </div>
    </div>
  );
}
