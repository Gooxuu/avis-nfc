import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { construire } from '../lib/construire.mjs';
import { ficheValide } from './fixtures.mjs';

// Crée un projet jetable : restaurants/<slug>.json + restaurants/<slug>/ + modele/polices/.
function projet(fiches) {
  const racine = mkdtempSync(join(tmpdir(), 'avis-nfc-'));
  const restaurants = join(racine, 'restaurants');
  const polices = join(racine, 'polices');
  mkdirSync(restaurants);
  mkdirSync(polices);
  writeFileSync(join(polices, 'im-fell-english-sc.woff2'), 'police');
  for (const [fichier, fiche] of Object.entries(fiches)) {
    writeFileSync(join(restaurants, `${fichier}.json`), JSON.stringify(fiche));
    mkdirSync(join(restaurants, fichier));
    writeFileSync(join(restaurants, fichier, 'bandeau.png'), 'image');
  }
  const options = { dossierRestaurants: restaurants, dossierPolices: polices, dossierSortie: join(racine, 'dist') };
  return { racine, options };
}

test('chaque fiche donne sa page, ses images et la police commune', () => {
  const { racine, options } = projet({ 'chez-marcel': ficheValide() });
  construire(options);
  const page = readFileSync(join(racine, 'dist', 'chez-marcel', 'index.html'), 'utf8');
  assert.match(page, /writereview\?placeid=ChIJ_fiche_de_test_123/);
  assert.equal(readFileSync(join(racine, 'dist', 'chez-marcel', 'bandeau.png'), 'utf8'), 'image');
  assert.ok(existsSync(join(racine, 'dist', '_commun', 'polices', 'im-fell-english-sc.woff2')));
});

test("une fiche invalide bloque tout le site, rien n'est écrit", () => {
  const cassee = { ...ficheValide(), slug: 'le-bistrot' };
  delete cassee.googlePlaceId;
  const { racine, options } = projet({ 'chez-marcel': ficheValide(), 'le-bistrot': cassee });
  assert.throws(() => construire(options), /le-bistrot\.json[\s\S]*googlePlaceId/);
  assert.equal(existsSync(join(racine, 'dist')), false);
});

test('le slug doit correspondre au nom du fichier de la fiche', () => {
  const { options } = projet({ 'chez-marcel': { ...ficheValide(), slug: 'chez-marcelle' } });
  assert.throws(() => construire(options), /chez-marcel\.json[\s\S]*slug/);
});

test('une fiche sans WhatsApp ni e-mail est construite avec un avertissement', () => {
  const { options } = projet({ 'chez-marcel': { ...ficheValide(), whatsapp: null } });
  const { pages, avertissements } = construire(options);
  assert.deepEqual(pages, ['chez-marcel']);
  assert.equal(avertissements.length, 1);
  assert.match(avertissements[0], /chez-marcel[\s\S]*WhatsApp/);
});

test("une fiche sans WhatsApp mais avec un e-mail n'a pas d'avertissement", () => {
  const fiche = { ...ficheValide(), whatsapp: null, email: 'contact@chez-marcel.fr' };
  const { avertissements } = construire(projet({ 'chez-marcel': fiche }).options);
  assert.deepEqual(avertissements, []);
});

test("une page d'un restaurant retiré ne reste pas dans le site", () => {
  const { racine, options } = projet({ 'chez-marcel': ficheValide() });
  mkdirSync(join(racine, 'dist', 'ancien-resto'), { recursive: true });
  writeFileSync(join(racine, 'dist', 'ancien-resto', 'index.html'), 'vieux');
  construire(options);
  assert.equal(existsSync(join(racine, 'dist', 'ancien-resto')), false);
});
