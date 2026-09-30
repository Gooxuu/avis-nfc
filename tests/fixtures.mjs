// Fiche complète et valide, recopiée puis modifiée par chaque test.
export function ficheValide() {
  return {
    slug: 'chez-marcel',
    nom: 'Chez Marcel',
    signature: 'Bistrot depuis 1950',
    adresse: '1 rue de la Paix, 75002 Paris',
    horaires: 'Tous les jours, 12h-23h',
    googlePlaceId: 'ChIJ_fiche_de_test_123',
    whatsapp: '06 12 34 56 78',
    liens: [
      { texte: 'Voir le menu', url: 'https://chez-marcel.fr/menu' },
      { texte: 'Instagram', url: 'https://www.instagram.com/chezmarcel/' },
    ],
    theme: {
      fond: '#f5efe6',
      texte: '#222222',
      principal: '#8a3b12',
      secondaire: '#2f5d50',
      police: 'im-fell-english-sc',
    },
    images: { bandeau: 'bandeau.png', ornement: 'ornement.png', icone: 'logo.svg' },
    goatcounter: null,
  };
}
