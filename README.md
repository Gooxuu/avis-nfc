# avis-nfc

Pages ouvertes par les cartes NFC d'avis : une page par restaurant, aux couleurs du restaurant, sur un
seul site statique.

Chaque page montre à **tous** les visiteurs le bouton « Laisser un avis sur Google » et le bouton
« Écrire au restaurant » (WhatsApp). Aucun tri par étoiles : filtrer les avis négatifs (review gating)
est interdit par Google et risqué en droit français.

## Ajouter un restaurant

1. Copier `restaurants/bouillon-du-coq.json` en `restaurants/<slug>.json` et remplir la fiche.
   Le `slug` doit être identique au nom du fichier : il finit dans l'URL gravée sur la carte
   (`https://<domaine>/<slug>`), donc **ne plus le changer** une fois les cartes programmées.
2. Mettre ses images dans `restaurants/<slug>/` (noms indiqués dans `images` de la fiche).
3. `npm run build` : génère `dist/`. Une fiche invalide bloque tout le site, avec le champ en cause.

| Champ | Obligatoire | Contenu |
|---|---|---|
| `slug`, `nom`, `adresse` | oui | |
| `googlePlaceId` | oui | Identifiant de la fiche Google (`ChIJ…`) |
| `theme.fond`, `theme.texte`, `theme.principal`, `theme.secondaire` | oui | Couleurs `#rrggbb` |
| `theme.police` | non | Nom d'un fichier de `modele/polices/` sans `.woff2` |
| `whatsapp` | non | Numéro du patron : prioritaire pour le bouton « Écrire au restaurant » |
| `email` | non | Adresse du restaurant : utilisée par ce bouton sans WhatsApp, sinon en lien « Ou par e-mail ». Sans les deux (démo), WhatsApp laisse choisir le contact |
| `signature`, `horaires`, `liens`, `images` | non | |
| `goatcounter` | non | Code du compte GoatCounter pour compter les passages ; `null` = aucun script |

## Commandes

- `npm test` : tests (`node --test`, aucune dépendance)
- `npm run build` : génère `dist/`. Les chemins sont relatifs : le site marche à la racine d'un
  domaine comme dans un sous-dossier.
- Aperçu : configuration `avis-nfc` (port 3003) dans `Desktop/Site/.claude/launch.json`

## Mise en ligne

Chaque push sur `main` lance `.github/workflows/publier.yml` : tests, build, puis publication de
`dist/` sur GitHub Pages (`https://gooxuu.github.io/avis-nfc/<slug>/`). Une fiche invalide ou un
test en échec bloque la publication.

Sur la carte, écrire l'adresse **avec le `/` final** (`…/bouillon-du-coq/`) : la page s'ouvre sans
redirection.
