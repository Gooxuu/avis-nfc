const OBLIGATOIRES = [
  'slug',
  'nom',
  'adresse',
  'googlePlaceId',
  'theme.fond',
  'theme.texte',
  'theme.principal',
  'theme.secondaire',
];

const COULEURS = ['fond', 'texte', 'principal', 'secondaire'];

function lire(objet, chemin) {
  return chemin.split('.').reduce((valeur, cle) => valeur?.[cle], objet);
}

// Refuse une fiche incomplète ou dangereuse avant qu'elle ne produise une page :
// le slug et les couleurs finissent dans l'URL et le CSS, les liens dans des href.
export function validerFiche(fiche) {
  const erreurs = [];

  for (const champ of OBLIGATOIRES) {
    const valeur = lire(fiche, champ);
    if (typeof valeur !== 'string' || valeur.trim() === '') erreurs.push(`${champ} manquant`);
  }

  if (fiche.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fiche.slug)) {
    erreurs.push('slug : minuscules, chiffres et tirets uniquement');
  }

  for (const nom of COULEURS) {
    const couleur = fiche.theme?.[nom];
    if (couleur && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(couleur)) {
      erreurs.push(`theme.${nom} : code hexadécimal attendu (#a06935)`);
    }
  }

  (fiche.liens ?? []).forEach((lien, i) => {
    if (!/^https?:\/\//.test(lien.url ?? '')) erreurs.push(`liens[${i}].url : doit commencer par https://`);
  });

  // Pas d'espace ni de ? & # : l'adresse est collée telle quelle dans un lien mailto.
  if (fiche.email && !/^[^\s@?&#]+@[^\s@?&#]+\.[a-z]{2,}$/i.test(fiche.email)) {
    erreurs.push('email : adresse e-mail invalide');
  }

  if (fiche.goatcounter && !/^[a-z0-9-]+$/.test(fiche.goatcounter)) {
    erreurs.push('goatcounter : code du compte GoatCounter attendu (lettres, chiffres, tirets)');
  }

  if (erreurs.length > 0) {
    throw new Error(`Fiche « ${fiche.slug ?? '?'} » invalide :\n- ${erreurs.join('\n- ')}`);
  }
}
