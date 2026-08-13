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
  phoneDigits: number; // longueur du numéro national significatif (sans indicatif, sans 0 initial)
};

// phoneDigits = longueur usuelle du numéro mobile local, une fois l'indicatif
// et un éventuel 0 initial retirés (± 1 chiffre toléré à la validation,
// les plans de numérotation évoluant — ex: réforme CI 2021, Bénin 2024).
export const COUNTRIES: Country[] = [
  { code: "CI", name: "Côte d'Ivoire", dial: "225", operators: ["wave", "orange", "mtn", "moov"], phoneDigits: 10 },
  { code: "SN", name: "Sénégal",       dial: "221", operators: ["wave", "orange"], phoneDigits: 9 },
  { code: "ML", name: "Mali",          dial: "223", operators: ["wave", "orange"], phoneDigits: 8 },
  { code: "BF", name: "Burkina Faso",  dial: "226", operators: ["wave", "orange", "moov"], phoneDigits: 8 },
  { code: "CM", name: "Cameroun",      dial: "237", operators: ["orange", "mtn"], phoneDigits: 9 },
  { code: "BJ", name: "Bénin",         dial: "229", operators: ["mtn", "moov"], phoneDigits: 10 },
  { code: "TG", name: "Togo",          dial: "228", operators: ["moov"], phoneDigits: 8 },
  { code: "GH", name: "Ghana",         dial: "233", operators: ["mtn"], phoneDigits: 9 },
];

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/* Retire indicatif + 0 national initial -> ne garde que le numéro local. */
function localDigits(phone: string, dial: string): string {
  const d = phone.replace(/\D/g, "");
  const withoutDial = d.startsWith(dial) ? d.slice(dial.length) : d;
  return withoutDial.replace(/^0+/, "");
}

/* Vérifie que le nombre de chiffres est plausible pour ce pays
   (± 1 chiffre de tolérance sur la longueur usuelle attendue). */
export function isPlausiblePhone(phone: string, countryCode: string): boolean {
  const country = findCountry(countryCode);
  if (!country) return false;
  const len = localDigits(phone, country.dial).length;
  return Math.abs(len - country.phoneDigits) <= 1;
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
