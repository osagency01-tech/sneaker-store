/* ==================================================================== *
 *  Pays & opérateurs Mobile Money supportés (zone XOF/Afrique de l'Ouest).
 *  Le checkout demande le pays -> filtre les opérateurs -> normalise le
 *  numéro avec le bon indicatif.
 * ==================================================================== */

export type Operator = "wave" | "orange" | "mtn" | "moov";

export const OPERATOR_LABEL: Record<Operator, string> = {
  wave: "Wave",
  orange: "Orange Money",
  mtn: "MTN MoMo",
  moov: "Moov Money",
};

export type Country = {
  code: string;        // ISO-2
  name: string;
  dial: string;        // indicatif sans +
  operators: Operator[];
};

export const COUNTRIES: Country[] = [
  { code: "CI", name: "Côte d'Ivoire", dial: "225", operators: ["wave", "orange", "mtn", "moov"] },
  { code: "SN", name: "Sénégal",       dial: "221", operators: ["wave", "orange"] },
  { code: "ML", name: "Mali",          dial: "223", operators: ["wave", "orange"] },
  { code: "BF", name: "Burkina Faso",  dial: "226", operators: ["wave", "orange", "moov"] },
  { code: "CM", name: "Cameroun",      dial: "237", operators: ["orange", "mtn"] },
  { code: "BJ", name: "Bénin",         dial: "229", operators: ["mtn", "moov"] },
  { code: "TG", name: "Togo",          dial: "228", operators: ["moov"] },
  { code: "GH", name: "Ghana",         dial: "233", operators: ["mtn"] },
];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/* Normalise un numéro en MSISDN international (chiffres seuls). */
export function normalizeMsisdn(phone: string, dial: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith(dial)) return d.slice(0, 15);
  // retire un éventuel 0 national en tête
  const local = d.replace(/^0+/, "");
  return (dial + local).slice(0, 15);
}

export function operatorsFor(countryCode: string): Operator[] {
  return findCountry(countryCode)?.operators ?? [];
}
