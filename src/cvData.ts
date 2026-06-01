/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeData } from './types';

export const cvData: ResumeData = {
  name: "Auriane Remacle",
  title: "CDI ou CDD en Marketing, Communication, Évènementiel",
  contact: {
    email: "remacleauriane@gmail.com",
    phone: "06 41 81 16 11",
    address: "13 rue de Chanzy, 92000 Nanterre",
    linkedin: "https://www.linkedin.com/in/auriane-remacle",
    permis: "Permis B"
  },
  experiences: [
    {
      role: "Assistante Marketing B to B",
      company: "APICIL EPARGNE",
      location: "Paris (75)",
      period: "Septembre 2024 - Septembre 2026",
      type: "Alternance (rythme 3 semaines en entreprise et 1 semaine à l'école)",
      sector: "Secteur de l'Épargne",
      details: [
        "Communication (Réseaux sociaux, publicité...)",
        "Marketing produit et développement d'offres",
        "Évènementiel de marque et opérations relationnelles",
        "Marketing digital et suivi des campagnes web",
        "Gestion complète de projets transverses"
      ]
    },
    {
      role: "Vice Présidente et Commerciale",
      company: "Association PROM'ESCE",
      location: "Lyon (69)",
      period: "Septembre 2021 - Juin 2024",
      type: "Engagement associatif de l'ESCE",
      sector: "Secteur associatif étudiant",
      details: [
        "Gestion d'événements et soirées thématiques d'envergure",
        "Gestion d'équipe, management et coordination de projets",
        "Développement et négociation d'accords commerciaux"
      ]
    },
    {
      role: "Assistante Marketing et Communication",
      company: "Legendre Immobilier et Energie",
      location: "Paris (75)",
      period: "Juillet 2023 - Décembre 2023",
      type: "Stage de fin de cycle",
      sector: "Secteur de la promotion immobilière et de l'énergie",
      details: [
        "Reporting d'activités et suivi de budgets de communication",
        "Benchmarketing approfondi et analyse de la concurrence",
        "Gestion opérationnelle de projets et événements",
        "Création de médias et supports de communication multicanaux"
      ]
    },
    {
      role: "Vendeuse",
      company: "Décathlon",
      location: "Tourville-la-Rivière (76)",
      period: "Juillet 2022 - Août 2022",
      type: "Stage commercial terrain",
      sector: "Secteur du sport",
      details: [
        "Service clientèle et conseil personnalisé de qualité",
        "Facing, théâtralisation produit et mise en valeur des rayons",
        "Gestion des stocks, suivi des réapprovisionnements"
      ]
    },
    {
      role: "Assistante Agent Immobilier",
      company: "Join Immobilier",
      location: "Dieppe (76)",
      period: "Décembre 2017",
      type: "Stage de découverte active",
      sector: "Secteur de l'immobilier",
      details: [
        "Découverte de l'organisation d'une agence de proximité",
        "Réalisation de tâches administratives courantes",
        "Visites de biens immobiliers avec les agents",
        "Participation active de premier plan à des rendez-vous de vente"
      ]
    }
  ],
  educations: [
    {
      school: "ESCE, International Business School",
      degree: "Master Marketing International Consumer (Bac +5)",
      location: "Lyon / Paris, France",
      period: "Septembre 2021 - Septembre 2026",
      courses: [
        "Marketing stratégique & opérationnel",
        "Management & négociations complexes",
        "Digital marketing & E-mailing",
        "Retail, Packaging & UX (User Experience)",
        "Géopolitique, Sciences de la donnée (Data d'entreprise)"
      ]
    },
    {
      school: "HEPL, Haute Ecole de la Province de Liège",
      degree: "Échange Erasmus - Cursus Marketing",
      location: "Liège, Belgique",
      period: "Février 2023 - Juin 2023",
      courses: [
        "Marketing international & interculturel",
        "Management d'équipes pluridisciplinaires",
        "Communication de marque",
        "Principes de droit général et commercial"
      ]
    }
  ],
  skills: {
    languages: [
      { name: "Français", level: "Langue maternelle (Native)" },
      { name: "Anglais", level: "Niveau intermédiaire" },
      { name: "Espagnol", level: "Niveau intermédiaire" }
    ],
    certifications: [
      "Contentsquare (Analyse d'expérience utilisateur)",
      "Design Thinking (Méthodologies d'innovation centrées utilisateur)"
    ],
    soft: [
      "Créative",
      "Dynamique",
      "Responsable",
      "Travail en équipe",
      "Curieuse"
    ],
    it: [
      { name: "Pack Microsoft Office", category: "Bureautique" },
      { name: "Suite Adobe (Photoshop, Illustrator...)", category: "Design" },
      { name: "Play Play", category: "Montage Vidéo" },
      { name: "Dartagnan", category: "E-mailing" },
      { name: "Sarbacane", category: "E-mailing & CRM" },
      { name: "WordPress", category: "Back office & CMS" },
      { name: "UX Design", category: "Conception" },
      { name: "Looker Studio", category: "Analyse Data & KPI" }
    ]
  },
  interests: [
    "Tennis",
    "Escalade (Indoor/Outdoor)",
    "Équitation",
    "Golf",
    "Boxe"
  ]
};
