/* ==================================================================== *
 *  Relais SebPay — à déployer sur le serveur à IP fixe (ecloudserv,
 *  141.11.5.156) déclarée dans le tableau de bord SebPay.
 *
 *  Pourquoi : Vercel n'a pas d'IP de sortie fixe. SebPay whiteliste une
 *  IP précise. Ce petit serveur tourne, lui, sur cette IP fixe : le site
 *  (Vercel) lui envoie "appelle SebPay pour moi", il le fait
 *  physiquement depuis cette machine, et renvoie la réponse de SebPay
 *  telle quelle (même code HTTP, même corps JSON) — c'est un relais
 *  transparent, pas juste un statut enveloppé.
 *
 *  Contrat attendu par src/lib/payment/sebpay.ts (NE PAS changer sans
 *  mettre à jour les deux côtés) :
 *
 *    POST <RELAY_URL>             ex: http://141.11.5.156:25731/pay
 *    Header  x-relay-secret: <RELAY_SECRET>
 *    Body JSON: {
 *      method: "GET" | "POST",
 *      path: "/collections" | "/collections/<ref>",   (chemin API SebPay)
 *      publicKey: "...",
 *      secretKey: "...",
 *      body: <objet ou null>                            (payload SebPay)
 *    }
 *
 *    Réponse : MÊME code HTTP et MÊME corps JSON que ceux renvoyés par
 *    SebPay pour cet appel (passthrough transparent).
 *
 *  Sécurité :
 *   - Le domaine cible est CODÉ EN DUR (newapi.sebpay.bj) — même si le
 *     secret fuit, ce relais ne peut pas servir à appeler autre chose.
 *   - Toute requête doit porter l'en-tête x-relay-secret avec la valeur
 *     RELAY_SECRET (variable d'environnement, ou valeur par défaut
 *     ci-dessous si non définie).
 *
 *  Dépendances : AUCUNE — uniquement les modules natifs de Node.js
 *  (http, https). Fonctionne avec n'importe quel Node.js ≥ 18.
 *
 *  Démarrage : node index.js
 *  Port      : variable d'environnement PORT (par défaut 25731).
 * ==================================================================== */

const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 25731;
const RELAY_SECRET = process.env.RELAY_SECRET || "7fK9mQ2xV8rL4nT6pZ3wY5cH1sD0aB9eG7uJ4kN8";
const RELAY_PATH = process.env.RELAY_PATH || "/pay";
const SEBPAY_HOST = "newapi.sebpay.bj";
const SEBPAY_BASE_PATH = "/api/v1";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function callSebpay({ method, path, publicKey, secretKey, body }) {
  return new Promise((resolve, reject) => {
    const bodyStr = body != null ? JSON.stringify(body) : null;
    const reqOptions = {
      hostname: SEBPAY_HOST,
      path: `${SEBPAY_BASE_PATH}${path}`,
      method: method || "GET",
      headers: {
        "X-Public-Key": publicKey || "",
        "X-Secret-Key": secretKey || "",
        "Content-Type": "application/json",
        Host: SEBPAY_HOST,
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
      timeout: 20000,
    };
    const outgoing = https.request(reqOptions, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve({ status: res.statusCode || 502, body: Buffer.concat(chunks).toString("utf8") });
      });
    });
    outgoing.on("timeout", () => outgoing.destroy(new Error("Délai dépassé vers SebPay.")));
    outgoing.on("error", reject);
    if (bodyStr) outgoing.write(bodyStr);
    outgoing.end();
  });
}

const server = http.createServer(async (req, res) => {
  const sendJson = (status, obj) => {
    const payload = typeof obj === "string" ? obj : JSON.stringify(obj);
    res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) });
    res.end(payload);
  };

  if (req.method === "GET" && req.url === "/") {
    return sendJson(200, { status: "relais actif", sortie: { ip: null } });
  }

  if (req.method !== "POST" || req.url !== RELAY_PATH) {
    return sendJson(404, { error: "Not found" });
  }

  if (req.headers["x-relay-secret"] !== RELAY_SECRET) {
    return sendJson(401, { error: "Secret invalide." });
  }

  try {
    const raw = await readBody(req);
    const input = raw ? JSON.parse(raw) : {};
    if (!input.path || typeof input.path !== "string" || !input.path.startsWith("/")) {
      return sendJson(400, { error: "'path' manquant ou invalide (doit commencer par /)." });
    }
    const result = await callSebpay(input);
    // Passthrough transparent : même code HTTP, même corps que SebPay.
    return sendJson(result.status, result.body || "{}");
  } catch (err) {
    return sendJson(502, { error: "Échec du relais : " + (err && err.message ? err.message : String(err)) });
  }
});

server.listen(PORT, () => {
  console.log(`Relais SebPay actif sur le port ${PORT}${RELAY_PATH} → cible fixe https://${SEBPAY_HOST}`);
});
