import { notFound } from "next/navigation";
import { PaymentFlow } from "@/components/PaymentFlow";
import { createAdminClient } from "@/lib/supabase/admin";

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
    .select("status, order_id")
    .eq("external_reference", ref)
    .single();

  if (!payment || payment.order_id !== params.id) notFound();

  return (
    <div className="min-h-screen bg-paper-soft px-4 py-10">
      <PaymentFlow
        orderId={params.id}
        externalReference={ref}
        countryCode={country}
        phone={phone ?? ""}
        accessToken={token}
        orderNumber={order ?? ""}
      />
    </div>
  );
}
