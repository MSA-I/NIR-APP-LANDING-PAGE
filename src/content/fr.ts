/* French copy. Mirrors he.ts exactly: same keys, same array lengths, same
   machine values (ids, states, role keys). Only human-visible text differs.
   Claims policy (docs/BRIEF.md §11): no savings percentages, no SLA/uptime,
   no user/branch/storage quotas, no customer logos, no invented benchmarks.
   Demo fixtures stay an Israeli business (shekel amounts, Tal-Fresh).
   Plan prices are USD and come from src/lib/i18n.ts, not from here.
   Typography: vouvoiement throughout, typographic apostrophe, and a
   non-breaking space before ':', '?', '!' and inside the guillemets. */

import type { Dict } from './he';

export const fr: Dict = {
  meta: {
    title: 'InPlace · Voyez avant de payer',
    description:
      'InPlace relie fournisseurs, tarifs, commandes, réception des marchandises, factures et paiements, pour que vous sachiez en quelques secondes ce qui exige une action avant que l’argent ne sorte. Essayez la démo en direct, sans inscription.',
  },

  nav: {
    product: 'Produit',
    assistant: 'Assistant',
    demo: 'Démo en direct',
    pricing: 'Tarifs',
    security: 'Sécurité',
    faq: 'FAQ',
    login: 'Connexion à InPlace',
    cta: 'Essayez la démo',
    ctaShort: 'Démo',
    langLabel: 'Langue',
    menuLabel: 'Menu',
  },

  hero: {
    h1: 'Voyez avant de payer.',
    h1Accent: 'avant',
    sub: 'InPlace relie fournisseurs, tarifs, commandes, réception des marchandises, factures et paiements, pour que vous sachiez en quelques secondes ce qui exige une action avant que l’argent ne sorte.',
    ctaPrimary: 'Essayez la démo',
    ctaSecondary: 'Comment ça marche',
    demoNote: 'Toutes les démonstrations de cette page fonctionnent sur des données de démo.',
  },

  /* Hero product-UI replica: a blocked invoice, the product's real semantics. */
  heroUi: {
    screenTitle: 'Contrôle de facture',
    invoiceId: 'INV-2311',
    supplier: 'Tal-Fresh Marketing Ltd.',
    statusBlocked: 'Paiement bloqué',
    reasonTitle: 'Motif du blocage',
    reason: 'Le prix de la ligne dépasse le prix convenu sur la commande',
    lineName: 'Tomates cerises, cageot de 5 kg',
    ordered: 'Commandé',
    billed: 'Facturé',
    delta: 'Écart',
    deltaValue: '+1 240 ₪',
    chain: [
      { label: 'Commande 4127', state: 'done' },
      { label: 'Réception', state: 'done' },
      { label: 'Facture', state: 'alert' },
    ],
    action: 'Ouvrir le dossier',
    asOf: 'À jour à l’instant · Données de démo',
  },

  proof: {
    h2: 'Pas un tableau de bord de plus. Un moteur de décision.',
    items: [
      { title: 'Une chaîne complète', body: 'Du fournisseur et du tarif jusqu’au paiement et au rapprochement bancaire. Sans trou dans le parcours.' },
      { title: 'Chaque chiffre a sa preuve', body: 'Chaque montant renvoie à une source que vous pouvez ouvrir : commande, réception, facture ou opération bancaire.' },
      { title: 'Trois rôles, des droits réels', body: 'Le dirigeant, les achats et le comptable voient chacun exactement ce qui leur est permis.' },
      { title: 'Journal d’audit avec motif', body: 'Chaque action sensible est enregistrée : qui, quand et pourquoi. Le motif est enregistré avec l’action, jamais ajouté après coup.' },
    ],
  },

  leaks: {
    h2: 'Où l’argent s’échappe-t-il ?',
    sub: 'Quatre situations qui arrivent dans toute entreprise. La seule différence, c’est le moment où vous les repérez.',
    items: [
      {
        title: 'Une hausse de prix silencieuse',
        before: 'Le prix facturé diffère du tarif et de la commande, et personne ne compare.',
        after: 'InPlace affiche l’écart chiffré et l’origine du prix, avant l’approbation.',
        result: 'Vous traitez avant de payer.',
        badge: 'Écart de prix',
      },
      {
        title: 'Une réception partielle',
        before: '20 commandés, 14 reçus, et la facture porte sur 20.',
        after: 'Rapprochement automatique entre commande, réception et facture, ligne par ligne.',
        result: 'Vous ne payez pas ce qui n’est jamais arrivé.',
        badge: 'Écart de quantité',
      },
      {
        title: 'Un avoir oublié',
        before: 'Le fournisseur a promis un avoir, et il s’est perdu entre deux appels.',
        after: 'L’encours reste visible par fournisseur et par document, jusqu’au règlement effectif de l’avoir.',
        result: 'L’argent reste suivi.',
        badge: 'Avoir ouvert',
      },
      {
        title: 'Un paiement sans chaîne derrière lui',
        before: 'Une facture avance vers le paiement sans commande ni approbation complète derrière elle.',
        after: 'Elle passe en statut bloqué, avec le motif et les preuves sous vos yeux.',
        result: 'Le contrôle reste chez vous.',
        badge: 'Paiement bloqué',
      },
    ],
  },

  trail: {
    h2: 'Le parcours de l’argent',
    sub: 'Un même document traverse toutes les étapes. Chaque étape déclenche un contrôle, et chaque contrôle laisse une preuve.',
    stations: [
      { title: 'Fournisseur et tarif', body: 'Le prix convenu est conservé avec l’historique complet des modifications.' },
      { title: 'Bon de commande', body: 'Le prix est verrouillé au moment de la commande. C’est la référence de toutes les comparaisons qui suivent.' },
      { title: 'Réception des marchandises', body: 'Ce qui arrive est compté face à ce qui a été commandé, ligne par ligne.' },
      { title: 'Facture', body: 'Triple rapprochement : commande, réception, facture. L’écart est arrêté ici.', alert: 'Écart de 1 240 ₪ détecté avant le paiement' },
      { title: 'Avoir et demande de paiement', body: 'Les avoirs restent suivis jusqu’à leur clôture. Un paiement ne part jamais que d’une demande approuvée.' },
      { title: 'Paiement et rapprochement bancaire', body: 'L’exécution est enregistrée, le justificatif est conservé, et l’opération est rapprochée en banque.' },
    ],
    close: 'Voilà toute l’histoire : voir l’écart avant qu’il ne devienne un paiement.',
  },

  assistant: {
    h2: 'Interrogez votre entreprise. Obtenez une réponse avec les preuves.',
    sub: 'L’assistant InPlace n’est pas un chatbot. Il ne répond qu’à partir de chiffres calculés par le serveur, et chaque réponse porte sa source, sa date de mise à jour et son autorisation.',
    tryLabel: 'Questions types',
    roleLabel: 'Rôle',
    runs: [
      {
        id: 'blocked',
        question: 'Pourquoi la facture Tal-Fresh est-elle bloquée ?',
        answer: 'La facture dépasse de 1 240 ₪ le prix convenu sur la commande.',
        facts: [
          { label: 'Écart de prix sur la ligne', value: '+1 240 ₪' },
          { label: 'Lignes contrôlées', value: '12' },
          { label: 'Code motif', value: 'Prix supérieur à la commande' },
        ],
        source: 'Contrôle de la facture INV-2311',
        state: 'complete',
        roles: ['owner', 'office', 'accountant'],
      },
      {
        id: 'credits',
        question: 'Combien d’argent est en attente d’avoir ?',
        answer: 'Trois avoirs ouverts, 2 180 ₪ au total, chez deux fournisseurs.',
        facts: [
          { label: 'Total des avoirs ouverts', value: '2 180 ₪' },
          { label: 'Fournisseurs', value: '2' },
          { label: 'Avoir le plus ancien', value: '18 jours' },
        ],
        source: 'Avoirs ouverts par fournisseur',
        state: 'complete',
        roles: ['owner', 'office'],
      },
      {
        id: 'orders',
        question: 'Quelles commandes ont été envoyées sans être confirmées ?',
        answer: 'Deux commandes attendent la confirmation du fournisseur. La plus ancienne attend depuis quatre jours.',
        facts: [
          { label: 'Commandes en attente', value: '2' },
          { label: 'Attente la plus longue', value: '4 jours' },
        ],
        source: 'Commandes au statut Envoyée',
        state: 'complete',
        roles: ['owner', 'office'],
      },
      {
        id: 'bank',
        question: 'Quelles opérations bancaires ne sont pas rapprochées ?',
        answer: 'Quatre opérations attendent un rapprochement, pour un total de 9 640 ₪.',
        facts: [
          { label: 'Opérations non rapprochées', value: '4' },
          { label: 'Montant cumulé', value: '9 640 ₪' },
        ],
        source: 'Rapprochement bancaire',
        state: 'complete',
        roles: ['owner', 'accountant'],
        notPermittedAnswer: 'Les opérations bancaires ne sont pas accessibles dans le rôle achats.',
      },
    ],
    stateLabels: {
      complete: 'Réponse complète',
      partial: 'Réponse partielle',
      not_measured: 'Non mesuré',
      not_permitted: 'Non autorisé dans ce rôle',
    },
    windowLabel: 'Fenêtre : 30 derniers jours',
    asOfLabel: 'Au 24.08.2026, 09:40',
    openSource: 'Ouvrir la source',
    demoNote: 'Démonstration déterministe sur des données de démo. Dans le produit, chaque réponse est vérifiée au regard de vos propres droits.',
  },

  roles: {
    h2: 'Une seule vérité. Trois vues.',
    sub: 'C’est la facture que vous avez vue en haut de page, INV-2311, en trois vues. Chacune voit exactement ce qui lui est permis, et pas un gramme de plus.',
    tabs: [
      {
        id: 'owner',
        label: 'Dirigeant',
        summary: 'Voit tout, approuve et contrôle. N’exécute pas les paiements.',
        sees: ['La vue d’ensemble et le parcours de l’argent', 'Approbation des factures et des demandes de paiement', 'Rapports, audit et avoirs'],
        blocked: 'L’exécution effective revient au comptable.',
      },
      {
        id: 'office',
        label: 'Achats',
        summary: 'Pilote le parcours d’achat : fournisseurs, commandes, réception et factures.',
        sees: ['Fournisseurs, tarifs et commandes', 'Réception des marchandises et contrôle des factures', 'Statut des factures et des avoirs dans le contexte achat'],
        blocked: 'Ne voit ni les paiements, ni la banque, ni les rapports financiers, ni l’audit financier.',
      },
      {
        id: 'accountant',
        label: 'Comptable',
        summary: 'Ne voit que les factures approuvées, exécute les paiements et rapproche la banque.',
        sees: ['Factures approuvées et contexte minimal', 'Exécution des paiements approuvés et dépôt du justificatif', 'Rapprochements bancaires, avoirs et export mensuel'],
        blocked: 'Ne modifie ni les commandes, ni les produits, ni les tarifs.',
      },
    ],
    invoiceCaption: 'Facture INV-2311 vue par',
    invoiceTotal: 'total de la facture',
  },

  demo: {
    h2: 'Essayez par vous-même. Sans inscription.',
    sub: 'Deux minutes, quatre scénarios, trois rôles. Le tout sur des données de démo.',
    stepRole: 'Choisissez un rôle',
    stepScenario: 'Choisissez un scénario',
    scenarios: [
      { id: 'price', label: 'Hausse de prix' },
      { id: 'receipt', label: 'Réception partielle' },
      { id: 'credit', label: 'Avoir ouvert' },
      { id: 'payment', label: 'Paiement bloqué' },
    ],
    evidenceTitle: 'La chaîne de preuves',
    askAssistant: 'Que dit l’assistant ?',
    summaryTitle: 'Ce qu’InPlace a arrêté ici',
    ctaPilot: 'Ouvrez un espace pilote',
    restart: 'Un autre scénario',
    demoBadge: 'Données de démo',
    stepOf: 'Scénario {n} sur {total}',
    nextScenario: 'Scénario suivant',
    tourDone: 'Vous avez vu les quatre scénarios',
  },

  roi: {
    h2: 'Combien cela vaut‑il pour votre entreprise ?',
    sub: 'Un calculateur transparent : vous fixez les hypothèses, nous faisons seulement le calcul. C’est une estimation, pas une promesse.',
    inputs: {
      docs: 'Documents par mois (factures et commandes)',
      minutes: 'Minutes de contrôle manuel par document',
      hourly: 'Coût horaire chargé ($)',
      spend: 'Volume d’achats mensuel ($)',
      variance: 'Taux estimé d’écarts de prix et de quantité (%)',
      recoverable: 'Part des écarts que vous pouvez bloquer ou récupérer (%)',
      cost: 'Coût mensuel estimé d’InPlace ($)',
    },
    results: {
      title: 'Le résultat, en trois scénarios',
      conservative: 'Prudent',
      base: 'Base',
      optimistic: 'Optimiste',
      timeSaved: 'Heures de contrôle économisées par mois',
      leakage: 'Valeur des écarts interceptés par mois',
      monthly: 'Valeur mensuelle estimée',
      yearly: 'Valeur annuelle estimée',
      roi: 'Ratio de retour annuel estimé',
      formulaTitle: 'Comment nous avons calculé',
      formula:
        'Gain opérationnel = documents × minutes × coût horaire ÷ 60. Écarts détectés = volume d’achats × taux d’écarts × taux de blocage. Valeur annuelle = (gain + écarts) × 12, face au coût de l’abonnement.',
      disclaimer: 'Simple estimation. Aucune référence sectorielle ici, aucune promesse d’économies.',
      disclaimerDefault: 'Ces chiffres sont nos hypothèses de départ, pas les vôtres. Modifiez un champ et le calcul suit.',
      disclaimerEdited: 'Ce calcul utilise les hypothèses que vous avez saisies.',
    },
  },

  pricing: {
    h2: 'Toutes les fonctionnalités, sur toutes les formules.',
    sub: 'Les formules ne diffèrent que par le volume : documents, pages numérisées et questions à l’assistant. Sans surprise.',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    yearlyNote: 'En paiement annuel : le prix de 10 mois',
    perMonth: 'par mois',
    perYear: 'par an',
    vatNote: 'Prix hors taxes.',
    plans: {
      free: { name: 'Gratuit', tagline: 'Commencer à voir' },
      basic: { name: 'Essentiel', tagline: 'Pour une petite entreprise régulière' },
      pro: { name: 'Pro', tagline: 'Pour un rythme de travail soutenu' },
      premium: { name: 'Premium', tagline: 'Pour les très gros volumes', highlight: 'Volume complet' },
    },
    quota: {
      docs: 'Documents par mois',
      pages: 'Pages numérisées par mois',
      assistant: 'Questions à l’assistant par mois',
    },
    introNote: 'Sur toutes les formules : 50 questions à l’assistant pendant les 30 premiers jours, en plus du quota mensuel.',
    freeCta: 'Ouvrir un compte gratuit',
    planCta: {
      free: 'Ouvrir un compte gratuit',
      basic: 'Commencer avec Base',
      pro: 'Commencer avec Pro',
      premium: 'Commencer avec Premium',
    },
    planCtaNote: 'Départ gratuit, changement quand vous voulez',
    upgradeNote: 'Chaque formule commence par un compte gratuit, sans carte bancaire. Vous changez de formule depuis le système, quand vous êtes prêt.',
  },

  security: {
    h2: 'Conçu comme un produit qui touche à l’argent.',
    sub: 'Parce qu’il en est un. Ce ne sont pas des promesses marketing, mais les principes sur lesquels le produit est construit.',
    items: [
      { title: 'Isolation des organisations dans la base', body: 'Chaque ligne appartient à une organisation, et une politique au niveau de la base impose la frontière. L’isolation est un principe fondateur, pas une fonctionnalité.' },
      { title: 'Trois rôles, des frontières réelles', body: 'Le dirigeant, les achats et le comptable disposent de surfaces d’accès distinctes. Les droits sont appliqués sur le serveur, pas dans l’interface.' },
      { title: 'Journal d’audit avec motif', body: 'Chaque action sensible est enregistrée : qui l’a effectuée, quand et pour quel motif. Les enregistrements financiers font l’objet d’une suppression logique uniquement.' },
      { title: 'Un assistant qui n’invente pas de chiffres', body: 'Chaque réponse s’appuie sur une valeur calculée par le serveur, avec sa source et son autorisation. Une réponse sans preuve est rejetée.' },
      { title: 'Un paiement seulement au bout de la chaîne', body: 'Un paiement passe toujours par une demande approuvée, une authentification renforcée, un motif et une écriture d’audit.' },
      { title: 'Cette démo est entièrement isolée', body: 'La page que vous lisez est statique, fonctionne sur des données de démo, et n’a aucun accès au produit ni à la base de données.' },
    ],
  },

  story: {
    /* PLACEHOLDER: to be replaced with the real pilot customer's words (owner action).
       Launch gate: docs/BRIEF.md §11 blocks publishing until replaced. */
    h2: 'Sur le terrain',
    quote: '« Avant InPlace, nous découvrions les écarts une fois l’argent déjà parti. Aujourd’hui, la facture s’arrête avant, et le motif et la preuve sont là, à l’écran. »',
    attribution: 'Dirigeant, client pilote',
    placeholderNote: 'Citation illustrative issue du programme pilote. Elle sera remplacée par un témoignage client complet.',
  },

  faq: {
    h2: 'Questions fréquentes',
    items: [
      {
        q: 'InPlace remplace-t-il notre ERP ou notre comptabilité ?',
        a: 'Non. InPlace se place au-dessus du processus achats et paiements et ajoute une couche de contrôle et de décision : qui a approuvé, ce qui a été vérifié, et où se situe l’écart. Votre comptabilité continue de fonctionner exactement comme avant.',
      },
      {
        q: 'Combien de temps faut-il pour démarrer ?',
        a: 'Vous ouvrez un compte gratuit, importez vos fournisseurs et un tarif, puis vous commencez à commander et à saisir des documents. Aucun projet de déploiement, aucun engagement.',
      },
      {
        q: 'Est-ce que cela fonctionne sur mobile ?',
        a: 'Oui. L’interface a été conçue pour le mobile dès l’origine, et le parcours de réception des marchandises a été pensé d’abord pour le téléphone, parce que c’est là qu’il se déroule vraiment.',
      },
      {
        q: 'Qui voit quoi dans l’entreprise ?',
        a: 'Trois rôles. Le dirigeant voit et approuve tout. Les achats pilotent le parcours jusqu’à la facture, sans accès aux paiements ni à la banque. Le comptable ne voit que les factures approuvées et exécute le paiement.',
      },
      {
        q: 'Combien cela coûte-t-il ?',
        a: 'Vous commencez gratuitement, avec 25 documents par mois. Les formules payantes ne diffèrent que par le volume, et toutes les fonctionnalités sont ouvertes sur chacune. Les prix figurent ci-dessus, hors taxes.',
      },
      {
        q: 'Que se passe-t-il en cas de dépassement du quota ?',
        a: 'Le traitement des nouveaux documents s’interrompt jusqu’au début de la période suivante ou jusqu’à un changement de formule. Rien n’est supprimé, et l’historique reste toujours consultable.',
      },
    ],
  },

  finalCta: {
    h2: 'Vous voulez voir cela sur vos propres données ?',
    sub: 'Un pilote cadré : vous vous connectez, importez un tarif et vos fournisseurs, et testez sur votre entreprise réelle.',
    email: 'Ouvrez un espace pilote',
    whatsapp: 'WhatsApp avec',
    or: 'ou',
  },

  footer: {
    blurb: 'Un système achats jusqu’au paiement pour les entreprises : fournisseurs, tarifs, commandes, réception, factures, avoirs, paiements et banque. Une seule chaîne, sans rupture.',
    product: 'Produit',
    contact: 'Contact',
    login: 'Connexion à InPlace',
    rights: '© 2026 InPlace. Tous droits réservés.',
    demoDisclaimer: 'Tous les chiffres de cette page sont des données de démonstration.',
  },
};
