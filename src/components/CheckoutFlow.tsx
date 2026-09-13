"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { useCart } from "@/lib/cart/store";
import { formatXOF } from "@/lib/format";

import {
  operatorsFor,
  isPlausiblePhone,
  findCountry,
  OPERATOR_LABEL,
  type Operator,
} from "@/lib/payment/countries";

import { CountrySelect } from "@/components/CountrySelect";
import { trackPixelEvent } from "@/lib/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics/track";

const POLL_MS = 5000;
const MAX_POLLS = 60;

/* ==================================================================== *
 * LOGOS
 * ==================================================================== */

const OPERATOR_LOGO: Record<
  Operator,
  string
> = {
  wave: "/operators/wave.jpeg",
  orange: "/operators/orange.jpeg",
  mtn: "/operators/mtn.jpeg",
  moov: "/operators/moov.jpeg",
};

type Step = 1 | 2;

type PayPhase =
  | "form"
  | "pushing"
  | "waiting"
  | "paid"
  | "rejected";

export function CheckoutFlow() {
  const {
    lines,
    subtotal,
    clear,
  } = useCart();

  const router = useRouter();

  const [step, setStep] =
    useState<Step>(1);

  /* ================================================================== *
   * COORDONNÉES
   * ================================================================== */

  const [info, setInfo] =
    useState({
      fullName: "",
      phone: "",
      email: "",
      country: "CI",
    });

  const [creating, setCreating] =
    useState(false);

  const [err1, setErr1] =
    useState<string | null>(null);

  /* ================================================================== *
   * COMMANDE
   * ================================================================== */

  const [order, setOrder] =
    useState<{
      orderId: string;
      externalReference: string;
      accessToken: string;
      orderNumber: string;
    } | null>(null);

  /* ================================================================== *
   * PAIEMENT
   * ================================================================== */

  const ops = operatorsFor(
    info.country
  );

  const [operator, setOperator] =
    useState<Operator | null>(
      null
    );

  const [payPhone, setPayPhone] =
    useState("");

  const [phase, setPhase] =
    useState<PayPhase>("form");

  const [payMsg, setPayMsg] =
    useState<string | null>(null);

  const [err2, setErr2] =
    useState<string | null>(null);

  /* ================================================================== *
   * OTP ORANGE / SEBPAY
   * ================================================================== */

  const [otpRequired, setOtpRequired] =
    useState(false);

  const [otpCode, setOtpCode] =
    useState("");

  const [otpUssdCode, setOtpUssdCode] =
    useState<string | null>(null);

  const pollRef =
    useRef<
      ReturnType<typeof setInterval> | null
    >(null);

  const countRef =
    useRef(0);

  const payRef =
    useRef<
      (() => void) | null
    >(null);

  const total = subtotal;

  /* ================================================================== *
   * ÉTAPE POUR MOBILE CART BAR
   * ================================================================== */

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(
        "vantom:checkout-step",
        {
          detail: {
            payment: step === 2,
          },
        }
      )
    );
  }, [step]);

  /* ================================================================== *
   * POLLING
   * ================================================================== */

  const stopPolling =
    useCallback(() => {
      if (pollRef.current) {
        clearInterval(
          pollRef.current
        );

        pollRef.current = null;
      }
    }, []);

  useEffect(() => {
    return () =>
      stopPolling();
  }, [stopPolling]);

  /* ================================================================== *
   * TRACKING
   * ================================================================== */

  const initiateTracked =
    useRef(false);

  useEffect(() => {
    if (
      initiateTracked.current ||
      lines.length === 0
    ) {
      return;
    }

    initiateTracked.current =
      true;

    trackPixelEvent(
      "InitiateCheckout",
      {
        value: subtotal,
        currency: "XOF",
        num_items:
          lines.reduce(
            (n, l) =>
              n + l.quantity,
            0
          ),
        content_ids:
          lines.map(
            (l) =>
              l.productId
          ),
        contents:
          lines.map((l) => ({
            id: l.productId,
            quantity:
              l.quantity,
            item_price:
              l.price,
          })),
      }
    );

    trackFunnelEvent(
      "BEGIN_CHECKOUT"
    );
  }, [lines, subtotal]);

  /* ================================================================== *
   * CTA FIXE
   * ================================================================== */

  useEffect(() => {
    const handlePayRequest =
      () => {
        payRef.current?.();
      };

    window.addEventListener(
      "vantom:pay",
      handlePayRequest
    );

    return () => {
      window.removeEventListener(
        "vantom:pay",
        handlePayRequest
      );
    };
  }, []);

  /* ================================================================== *
   * PANIER VIDE
   * ================================================================== */

  if (
    lines.length === 0 &&
    phase !== "paid"
  ) {
    return (
      <div className="py-20 text-center text-ink-faint">
        Votre panier est vide.{" "}
        <a
          href="/shop"
          className="text-accent-ink underline"
        >
          Retour boutique
        </a>
      </div>
    );
  }

  /* ================================================================== *
   * CHAMPS
   * ================================================================== */

  const set =
    (k: keyof typeof info) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >
    ) =>
      setInfo((f) => ({
        ...f,
        [k]: e.target.value,
      }));

  /* ================================================================== *
   * VALIDATION PAIEMENT
   * ================================================================== */

  function isPaymentPhoneValid() {
    const country =
      findCountry(
        info.country
      );

    if (!country) {
      return false;
    }

    const digits =
      payPhone.replace(
        /\D/g,
        ""
      );

    if (
      info.country === "CI"
    ) {
      let national = digits;

      if (
        national.startsWith(
          "225"
        )
      ) {
        national =
          national.slice(3);
      }

      return (
        national.length ===
          10 &&
        /^0\d{9}$/.test(
          national
        )
      );
    }

    return isPlausiblePhone(
      payPhone,
      info.country
    );
  }

  /* ================================================================== *
   * VALIDATION CLIENT
   * ================================================================== */

  function isCustomerPhoneValid() {
    if (
      info.country === "CI"
    ) {
      const digits =
        info.phone.replace(
          /\D/g,
          ""
        );

      let national = digits;

      if (
        national.startsWith(
          "225"
        )
      ) {
        national =
          national.slice(3);
      }

      return (
        national.length ===
          10 &&
        /^0\d{9}$/.test(
          national
        )
      );
    }

    return isPlausiblePhone(
      info.phone,
      info.country
    );
  }

  /* ================================================================== *
   * CRÉATION COMMANDE
   * ================================================================== */

  async function submitInfo(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setErr1(null);

    if (
      !isCustomerPhoneValid()
    ) {
      setErr1(
        info.country === "CI"
          ? "Veuillez entrer un numéro ivoirien valide de 10 chiffres."
          : "Ce numéro ne semble pas correspondre au pays sélectionné. Vérifiez le nombre de chiffres."
      );

      return;
    }

    setCreating(true);

    try {
      const res =
        await fetch(
          "/api/checkout",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customer: {
                fullName:
                  info.fullName,
                phone:
                  info.phone,
                email:
                  info.email ||
                  undefined,
                country:
                  info.country,
              },

              lines:
                lines.map(
                  (l) => ({
                    variantId:
                      l.variantId,
                    quantity:
                      l.quantity,
                  })
                ),
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        setErr1(
          data.error ??
            "Une erreur est survenue."
        );

        return;
      }

      setOrder({
        orderId:
          data.orderId,
        externalReference:
          data.externalReference,
        accessToken:
          data.accessToken,
        orderNumber:
          data.orderNumber,
      });

      setPayPhone(
        info.phone
      );

      setOperator(
        operatorsFor(
          info.country
        )[0] ?? null
      );

      setStep(2);
    } catch {
      setErr1(
        "Connexion impossible. Réessayez."
      );
    } finally {
      setCreating(false);
    }
  }

  /* ================================================================== *
   * VÉRIFICATION
   * ================================================================== */

  const verify =
    useCallback(
      async () => {
        if (!order) {
          return;
        }

        countRef.current += 1;

        try {
          const res =
            await fetch(
              "/api/payments/verify",
              {
                method:
                  "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  externalReference:
                    order.externalReference,
                }),
              }
            );

          const data =
            await res.json();

          if (
            data.state ===
            "paid"
          ) {
            stopPolling();

            setPhase("paid");

            clear();

            setTimeout(
              () => {
                router.push(
                  `/order/${order.orderId}?token=${order.accessToken}&paid=1`
                );
              },
              1200
            );
          } else if (
            data.state ===
            "rejected"
          ) {
            stopPolling();

            setPhase(
              "rejected"
            );

            setErr2(
              "Le paiement a été refusé ou annulé."
            );
          } else if (
            countRef.current >=
            MAX_POLLS
          ) {
            stopPolling();

            setPhase(
              "rejected"
            );

            setErr2(
              "Délai dépassé. Si vous avez été débité, contactez-nous avec votre numéro de commande."
            );
          }
        } catch {
          // On continue malgré une coupure.
        }
      },
      [
        order,
        router,
        clear,
        stopPolling,
      ]
    );

  /* ================================================================== *
   * PAIEMENT
   * ================================================================== */

  async function pay() {
    if (step !== 2) {
      return;
    }

    if (!order) {
      return;
    }

    if (!operator) {
      setErr2(
        "Veuillez sélectionner votre opérateur Mobile Money."
      );
      return;
    }

    if (
      !isPaymentPhoneValid()
    ) {
      setErr2(
        info.country === "CI"
          ? "Veuillez entrer un numéro ivoirien valide de 10 chiffres."
          : "Veuillez vérifier le numéro de paiement."
      );
      return;
    }

    /*
     * Si un OTP est déjà demandé,
     * il devient obligatoire.
     */
    if (
      otpRequired &&
      !otpCode.trim()
    ) {
      setErr2(
        "Veuillez saisir le code OTP reçu sur votre téléphone."
      );
      return;
    }

    setErr2(null);
    setPhase("pushing");

    try {
      const res =
        await fetch(
          "/api/payments/init",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              externalReference:
                order.externalReference,

              operator,

              phone: payPhone,

              countryCode:
                info.country,

              otpCode:
                otpRequired
                  ? otpCode.trim()
                  : undefined,
            }),
          }
        );

      const data =
        await res.json();

      /* ============================================================ *
       * OTP REQUIS
       * ============================================================ */

      if (
        res.ok &&
        data.kind ===
          "otp_required"
      ) {
        setOtpRequired(true);

        setOtpUssdCode(
          data.ussdCode ??
            null
        );

        setPayMsg(
          data.message ??
            "Composez le code USSD indiqué sur votre téléphone pour recevoir votre OTP."
        );

        setPhase("form");

        return;
      }

      if (!res.ok) {
        setErr2(
          data.error ??
            "Le paiement n'a pas pu être lancé."
        );

        setPhase("form");

        return;
      }

      /* ============================================================ *
       * REDIRECTION WAVE
       * ============================================================ */

      if (
        data.kind ===
          "redirect" &&
        data.url
      ) {
        window.location.href =
          data.url;

        return;
      }

      /* ============================================================ *
       * PAIEMENT NORMAL
       * ============================================================ */

      setPayMsg(
        data.message
      );

      setPhase(
        "waiting"
      );

      countRef.current = 0;

      verify();

      pollRef.current =
        setInterval(
          verify,
          POLL_MS
        );
    } catch {
      setErr2(
        "Connexion impossible. Réessayez."
      );

      setPhase("form");
    }
  }

  /*
   * Quand on change d'opérateur,
   * l'ancien OTP ne doit jamais être réutilisé.
   */

  function selectOperator(
    op: Operator
  ) {
    setOperator(op);

    setOtpRequired(false);
    setOtpCode("");
    setOtpUssdCode(null);
    setPayMsg(null);
    setErr2(null);
  }

  payRef.current = pay;

  /* ================================================================== *
   * STYLE
   * ================================================================== */

  const field =
    "w-full rounded-xl border border-paper-line bg-paper px-4 py-3 text-base focus:border-ink focus:outline-none";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* ============================================================ *
       * COLONNE PRINCIPALE
       * ============================================================ */}

      <div>
        {step === 2 && (
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setErr2(null);
              setPhase("form");
              setOtpRequired(false);
              setOtpCode("");
              setOtpUssdCode(null);
            }}
            className="mb-4 text-sm text-ink-faint transition hover:text-ink"
          >
            ← Modifier mes coordonnées
          </button>
        )}

        {/* ========================================================== *
         * ÉTAPES
         * ========================================================== */}

        <div className="mb-5 flex items-center gap-3 text-sm">
          <StepDot
            n={1}
            active={step === 1}
            done={step > 1}
            label="Coordonnées"
          />

          <div className="h-px flex-1 bg-paper-line" />

          <StepDot
            n={2}
            active={step === 2}
            done={phase === "paid"}
            label="Paiement"
          />
        </div>

        {/* ========================================================== *
         * ÉTAPE 1
         * ========================================================== */}

        {step === 1 && (
          <form
            onSubmit={
              submitInfo
            }
            className="space-y-4 animate-fadeUp"
          >
            <div>
              <label className="eyebrow mb-1.5 block">
                Nom complet
              </label>

              <input
                required
                value={
                  info.fullName
                }
                onChange={set(
                  "fullName"
                )}
                className={field}
                placeholder="Awa Traoré"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">
                Pays de livraison
              </label>

              <CountrySelect
                value={
                  info.country
                }
                onChange={(
                  code
                ) =>
                  setInfo(
                    (f) => ({
                      ...f,
                      country:
                        code,
                    })
                  )
                }
              />
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">
                Numéro WhatsApp (pour le livreur)
              </label>

              <input
                required
                value={
                  info.phone
                }
                onChange={set(
                  "phone"
                )}
                className={field}
                placeholder="07 00 00 00 00"
                inputMode="tel"
                autoComplete="tel"
              />

              {info.phone
                .length > 3 &&
                !isCustomerPhoneValid() && (
                  <p className="mt-1 text-xs text-warn">
                    {info.country ===
                    "CI"
                      ? "Entrez un numéro ivoirien valide de 10 chiffres."
                      : `Ce nombre de chiffres ne correspond pas à un numéro ${findCountry(
                          info.country
                        )?.name} habituel.`}
                  </p>
                )}
            </div>

            <div>
              <label className="eyebrow mb-1.5 block">
                Email — suivi du colis (optionnel)
              </label>

              <input
                type="email"
                value={
                  info.email
                }
                onChange={set(
                  "email"
                )}
                className={field}
                placeholder="awa@email.com"
                autoComplete="email"
              />
            </div>

            {err1 && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {err1}
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-pill bg-ink py-3.5 text-sm font-semibold text-paper disabled:opacity-50"
            >
              {creating
                ? "Un instant…"
                : "Suivant"}
            </button>
          </form>
        )}

        {/* ========================================================== *
         * ÉTAPE 2
         * ========================================================== */}

        {step === 2 && (
          <div className="animate-fadeUp">
            {(phase === "form" ||
              phase === "pushing") && (
              <>
                {/* -------------------------------------------------- *
                 * PROTECTION
                 * -------------------------------------------------- */}

                <div className="mb-5 flex items-center gap-3 rounded-xl border border-paper-line bg-paper-soft px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                    <ShieldCheck
                      size={17}
                      strokeWidth={2.2}
                    />
                  </div>

                  <p className="text-sm font-medium text-ink">
                    Votre commande et votre paiement sont protégés.
                  </p>
                </div>

                {/* -------------------------------------------------- *
                 * OPÉRATEURS
                 * -------------------------------------------------- */}

                <label className="eyebrow mb-2 block">
                  Opérateur Mobile Money
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {ops.map(
                    (op) => (
                      <button
                        key={op}
                        type="button"
                        onClick={() =>
                          selectOperator(
                            op
                          )
                        }
                        aria-pressed={
                          operator ===
                          op
                        }
                        className={`flex min-h-[56px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                          operator ===
                          op
                            ? "border-ink bg-ink text-paper"
                            : "border-paper-line bg-paper hover:border-ink"
                        }`}
                      >
                        <img
                          src={
                            OPERATOR_LOGO[
                              op
                            ]
                          }
                          alt={
                            OPERATOR_LABEL[
                              op
                            ]
                          }
                          className="h-9 w-9 shrink-0 rounded-full object-contain"
                        />

                        <span className="text-sm font-medium">
                          {
                            OPERATOR_LABEL[
                              op
                            ]
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>

                {/* -------------------------------------------------- *
                 * NUMÉRO
                 * -------------------------------------------------- */}

                <div className="mt-4">
                  <label className="eyebrow mb-1.5 block">
                    Numéro de paiement
                  </label>

                  <input
                    value={
                      payPhone
                    }
                    onChange={(
                      e
                    ) =>
                      setPayPhone(
                        e.target
                          .value
                      )
                    }
                    className={field}
                    inputMode="tel"
                    placeholder="07 00 00 00 00"
                  />

                  {payPhone
                    .length > 3 &&
                  !isPaymentPhoneValid() ? (
                    <p className="mt-1 text-xs text-warn">
                      {info.country ===
                      "CI"
                        ? "Le numéro ivoirien doit comporter 10 chiffres."
                        : `Ce nombre de chiffres ne correspond pas à un numéro ${findCountry(
                            info.country
                          )?.name} habituel.`}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-ink-faint">
                      Pré-rempli avec votre WhatsApp. Modifiable si votre compte Mobile Money est différent.
                    </p>
                  )}
                </div>

                {/* ================================================== *
                 * OTP
                 * ================================================== */}

                {otpRequired && (
                  <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <div className="text-sm font-semibold text-ink">
                      Vérification Orange
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {otpUssdCode ? (
                        <>
                          Composez{" "}
                          <span className="font-bold text-ink">
                            {otpUssdCode}
                          </span>{" "}
                          sur votre téléphone pour recevoir votre code OTP.
                        </>
                      ) : (
                        "Composez le code USSD de votre opérateur pour recevoir votre code OTP."
                      )}
                    </p>

                    <label className="eyebrow mt-3 mb-1.5 block">
                      Code OTP
                    </label>

                    <input
                      value={
                        otpCode
                      }
                      onChange={(
                        e
                      ) =>
                        setOtpCode(
                          e.target
                            .value
                        )
                      }
                      className={field}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Entrez votre code OTP"
                      maxLength={20}
                    />

                    <p className="mt-1.5 text-[11px] text-ink-faint">
                      Le code OTP est utilisé uniquement pour valider cette demande de paiement.
                    </p>
                  </div>
                )}

                {/* -------------------------------------------------- *
                 * MESSAGE
                 * -------------------------------------------------- */}

                {payMsg &&
                  otpRequired && (
                    <p className="mt-3 rounded-xl bg-paper-soft px-4 py-3 text-sm text-ink-soft">
                      {payMsg}
                    </p>
                  )}

                {/* -------------------------------------------------- *
                 * ERREUR
                 * -------------------------------------------------- */}

                {err2 && (
                  <p className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                    {err2}
                  </p>
                )}

                {/* -------------------------------------------------- *
                 * BOUTON DESKTOP
                 * -------------------------------------------------- */}

                <div className="hidden lg:block">
                  <button
                    type="button"
                    onClick={
                      pay
                    }
                    disabled={
                      !operator ||
                      !isPaymentPhoneValid() ||
                      phase ===
                        "pushing" ||
                      (otpRequired &&
                        !otpCode.trim())
                    }
                    className="mt-5 w-full rounded-pill bg-[#1F7955] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 animate-vantom-cta"
                  >
                    {phase ===
                    "pushing"
                      ? "Envoi…"
                      : `Payer et confirmer ma commande · ${formatXOF(
                          total
                        )}`}
                  </button>
                </div>
              </>
            )}

            {/* ====================================================== *
             * ATTENTE
             * ====================================================== */}

            {phase ===
              "waiting" && (
              <div className="py-8 text-center">
                <Spinner />

                <h2 className="display mt-4 text-xl">
                  Validez sur votre téléphone
                </h2>

                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
                  {payMsg ??
                    "Composez votre code Mobile Money sur l'écran qui s'affiche."}
                </p>

                <div className="mx-auto mt-5 flex max-w-xs items-center justify-center gap-2 rounded-xl bg-paper-soft px-4 py-3 text-xs text-ink-faint">
                  <ShieldCheck
                    size={16}
                    className="shrink-0"
                  />

                  <span>
                    Votre paiement est vérifié automatiquement.
                  </span>
                </div>

                <p className="tech mt-4 text-xs text-ink-faint">
                  Vérification automatique en cours…
                </p>
              </div>
            )}

            {/* ====================================================== *
             * PAYÉ
             * ====================================================== */}

            {phase ===
              "paid" && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <CheckCircle2
                    size={30}
                    strokeWidth={2}
                  />
                </div>

                <h2 className="display mt-4 text-xl">
                  Paiement confirmé
                </h2>

                <p className="mt-1 text-sm text-ink-soft">
                  Votre commande est confirmée.
                  Redirection en cours…
                </p>
              </div>
            )}

            {/* ====================================================== *
             * REFUSÉ
             * ====================================================== */}

            {phase ===
              "rejected" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger">
                  <XCircle
                    size={30}
                    strokeWidth={2}
                  />
                </div>

                <h2 className="display mt-4 text-xl">
                  Paiement non abouti
                </h2>

                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
                  {err2}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setPhase(
                      "form"
                    );
                    setErr2(null);
                  }}
                  className="mt-5 rounded-pill border border-ink px-6 py-3 text-sm font-semibold"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ *
       * RÉCAPITULATIF
       * ============================================================ */}

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-card border border-paper-line bg-paper-soft p-5">
          <div className="eyebrow mb-3">
            Votre commande
          </div>

          <ul className="space-y-2 text-sm">
            {lines.map(
              (l) => (
                <li
                  key={
                    l.variantId
                  }
                  className="flex justify-between gap-2"
                >
                  <span className="text-ink-soft">
                    {l.name}{" "}
                    <span className="tech text-xs">
                      ·{l.size}·×
                      {l.quantity}
                    </span>
                  </span>

                  <span className="tech">
                    {formatXOF(
                      l.price *
                        l.quantity
                    )}
                  </span>
                </li>
              )
            )}
          </ul>

          <div className="mt-3 border-t border-paper-line pt-3 text-sm">
            <div className="flex justify-between py-0.5">
              <span className="text-ink-soft">
                Sous-total
              </span>

              <span className="tech">
                {formatXOF(
                  subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between py-0.5">
              <span className="text-ink-soft">
                Livraison
              </span>

              <span className="tech text-ok">
                Gratuite
              </span>
            </div>

            <div className="mt-2 flex justify-between border-t border-paper-line pt-2">
              <span className="font-semibold">
                Total
              </span>

              <span className="tech text-lg">
                {formatXOF(
                  total
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-paper-line bg-paper px-3 py-2.5">
          <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-faint">
            <ShieldCheck
              size={15}
              className="shrink-0"
            />
            Montant recalculé et vérifié côté serveur.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== *
 * STEP DOT
 * ==================================================================== */

function StepDot({
  n,
  active,
  done,
  label,
}: {
  n: number;
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          done
            ? "bg-ok text-paper"
            : active
            ? "bg-ink text-paper"
            : "bg-paper-soft text-ink-faint"
        }`}
      >
        {done ? (
          <CheckCircle2
            size={16}
            strokeWidth={2.4}
          />
        ) : (
          n
        )}
      </span>

      <span
        className={`text-sm ${
          active || done
            ? "font-semibold text-ink"
            : "text-ink-faint"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

/* ==================================================================== *
 * SPINNER
 * ==================================================================== */

function Spinner() {
  return (
    <div
      className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-paper-line border-t-ink"
      role="status"
      aria-label="Chargement"
    />
  );
}