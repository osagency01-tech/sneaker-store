# Relais SebPay — IP fixe

Vercel n'offre pas d'IP de sortie fixe pour ses fonctions serverless.
SebPay, lui, exige que les appels viennent d'une IP whitelistée. Ce
petit serveur (`index.js`, zéro dépendance) tourne sur le serveur à IP
fixe (ecloudserv, `141.11.5.156`) et sert d'intermédiaire : le site
(Vercel) lui demande "appelle SebPay pour moi", il le fait physiquement
depuis cette IP, et renvoie la réponse telle quelle.

## Déploiement sur ecloudserv

1. Uploadez `index.js` sur le serveur (remplace l'ancien relais).
2. Démarrage : `node index.js` (aucun `npm install` requis).
3. Le serveur écoute par défaut sur le port **25731** (comme avant).
   Pour changer : variable d'environnement `PORT`.
4. Le chemin de l'endpoint POST est `/pay` par défaut (variable
   `RELAY_PATH` pour changer). `GET /` reste un simple healthcheck.
5. Le secret partagé est déjà codé en dur dans le fichier
   (`7fK9mQ2xV8rL4nT6pZ3wY5cH1sD0aB9eG7uJ4kN8`, le même que celui déjà
   configuré). Pour le changer, définissez `RELAY_SECRET` dans
   l'environnement du process **et** mettez à jour `RELAY_SECRET`
   côté site (Vercel).

## Côté site (Vercel / .env.local)

`src/lib/payment/sebpay.ts` route déjà ses appels au travers de ces
deux variables (déjà utilisées dans le code, à définir dans Vercel →
Project Settings → Environment Variables, et dans `.env.local` en
local si besoin) :

```
RELAY_URL=http://141.11.5.156:25731/pay
RELAY_SECRET=7fK9mQ2xV8rL4nT6pZ3wY5cH1sD0aB9eG7uJ4kN8
```

Tant que ces deux variables sont présentes, le site route automatiquement
ses appels SebPay au travers du relais (POST sur `RELAY_URL` tel quel,
donc sur `/pay`). Si elles sont absentes, il appelle SebPay en direct
(utile en local si SebPay n'est pas encore branché en vrai).

**Important** : après avoir mis à jour les variables d'environnement sur
Vercel, il faut redéployer (Vercel ne relit les variables qu'au build/
déploiement suivant, pas à chaud).

## Vérifier que ça marche

```bash
curl http://141.11.5.156:25731/
# {"status":"relais actif","sortie":{"ip":null}}
```

Le relais ne peut appeler que `newapi.sebpay.bj` — codé en dur dans
`index.js` pour qu'une fuite du secret ne permette pas de s'en servir
pour autre chose.
