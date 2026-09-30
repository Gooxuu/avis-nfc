import { test } from 'node:test';
import assert from 'node:assert/strict';
import { googleReviewUrl, whatsappUrl } from '../lib/liens.mjs';

test("le lien Google ouvre la fenêtre d'avis de la fiche", () => {
  assert.equal(
    googleReviewUrl('ChIJY7SUOdZv5kcRPVDKh7EP-uA'),
    'https://search.google.com/local/writereview?placeid=ChIJY7SUOdZv5kcRPVDKh7EP-uA',
  );
});

test('un mobile français écrit avec des espaces devient un numéro international', () => {
  assert.equal(
    whatsappUrl('06 12 34 56 78', 'Bonjour'),
    'https://wa.me/33612345678?text=Bonjour',
  );
});

test('un numéro déjà au format +33 donne le même lien', () => {
  assert.equal(
    whatsappUrl('+33 6 12 34 56 78', 'Bonjour'),
    'https://wa.me/33612345678?text=Bonjour',
  );
});

test('un numéro au format 0033 donne le même lien', () => {
  assert.equal(
    whatsappUrl('0033 6 12 34 56 78', 'Bonjour'),
    'https://wa.me/33612345678?text=Bonjour',
  );
});

test('le message prérempli est encodé pour ne pas casser le lien', () => {
  assert.equal(
    whatsappUrl('0612345678', 'Café & dessert ?'),
    'https://wa.me/33612345678?text=Caf%C3%A9%20%26%20dessert%20%3F',
  );
});

test('sans numéro, WhatsApp s’ouvre avec le message et laisse choisir le contact', () => {
  assert.equal(whatsappUrl(null, 'Bonjour'), 'https://wa.me/?text=Bonjour');
});
