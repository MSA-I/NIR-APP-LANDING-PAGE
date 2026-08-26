// Français. Reprend exactement la structure de i18n/he.js, chiffres compris —
// ils proviennent des mêmes captures du produit en fonctionnement.

export default {
  code: 'fr',
  dir: 'ltr',
  htmlLang: 'fr',
  path: 'fr',

  title: 'InPlace — achats, factures et paiements au même endroit',
  description:
    'Un système de contrôle des achats jusqu’au paiement. Un seul écran qui dit ce qui demande une action aujourd’hui, ce qui risque de coûter de l’argent, et où en est l’entreprise.',

  skip: 'Aller à l’action',
  mapLabel: 'Carte du parcours',
  langsLabel: 'Langues',
  noscript:
    'Cette page est conçue comme une expérience de défilement. Sans JavaScript, le contenu reste lisible et le compte reste ouvrable.',

  map: ['La pile', 'L’écart', 'La lumière', 'Contrôle', 'Le parcours', 'Factures', 'Exception', 'Paiement', 'Clôture'],

  ctaPrimary: 'Ouvrir un compte gratuit',
  ctaPrimaryHref: 'https://app.inplace.digital/signup',
  ctaSecondary: 'Réserver une démo',
  ctaSecondaryHref: 'https://inplace.digital/demo',
  fineprint: 'Sans carte bancaire. Vous pouvez commencer avec un seul fournisseur.',

  doc: {
    label: 'Le document qui vous suit',
    kind: 'Facture 2088',
    supplier: 'Naki VeZohar',
    amount: '1 062,00 ₪',
    states: [
      { text: 'Dans la pile',            tone: 'idle'  },
      { text: 'Jamais comparée',         tone: 'alert' },
      { text: 'Numérisée',               tone: 'idle'  },
      { text: 'Enregistrée',             tone: 'idle'  },
      { text: 'Rattachée à une commande', tone: 'idle' },
      { text: 'Devenue une ligne',       tone: 'done'  },
      { text: 'Vérifiée avec la commande', tone: 'done' },
      { text: 'Approuvée au paiement',   tone: 'done'  },
      { text: 'Partiellement payée',     tone: 'done'  },
    ],
  },

  copy: [
    {
      win: '0 0.088 0 0.40', at: 'ip-at-start',
      h1: 'Votre entreprise tient sur une&nbsp;pile',
      lede: 'Commandes, bons de livraison et factures, chacun à un endroit différent et à un moment différent. Ce qui tombe de la pile se découvre en fin de mois.',
    },
    {
      win: '0.098 0.198 0.18 0.18', at: 'ip-at-end',
      h2: 'Trois chiffres, une seule&nbsp;opération',
      lede: 'La commande fournisseur indiquait <strong class="ip-num">2 884,50 ₪</strong>. La facture reçue en demandait <strong class="ip-num ip-alert">4 720,00 ₪</strong>. Personne ne les a mises côte à côte.',
    },
    {
      win: '0.205 0.292 0.18 0.18', at: 'ip-at-middle',
      line: 'Il n’y a qu’une façon de régler cela : une place définie pour chaque&nbsp;chose.',
    },
    {
      win: '0.300 0.410 0.18 0.18', at: 'ip-at-start',
      kicker: 'Centre de contrôle',
      h2: 'Ce qui demande une action&nbsp;aujourd’hui',
      lede: '<strong class="ip-num">13</strong> tâches ouvertes dans toutes les files, <strong class="ip-num">17 825 ₪</strong> de factures ouvertes, et six alertes en attente de décision. Le tout sur un écran, sans rien avoir à chercher.',
    },
    {
      win: '0.420 0.530 0.18 0.18', at: 'ip-at-end',
      h2: 'Tout le parcours, un seul&nbsp;endroit',
      lede: 'Fournisseurs et tarifs, commandes d’achat, réception des marchandises, factures et avoirs, demandes de paiement, paiement et rapprochement bancaire. Une chaîne qui ne sort jamais.',
    },
    {
      win: '0.545 0.645 0.18 0.18', at: 'ip-at-middle',
      h2: 'Le papier devient le système',
      lede: 'Chaque document reçu obtient une ligne, un statut, et un lien vers la commande dont il provient.',
    },
    {
      win: '0.712 0.797 0.18 0.18', at: 'ip-at-start',
      h2: 'L’exception se signale&nbsp;seule',
      lede: 'Le système compare commande, réception et facture. Un écart de <strong class="ip-num ip-alert">1 835,50 ₪</strong> chez le même fournisseur ne passe pas. Il est signalé, et il attend une décision.',
    },
    {
      win: '0.806 0.890 0.18 0.18', at: 'ip-at-end',
      h2: 'L’argent ne part qu’une&nbsp;fois',
      lede: 'Une demande de paiement approuvée, exécutée par le comptable, le justificatif conservé, et la ligne close face à la banque. Séparation des pouvoirs complète, et une trace pour chaque action.',
    },
    {
      win: 'finale', at: 'ip-at-crown',
      h2: 'Tout à sa place.',
      lede: 'Et l’étape suivante est claire.',
    },
  ],
}
