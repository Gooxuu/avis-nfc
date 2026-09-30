import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validerFiche } from '../lib/fiche.mjs';
import { ficheValide } from './fixtures.mjs';

test('une fiche complète est acceptée', () => {
  assert.doesNotThrow(() => validerFiche(ficheValide()));
});

test('une fiche sans WhatsApp est acceptée (démo avant signature)', () => {
  const fiche = { ...ficheValide(), whatsapp: null };
  assert.doesNotThrow(() => validerFiche(fiche));
});

test("l'erreur liste tous les champs obligatoires manquants", () => {
  const fiche = ficheValide();
  delete fiche.googlePlaceId;
  delete fiche.adresse;
  fiche.theme.principal = '';
  assert.throws(() => validerFiche(fiche), (err) => {
    assert.match(err.message, /chez-marcel/);
    assert.match(err.message, /googlePlaceId/);
    assert.match(err.message, /adresse/);
    assert.match(err.message, /theme\.principal/);
    return true;
  });
});

test("un slug avec majuscules ou espaces est refusé (il finit dans l'URL de la carte)", () => {
  for (const slug of ['Chez-Marcel', 'chez marcel', 'chez_marcel', '-chez']) {
    assert.throws(() => validerFiche({ ...ficheValide(), slug }), /slug/, slug);
  }
});

test("une couleur qui n'est pas un code hexadécimal est refusée", () => {
  const fiche = ficheValide();
  fiche.theme.fond = 'red; background:url(x)';
  assert.throws(() => validerFiche(fiche), /theme\.fond/);
});

test('un lien qui ne commence pas par http(s) est refusé', () => {
  const fiche = ficheValide();
  fiche.liens[1].url = 'javascript:alert(1)';
  assert.throws(() => validerFiche(fiche), /liens\[1\]\.url/);
});

test('une adresse e-mail valide est acceptée', () => {
  assert.doesNotThrow(() => validerFiche({ ...ficheValide(), email: 'contact@chez-marcel.fr' }));
});

test('une adresse e-mail mal formée ou qui ajoute des paramètres au lien est refusée', () => {
  for (const email of ['contact@', 'contact chez@marcel.fr', 'contact@marcel.fr?cc=pirate@x.fr']) {
    assert.throws(() => validerFiche({ ...ficheValide(), email }), /email/, email);
  }
});

test('un code GoatCounter avec des caractères interdits est refusé', () => {
  assert.throws(
    () => validerFiche({ ...ficheValide(), goatcounter: 'mon.site/../x' }),
    /goatcounter/,
  );
});
