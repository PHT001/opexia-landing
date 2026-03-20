const SITE_URL = "https://opexia-agency.com";

/* ───── Organization + LocalBusiness ───── */
const organizationSchema = {
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: "OpexIA",
  alternateName: ["Opex IA", "OpexIA Agency", "OpexIA Agence IA"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/images/logobleu.png`,
    width: 200,
    height: 200,
  },
  image: `${SITE_URL}/og-image.png`,
  description:
    "Agence IA spécialisée dans l'automatisation des entreprises. Chatbots IA, agents intelligents, infrastructure IA, automatisation des processus métier. Déploiement en 14 jours.",
  foundingDate: "2024",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 2,
    maxValue: 10,
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
    addressLocality: "Paris",
    addressRegion: "Île-de-France",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  areaServed: [
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Belgique" },
    { "@type": "Country", name: "Suisse" },
    { "@type": "Country", name: "Luxembourg" },
    { "@type": "Country", name: "Canada" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    availableLanguage: ["French", "English"],
    email: "contact@opexia-agency.com",
  },
  sameAs: [
    "https://www.linkedin.com/company/opexia",
  ],
  priceRange: "€€",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "50",
    reviewCount: "50",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services IA OpexIA",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Automatisation IA",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Audit IA gratuit",
              description: "Analyse gratuite d'1 heure de vos processus pour identifier les automatisations IA à fort impact.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Chatbot IA sur mesure",
              description: "Conception et déploiement de chatbots intelligents pour automatiser votre relation client, support et ventes.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Agents IA entreprise",
              description: "Développement d'agents IA autonomes pour automatiser les tâches répétitives : devis, relances, reporting, onboarding.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Infrastructure IA",
              description: "Mise en place de l'infrastructure IA complète : intégration API, pipelines de données, déploiement cloud, monitoring.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Automatisation des processus métier",
              description: "Automatisation end-to-end de vos processus métier avec l'IA : facturation, CRM, emails, gestion documentaire.",
            },
          },
        ],
      },
    ],
  },
};

/* ───── WebSite (pour la sitelink searchbox Google) ───── */
const webSiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "OpexIA",
  description: "Agence IA & Automatisation pour Entreprises",
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "fr-FR",
};

/* ───── WebPage ───── */
const webPageSchema = {
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "OpexIA — Agence IA & Automatisation pour Entreprises",
  description:
    "Agence IA n°1 en France. Chatbots, agents IA, automatisation, infrastructure IA. Audit gratuit, déploiement en 14 jours. +50 entreprises accompagnées.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "fr-FR",
  datePublished: "2024-01-01",
  dateModified: new Date().toISOString().split("T")[0],
};

/* ───── FAQ (rich snippets Google) ───── */
const faqSchema = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "Est-ce que l'IA va remplacer mes employés ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Non. L'IA ne remplace pas vos équipes — elle les libère des tâches répétitives et chronophages. Vos collaborateurs pourront se concentrer sur ce qui a vraiment de la valeur : la relation client, la stratégie, la créativité. C'est un multiplicateur de force, pas un remplacement.",
      },
    },
    {
      "@type": "Question",
      name: "C'est compliqué à mettre en place ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pas du tout. On s'occupe de tout : installation, configuration, tests, formation de vos équipes. Vous n'avez rien à installer, rien à coder, rien à maintenir. Notre objectif est que vos systèmes tournent en 14 jours, sans friction.",
      },
    },
    {
      "@type": "Question",
      name: "Combien coûte une agence IA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chaque projet est sur-mesure, donc le coût dépend de vos besoins. L'audit gratuit d'1 heure permet de chiffrer précisément : combien ça coûte ET combien ça vous fait économiser. La plupart de nos clients constatent un ROI positif en 2 à 3 mois.",
      },
    },
    {
      "@type": "Question",
      name: "Et si l'automatisation IA ne marche pas ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On garantit des résultats mesurables. On définit ensemble des KPIs clairs avant de commencer (temps gagné, coûts réduits, taux de conversion). Si les objectifs ne sont pas atteints, on ajuste jusqu'à ce que ça fonctionne.",
      },
    },
    {
      "@type": "Question",
      name: "Mon secteur est trop spécifique pour l'IA",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On a accompagné des clients dans 8 secteurs différents : BTP, immobilier, santé, e-commerce, restauration, logistique, cabinets comptables... L'IA s'adapte à tout. Et c'est justement notre job de l'adapter à votre métier.",
      },
    },
    {
      "@type": "Question",
      name: "Je n'y connais rien en intelligence artificielle",
      acceptedAnswer: {
        "@type": "Answer",
        text: "C'est exactement pour ça qu'on existe. Zéro jargon technique, que du concret. On vous explique tout en termes de résultats business : temps gagné, argent économisé, clients gagnés. Pas besoin de comprendre comment ça marche sous le capot.",
      },
    },
    {
      "@type": "Question",
      name: "Et la sécurité de mes données / RGPD ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Toutes nos solutions sont conformes RGPD. Vos données restent hébergées en Europe, chiffrées, et ne sont jamais utilisées pour entraîner des modèles tiers. On signe un DPA (accord de traitement de données) avec chaque client. La confidentialité est non-négociable.",
      },
    },
    {
      "@type": "Question",
      name: "Au bout de combien de temps je vois des résultats avec l'IA ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les premiers gains sont visibles dès la deuxième semaine de déploiement. En moyenne, nos clients récupèrent 10 à 20h/mois par équipe sur le premier trimestre. On définit des KPIs mesurables avant de commencer pour que les résultats soient concrets et vérifiables.",
      },
    },
  ],
};

/* ───── Services principaux (pour les rich snippets "Service") ───── */
const servicesSchema = [
  {
    "@type": "Service",
    "@id": `${SITE_URL}/#service-chatbot`,
    name: "Chatbot IA pour Entreprise",
    description: "Conception et déploiement de chatbots IA sur mesure pour automatiser votre service client, support technique et qualification de leads. Intégration avec WhatsApp, site web et CRM.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "France" },
    serviceType: "Chatbot IA",
    category: "Intelligence Artificielle",
  },
  {
    "@type": "Service",
    "@id": `${SITE_URL}/#service-automatisation`,
    name: "Automatisation des Processus Métier par IA",
    description: "Automatisation end-to-end de vos processus métier : devis automatiques, relances clients, reporting, facturation, onboarding. Gain moyen de 10 à 20h/mois par équipe.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "France" },
    serviceType: "Automatisation IA",
    category: "Intelligence Artificielle",
  },
  {
    "@type": "Service",
    "@id": `${SITE_URL}/#service-infrastructure`,
    name: "Infrastructure IA pour Entreprise",
    description: "Mise en place de votre infrastructure IA complète : intégration d'APIs, pipelines de données, déploiement cloud, agents IA autonomes et monitoring. Compatible avec vos outils existants.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "France" },
    serviceType: "Infrastructure IA",
    category: "Intelligence Artificielle",
  },
  {
    "@type": "Service",
    "@id": `${SITE_URL}/#service-audit`,
    name: "Audit IA Gratuit",
    description: "Analyse gratuite d'1 heure de vos processus actuels pour identifier les automatisations IA à fort impact. Estimation du ROI, recommandations concrètes et plan d'action détaillé.",
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "France" },
    serviceType: "Conseil IA",
    category: "Intelligence Artificielle",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      description: "Audit IA gratuit d'1 heure",
    },
  },
];

/* ───── Breadcrumb ───── */
const breadcrumbSchema = {
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Accueil",
      item: SITE_URL,
    },
  ],
};

/* ───── Combined JSON-LD ───── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    webSiteSchema,
    webPageSchema,
    faqSchema,
    breadcrumbSchema,
    ...servicesSchema,
  ],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
