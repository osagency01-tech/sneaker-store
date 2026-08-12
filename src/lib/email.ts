/* ==================================================================== *
 *  Emails transactionnels (Resend). Optionnel : si RESEND_API_KEY n'est
 *  pas défini, on n'envoie rien et on ne bloque jamais le paiement.
 * ==================================================================== */

import { formatXOF } from "@/lib/format";

type OrderEmail = {
  to: string;
  orderNumber: string;
  total: number;
  trackingUrl: string;
  items: { name: string; size: string; quantity: number }[];
};

export async function sendOrderConfirmation(data: OrderEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !data.to) return; // pas configuré → on ignore

  const from = process.env.RESEND_FROM ?? "Vantom <onboarding@resend.dev>";
  const lines = data.items
    .map((i) => `• ${i.name} — pointure ${i.size} × ${i.quantity}`)
    .join("<br>");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto">
      <h1 style="font-size:22px">Merci pour ta commande !</h1>
      <p>Ta commande <strong>${data.orderNumber}</strong> est confirmée et payée.</p>
      <p style="color:#555">${lines}</p>
      <p><strong>Total : ${formatXOF(data.total)}</strong> · Livraison gratuite</p>
      <p><a href="${data.trackingUrl}" style="display:inline-block;background:#0B0B0F;color:#fff;
        padding:12px 22px;border-radius:999px;text-decoration:none">Suivre ma commande</a></p>
      <p style="color:#999;font-size:12px">Conserve ce lien pour suivre ta livraison.</p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: data.to,
        subject: `Commande ${data.orderNumber} confirmée · Vantom`,
        html,
      }),
    });
  } catch {
    // silencieux : un échec d'email ne doit jamais impacter la commande
  }
}
