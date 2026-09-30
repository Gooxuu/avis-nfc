// Lien qui ouvre directement la fenêtre « Écrire un avis » de la fiche Google.
export function googleReviewUrl(placeId) {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

// wa.me attend le numéro international sans « + » ni zéro initial : 06… → 336…
function numeroInternational(numero) {
  const chiffres = numero.replace(/[^\d+]/g, '');
  if (chiffres.startsWith('+')) return chiffres.slice(1);
  if (chiffres.startsWith('00')) return chiffres.slice(2);
  if (chiffres.startsWith('0')) return `33${chiffres.slice(1)}`;
  return chiffres;
}

// Sans numéro (démo), WhatsApp s'ouvre avec le message et laisse choisir le destinataire.
export function whatsappUrl(numero, message) {
  const texte = `?text=${encodeURIComponent(message)}`;
  return numero ? `https://wa.me/${numeroInternational(numero)}${texte}` : `https://wa.me/${texte}`;
}
