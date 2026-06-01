/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { cvData } from './src/cvData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null; // Return null to fallback gracefully without crashing
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback response engine if GEMINI_API_KEY is not set
function generateFallbackResponse(prompt: string): string {
  const normalized = prompt.toLowerCase();
  
  if (normalized.includes('pourquoi') || normalized.includes('embaucher') || normalized.includes('recruter') || normalized.includes('atout') || normalized.includes('point fort')) {
    return "Auriane est extrêmement créative, engagée et polyvalente. Avec son Master à l'ESCE et plus de deux ans en alternance chez APICIL Épargne, elle maîtrise à la fois le marketing B2B, l'événementiel, et les outils digitaux comme Adobe, Sarbacane ou WordPress. C'est une collaboratrice énergique qui saura dynamiser vos projets de communication !";
  }
  
  if (normalized.includes('alternance') || normalized.includes('apicil') || normalized.includes('expérience')) {
    return "Auriane effectue actuellement une alternance de 2 ans chez APICIL ÉPARGNE à Paris en tant qu'Assistante Marketing B to B (jusqu'en Septembre 2026). Elle y gère la communication sur les réseaux sociaux, le marketing produit, la gestion de projets transverses et l'événementiel. C'est un rythme de 3 semaines en entreprise et 1 semaine à l'école ! Elle a aussi une solide expérience en stage chez Legendre Immobilier en marketing immobilier et de l'énergie.";
  }
  
  if (normalized.includes('formation') || normalized.includes('esce') || normalized.includes('liège') || normalized.includes('études') || normalized.includes('master')) {
    return "Auriane prépare un Master Marketing International Consumer (Bac+5) à l'ESCE International Business School (Paris/Lyon), qu'elle obtiendra en Septembre 2026. Elle a également réalisé un Erasmus à la Haute École de la Province de Liège (HEPL) en Belgique de février à juin 2023, axé sur le marketing et la communication de marque !";
  }

  if (normalized.includes('compétence') || normalized.includes('outil') || normalized.includes('logiciel')) {
    return "Auriane possède d'excellentes compétences sur les outils de création et d'e-mailing ! Elle maîtrise la Suite Adobe, Play Play pour le montage vidéo, Dartagnan et Sarbacane pour les campagnes d'e-mailing, Looker Studio pour l'analyse des KPI, WordPress pour la gestion de contenu et possède la certification Contentsquare pour l'expérience utilisateur (UX).";
  }
  
  if (normalized.includes('sport') || normalized.includes('intérêt') || normalized.includes('loisir') || normalized.includes('sportif')) {
    return "Auriane est très dynamique et sportive ! Elle pratique le Tennis, l'Escalade, l'Équitation, le Golf et la Boxe. Ces sports lui ont permis de développer sa concentration, sa réactibilité et son goût prononcé pour l'esprit d'équipe.";
  }
  
  if (normalized.includes('contact') || normalized.includes('joindre') || normalized.includes('email') || normalized.includes('téléphone') || normalized.includes('linkedin')) {
    return "Vous pouvez contacter Auriane directement à l'adresse remacleauriane@gmail.com, par téléphone au 06 41 81 16 11, ou visiter son profil LinkedIn. Je suis sûre qu'elle sera ravie d'échanger avec vous et d'organiser un entretien !";
  }

  return "Je suis Aure, l'assistante d'Auriane. Je connais tout sur son parcours ! Vous pouvez me poser des questions sur son alternance chez APICIL, son Master à l'ESCE, ses compétences techniques (Adobe, Looker Studio, Sarbacane), ses soft skills ou ses centres d'intérêt.";
}

// REST API endpoint for chat
app.post('/api/aure/chat', async (req, res) => {
  try {
    const { prompt, history = [] } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Le paramètre prompt est requis.' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Graceful fallback to rule-based answers if Gemini API key is missing
      const text = generateFallbackResponse(prompt);
      // Wait slightly to simulate human conversational typing
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.json({ text, isFallback: true });
    }

    // Format chat history for @google/genai format
    const contents = [];
    
    // System instruction defining Aure
    const systemInstruction = `
Tu es Aure, l'assistante virtuelle d'Auriane Remacle. Tu t'exprimes avec la voix d'une femme chaleureuse, dynamique, professionnelle et engageante.
Ton objectif absolu est de présenter le parcours, la formation d'étudiante à l'ESCE, et les compétences d'Auriane de manière valorisante et structurée afin de l'aider à décrocher un CDI ou CDD en MARKETING, COMMUNICATION ou ÉVÈNEMENTIEL.

Voici la fiche informative officielle d'Auriane (son CV officiel) :
- Nom : Auriane Remacle
- Poste recherché : CDI ou CDD en Marketing, Communication, Évènementiel.
- Coordonnées de contact :
    Email : remacleauriane@gmail.com
    Téléphone : 06 41 81 16 11
    Adresse : 13 rue de Chanzy, 92000 Nanterre
    LinkedIn : Auriane Remacle (https://www.linkedin.com/in/auriane-remacle)
    Permis de conduire : Permis B

- Expériences professionnelles clé :
  1. Septembre 2024 - Septembre 2026 (actuel) : Assistante Marketing B to B chez APICIL EPARGNE à Paris. C'est une alternance (rythme de 3 semaines en entreprise, 1 semaine à l'école). Ses tâches principales sont la communication (réseaux sociaux, publicité...), le marketing produit, l'événementiel, le marketing digital et la gestion de projets.
  2. Septembre 2021 - Juin 2024 : Vice Présidente et Commerciale pour l'Association PROM'ESCE Lyon (association étudiante). Elle gérait des événements, dirigeait des équipes de projet et négociait des contrats commerciaux.
  3. Juillet 2023 - Décembre 2023 (6 mois) : Assistante Marketing et Communication chez Legendre Immobilier et Énergie à Paris (Stage). Tâches : Reporting thématique, benchmarketing concurrentiel, gestion de projet et création de médias/visuels.
  4. Juillet 2022 - Août 2022 : Vendeuse chez Décathlon à Tourville-la-Rivière (Stage). Tâches : Service clientèle, facing en magasin, tenue et gestion de stocks sportifs.
  5. Décembre 2017 : Assistante agent immobilier chez Join Immobilier à Dieppe (Stage).

- Formations :
  - Septembre 2021 - Septembre 2026 : ESCE International Business School (Lyon/Paris, France). Diplôme : Master Marketing International Consumer (Bac+5). Cours suivis : marketing, management, retail, packaging, communication, marketing digital, UX (User Experience), géopolitique, data analytics.
  - Février 2023 - Juin 2023 : HEPL, Haute Ecole de la Province de Liège (Liège, Belgique). Échange universitaire Erasmus orienté Marketing (cours de marketing, management, communication, droit).

- Compétences techniques & Certifications :
  - Bureautique & Data : Pack Microsoft Office, Looker Studio.
  - Création & Édition : Suite Adobe, logiciel de montage vidéo Play Play.
  - CRM / Diffusion : Logiciels d'e-mailing Dartagnan et Sarbacane.
  - CMS : Back office WordPress.
  - UX Design et certifications : Contentsquare, Design thinking.
  - Langues : Français (Langue maternelle / native), Anglais (niveau intermédiaire), Espagnol (niveau intermédiaire).

- Soft Skills (Aptitudes) : Créative, Dynamique, Responsable, Très bon travail en équipe, Curieuse de nature.
- Centres d'intérêt & Sports : Elle pratique le Tennis, l'Escalade, l'Équitation, le Golf et la Boxe.

Directives de langage :
1. Présente-toi clairement comme "Aure, l'assistante virtuelle d'Auriane". Ton ton doit être très amical, vif, motivant et parfaitement courtois.
2. Ne réinvente rien et ne prétends pas qu'Auriane sait coder ou a complété d'autres rôles non listés.
3. Rédige de courts paragraphes concis d'au maximum 2 à 4 lignes. Les blocs de texte trop longs ne conviennent pas à notre outil de synthèse vocale. Privilégie un ton fluide et évite d'abuser de listes à puces.
4. Encourage constamment le visiteur à entrer en contact avec Auriane en lui fournissant ses coordonnées (email: remacleauriane@gmail.com ou téléphone: 06 41 81 16 11).
5. Réponds toujours en Français.
`;

    // Add conversation history if provided
    if (history && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Append new message
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Pardon, je n'ai pas bien compris votre question. Pourriez-vous reformuler ?";
    return res.json({ text: replyText, isFallback: false });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error?.message || 'Erreur interne du serveur lors de la requete Gemini.' });
  }
});

// App initialization
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite middleware handles client-side asset compilation on-the-fly
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    // Serve static files in production from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} (Node: ${process.version})`);
  });
}

startServer();
