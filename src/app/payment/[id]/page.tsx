import { notFound, redirect } from "next/navigation";
import { PaymentFlow } from "@/components/PaymentFlow";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/orders/verify-payment";

export const metadata = { title: "Paiement" };

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { ref?: string; country?: string; phone?: string; token?: string; order?: string };
}) {
  const { ref, country, phone, token, order } = searchParams;
  if (!ref || !country || !token) notFound();

  // Vérifie que la commande existe et est bien en attente de paiement
  const db = createAdminClient();
  const { data: payment } = await db
    .from("payments")
    .select("status, order_id, provider_tx_id")
    .eq("external_reference", ref)
    .single();

  if (!payment || payment.order_id !== params.id) notFound();

  if (payment.status === "SUCCESS") {
    redirect(`/order/${params.id}?token=${token}&paid=1`);
  }

  // Page reprenable : si une demande de paiement a déjà été envoyée
  // (rechargement, ou client revenu après avoir fermé l'onglet), on
  // revérifie tout de suite auprès de l'agrégateur avant d'afficher quoi
  // que ce soit — sans ça, un paiement validé pendant l'absence du
  // navigateur ne serait jamais constaté.
  let initialPhase: "choose" | "waiting" | "rejected" = "choose";
  let initialError: string | null = null;

  if (payment.status === "PENDING" && payment.provider_tx_id) {
    const result = await verifyPayment(ref);
    if (result.state === "paid") {
      redirect(`/order/${params.id}?token=${token}&paid=1`);
    } else if (result.state === "rejected") {
      initialPhase = "rejected";
      initialError = "Le paiement a été refusé ou annulé.";
    } else {
      initialPhase = "waiting";
    }
  }

  return (
    <div className="min-h-screen bg-paper-soft px-4 py-10">
      <PaymentFlow
        orderId={params.id}
        externalReference={ref}
        countryCode={country}
        phone={phone ?? ""}
        accessToken={token}
        orderNumber={order ?? ""}
        initialPhase={initialPhase}
        initialError={initialError}
      />
    </div>
  );
}
