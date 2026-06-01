/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  sender: 'user' | 'aure';
  text: string;
  timestamp: Date;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  sector: string;
  details: string[];
}

export interface Education {
  school: string;
  degree: string;
  location: string;
  period: string;
  details?: string;
  courses: string[];
}

export interface ResumeData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    permis: string;
  };
  experiences: Experience[];
  educations: Education[];
  skills: {
    languages: { name: string; level: string }[];
    certifications: string[];
    soft: string[];
    it: { name: string; category: string }[];
  };
  interests: string[];
}
