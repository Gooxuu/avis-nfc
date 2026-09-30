import { fileURLToPath } from 'node:url';
import { construire } from './lib/construire.mjs';

const ici = (chemin) => fileURLToPath(new URL(chemin, import.meta.url));

try {
  const { pages, avertissements } = construire({
    dossierRestaurants: ici('./restaurants'),
    dossierPolices: ici('./modele/polices'),
    dossierSortie: ici('./dist'),
  });
  for (const avertissement of avertissements) console.warn(`⚠ ${avertissement}`);
  console.log(`✔ ${pages.length} page(s) dans dist/ : ${pages.map((slug) => `/${slug}/`).join(', ')}`);
} catch (err) {
  console.error(`✖ ${err.message}`);
  process.exitCode = 1;
}
