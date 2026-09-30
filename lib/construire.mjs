import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { validerFiche } from './fiche.mjs';
import { rendrePage } from '../modele/page.mjs';

function lireFiches(dossierRestaurants) {
  const fichiers = readdirSync(dossierRestaurants).filter((f) => f.endsWith('.json')).sort();
  const erreurs = [];
  const fiches = [];

  for (const fichier of fichiers) {
    try {
      const fiche = JSON.parse(readFileSync(join(dossierRestaurants, fichier), 'utf8'));
      validerFiche(fiche);
      if (fiche.slug !== basename(fichier, '.json')) {
        throw new Error(`slug « ${fiche.slug} » différent du nom du fichier`);
      }
      fiches.push(fiche);
    } catch (err) {
      erreurs.push(`${fichier} : ${err.message}`);
    }
  }

  if (erreurs.length > 0) throw new Error(`Site non construit.\n${erreurs.join('\n')}`);
  return fiches;
}

// Tout ou rien : toutes les fiches sont validées avant d'écrire la moindre page,
// puis le dossier de sortie est reconstruit de zéro (un resto retiré disparaît du site).
export function construire({ dossierRestaurants, dossierPolices, dossierSortie }) {
  const fiches = lireFiches(dossierRestaurants);
  const avertissements = [];

  rmSync(dossierSortie, { recursive: true, force: true });
  cpSync(dossierPolices, join(dossierSortie, '_commun', 'polices'), { recursive: true });

  for (const fiche of fiches) {
    const dossierPage = join(dossierSortie, fiche.slug);
    const dossierImages = join(dossierRestaurants, fiche.slug);
    if (existsSync(dossierImages)) cpSync(dossierImages, dossierPage, { recursive: true });
    mkdirSync(dossierPage, { recursive: true });
    writeFileSync(join(dossierPage, 'index.html'), rendrePage(fiche));
    if (!fiche.whatsapp) {
      avertissements.push(`${fiche.slug} : pas de numéro WhatsApp, le message privé laisse le client choisir le destinataire.`);
    }
  }

  return { pages: fiches.map((f) => f.slug), avertissements };
}
