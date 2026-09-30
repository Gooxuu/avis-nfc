import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rendrePage } from '../modele/page.mjs';
import { ficheValide } from './fixtures.mjs';

function hrefs(html) {
  return [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
}

test("le bouton d'avis Google est un lien direct, visible par tout le monde, sans script de tri", () => {
  const html = rendrePage(ficheValide());
  assert.ok(
    hrefs(html).includes('https://search.google.com/local/writereview?placeid=ChIJ_fiche_de_test_123'),
  );
  assert.doesNotMatch(html, /<script/);
});

test('le bouton privé ouvre WhatsApp vers le numéro du restaurant avec un message qui le nomme', () => {
  const lien = hrefs(rendrePage(ficheValide())).find((h) => h.startsWith('https://wa.me/'));
  assert.ok(lien, 'lien WhatsApp absent');
  const url = new URL(lien);
  assert.equal(url.pathname, '/33612345678');
  assert.match(url.searchParams.get('text'), /Chez Marcel/);
});

test("sans WhatsApp mais avec un e-mail, le bouton privé écrit un e-mail au restaurant", () => {
  const liens = hrefs(rendrePage({ ...ficheValide(), whatsapp: null, email: 'contact@chez-marcel.fr' }));
  assert.equal(liens.filter((h) => h.startsWith('https://wa.me/')).length, 0);
  const mail = liens.find((h) => h.startsWith('mailto:'));
  assert.ok(mail, 'lien e-mail absent');
  const url = new URL(mail);
  assert.equal(url.pathname, 'contact@chez-marcel.fr');
  assert.match(url.searchParams.get('body'), /Chez Marcel/);
});

test("avec WhatsApp et e-mail, les deux moyens de contact sont proposés", () => {
  const liens = hrefs(rendrePage({ ...ficheValide(), email: 'contact@chez-marcel.fr' }));
  assert.ok(liens.some((h) => h.startsWith('https://wa.me/33612345678')));
  assert.ok(liens.some((h) => h.startsWith('mailto:contact@chez-marcel.fr')));
});

test("sans numéro, la page ne prétend pas que le message arrive au restaurant", () => {
  const avec = rendrePage(ficheValide());
  const sans = rendrePage({ ...ficheValide(), whatsapp: null });
  assert.match(avec, /arrive directement sur le WhatsApp du restaurant/);
  assert.doesNotMatch(sans, /WhatsApp du restaurant/);
});

test('les textes de la fiche sont échappés', () => {
  const html = rendrePage({ ...ficheValide(), nom: 'Chez <Marcel> & Fils' });
  assert.match(html, /Chez &lt;Marcel&gt; &amp; Fils/);
  assert.doesNotMatch(html, /<Marcel>/);
});

// Chemins relatifs : la page marche à la racine d'un domaine comme dans un sous-dossier (github.io/avis-nfc/).
test('les images de la page sont cherchées à côté de la page', () => {
  const html = rendrePage(ficheValide());
  assert.match(html, /src="bandeau\.png"/);
  assert.match(html, /src="ornement\.png"/);
  assert.match(html, /href="logo\.svg"/);
});

test("sans bandeau, le nom du restaurant s'affiche en titre", () => {
  const fiche = ficheValide();
  fiche.images = {};
  const html = rendrePage(fiche);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /<h1[^>]*>Chez Marcel<\/h1>/);
});

test('les liens secondaires de la fiche sont tous présents', () => {
  const liens = hrefs(rendrePage(ficheValide()));
  assert.ok(liens.includes('https://chez-marcel.fr/menu'));
  assert.ok(liens.includes('https://www.instagram.com/chezmarcel/'));
});

test("sans liens secondaires, la page n'affiche pas de menu vide", () => {
  const html = rendrePage({ ...ficheValide(), liens: [] });
  assert.doesNotMatch(html, /<nav/);
});

test('les couleurs et la police de la fiche habillent la page', () => {
  const html = rendrePage(ficheValide());
  for (const couleur of ['#f5efe6', '#222222', '#8a3b12', '#2f5d50']) assert.ok(html.includes(couleur), couleur);
  assert.match(html, /url\("\.\.\/_commun\/polices\/im-fell-english-sc\.woff2"\)/);
});

test('avec un code GoatCounter, la page compte les visites sur ce compte', () => {
  const html = rendrePage({ ...ficheValide(), goatcounter: 'chez-marcel' });
  assert.match(html, /data-goatcounter="https:\/\/chez-marcel\.goatcounter\.com\/count"/);
  assert.match(html, /src="https:\/\/gc\.zgo\.at\/count\.js"/);
});
