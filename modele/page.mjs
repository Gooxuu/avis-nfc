import { readFileSync } from 'node:fs';
import { googleReviewUrl, whatsappUrl, emailUrl } from '../lib/liens.mjs';

const STYLE = readFileSync(new URL('./style.css', import.meta.url), 'utf8');

const ICONE_ETOILE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
const ICONE_MESSAGE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 5h16v11H9l-5 4z"/></svg>';
const ICONE_ENVELOPPE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M3 6h18v12H3zM3 6l9 7 9-7"/></svg>';

function echapper(texte) {
  return String(texte)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function enTete(fiche, images) {
  if (!images.bandeau) {
    const signature = fiche.signature ? `\n    <p class="signature">${echapper(fiche.signature)}</p>` : '';
    return `<h1 class="titre">${echapper(fiche.nom)}</h1>${signature}`;
  }
  const alt = [fiche.nom, fiche.signature].filter(Boolean).join(' — ');
  return `<img class="bandeau" src="${echapper(images.bandeau)}" alt="${echapper(alt)}">
    <h1 class="visuellement-cache">${echapper(fiche.nom)}</h1>`;
}

function police(fiche) {
  if (!fiche.theme.police) return '';
  return `@font-face {
  font-family: 'Marque';
  src: url("../_commun/polices/${fiche.theme.police}.woff2") format('woff2');
  font-display: swap;
}
:root { --police-marque: 'Marque'; }
`;
}

// WhatsApp du patron en priorité (e-mail en lien secondaire), sinon l'e-mail du restaurant,
// sinon (démo) WhatsApp sans destinataire.
function contactPrive(fiche, message) {
  const mail = fiche.email ? emailUrl(fiche.email, 'Retour sur ma visite', message) : null;
  if (fiche.whatsapp) {
    const ouMail = mail ? ` <a href="${echapper(mail)}">Ou par e-mail</a>` : '';
    return {
      href: whatsappUrl(fiche.whatsapp, message),
      icone: ICONE_MESSAGE,
      note: `\n      <p class="note">Votre message arrive directement sur le WhatsApp du restaurant.${ouMail}</p>`,
    };
  }
  if (mail) {
    return {
      href: mail,
      icone: ICONE_ENVELOPPE,
      note: '\n      <p class="note">Votre message arrive directement dans la boîte e-mail du restaurant.</p>',
    };
  }
  return { href: whatsappUrl(null, message), icone: ICONE_MESSAGE, note: '' };
}

function compteur(fiche) {
  if (!fiche.goatcounter) return '';
  return `\n  <script data-goatcounter="https://${fiche.goatcounter}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`;
}

// Page ouverte par la carte NFC. Le bouton Google est le même pour tous les visiteurs :
// aucune question préalable, aucun tri selon la satisfaction (règles Google, droit français).
export function rendrePage(fiche) {
  const images = fiche.images ?? {};
  const { fond, texte, principal, secondaire } = fiche.theme;
  const message = `Bonjour ${fiche.nom}, je voulais vous faire un retour sur ma visite : `;

  const icone = images.icone ? `\n  <link rel="icon" href="${echapper(images.icone)}">` : '';
  const ornement = images.ornement
    ? `<img class="ornement" src="${echapper(images.ornement)}" alt="">`
    : '<hr class="separateur">';
  const contact = contactPrive(fiche, message);
  const liens = (fiche.liens ?? [])
    .map((lien) => `<a href="${echapper(lien.url)}" rel="noopener">${echapper(lien.texte)}</a>`)
    .join('\n      ');
  const menuLiens = liens
    ? `\n\n    <nav class="liens" aria-label="Liens du restaurant">\n      ${liens}\n    </nav>`
    : '';
  const horaires = fiche.horaires ? `\n      <p>${echapper(fiche.horaires)}</p>` : '';

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="${fond}">
  <title>Votre avis — ${echapper(fiche.nom)}</title>${icone}
  <style>
${police(fiche)}:root {
  --fond: ${fond};
  --texte: ${texte};
  --principal: ${principal};
  --secondaire: ${secondaire};
}
${STYLE}  </style>${compteur(fiche)}
</head>
<body>
  <main class="page">
    ${enTete(fiche, images)}

    <section class="bloc" aria-labelledby="merci">
      <p class="merci" id="merci">Merci de votre visite&nbsp;!</p>
      <p class="invite">Un mot sur votre repas&nbsp;? Votre avis aide d’autres convives à nous découvrir.</p>
      <a class="bouton bouton-google" href="${echapper(googleReviewUrl(fiche.googlePlaceId))}" data-goatcounter-click="avis-google">${ICONE_ETOILE}<span>Laisser un avis sur Google</span></a>
    </section>

    ${ornement}

    <section class="bloc" aria-labelledby="question">
      <p class="question" id="question">Une remarque, un souci&nbsp;? L’équipe est à votre écoute.</p>
      <a class="bouton bouton-prive" href="${echapper(contact.href)}" data-goatcounter-click="message-prive">${contact.icone}<span>Écrire au restaurant</span></a>${contact.note}
    </section>${menuLiens}

    <footer class="pied">
      <address>${echapper(fiche.adresse)}</address>${horaires}
    </footer>
  </main>
</body>
</html>
`;
}
