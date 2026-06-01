/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Phone,
  Mail,
  Linkedin,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  Briefcase,
  GraduationCap,
  Wrench,
  Heart,
  ExternalLink,
  CheckCircle,
  Play,
  Languages,
  Award,
  User,
  Copy,
  ChevronRight,
  DownloadCloud
} from 'lucide-react';
import { cvData } from './cvData';
import { Message, Experience, Education } from './types';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'aure',
      text: "Bonjour ! Je suis **Aure**, l'assistante virtuelle d'Auriane. 🌸 Je suis ravie de vous accueillir ! Je connais son parcours de marketing, communication et événementiel sur le bout des doigts. \n\nVous pouvez cliquer sur les raccourcis ci-dessous ou me poser vos questions directement par chat. Souhaitez-vous d'abord découvrir son alternance chez **APICIL** ou ses compétences de création ?",
      timestamp: new Date()
    }
  ]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'experiences' | 'education' | 'skills' | 'interests'>('experiences');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load and subscribe to speechSynthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync scroll on chat update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Find a suitable French female voice
  const getFrenchVoice = (): SpeechSynthesisVoice | null => {
    const frVoices = voices.filter(v => v.lang.startsWith('fr'));
    const preferred = frVoices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('aurelie') || 
      v.name.toLowerCase().includes('hortense') || 
      v.name.toLowerCase().includes('google') ||
      v.name.toLowerCase().includes('microsoft')
    );
    return preferred || frVoices[0] || null;
  };

  // Convert rich response to speech audio
  const speak = (markdownText: string) => {
    if (!isVoiceOn || !('speechSynthesis' in window)) return;
    
    // Stop any current speaking
    window.speechSynthesis.cancel();

    // Clean markdown syntax for natural speech phrasing
    const cleanText = markdownText
      .replace(/\*\*([^*]+)\*\*/g, '$1') 
      .replace(/\*([^*]+)\*/g, '$1')     
      .replace(/`([^`]+)`/g, '$1')       
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') 
      .replace(/[\n\r]+/g, ' ')          
      .slice(0, 400); 

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    
    const FrenchVoice = getFrenchVoice();
    if (FrenchVoice) {
      utterance.voice = FrenchVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Chat message submit handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Stop speaking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/aure/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Impossible de joindre le service de chat d'Aure.");
      }

      const data = await response.json();
      
      const aureMessage: Message = {
        id: `aure-${Date.now()}`,
        sender: 'aure',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aureMessage]);
      speak(data.text);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'aure',
        text: "Oups ! J'ai rencontré un petit problème de réseau. Vous pouvez relancer votre question, ou bien parcourir les rubriques ci-dessous pour voir le parcours d'Auriane !",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper shortcut questions
  const quickQuestions = [
    { label: "🚀 Pourquoi recruter Auriane ?", text: "Quels sont les principaux atouts de de parcours d'Auriane et pourquoi devrais-je l'embaucher ?" },
    { label: "💼 Son alternance chez APICIL", text: "Détaille-moi ses missions d'alternante actuelle chez APICIL ÉPARGNE." },
    { label: "🎓 Son Master & École (ESCE)", text: "Quelle est sa formation actuelle à l'ESCE et ses domaines d'enseignement ?" },
    { label: "🎨 Ses compétences créatives", text: "Quels outils informatiques et créatifs maîtrise-t-elle, notamment pour la communication ?" },
  ];

  // Speak welcome message if user toggles audio on initially
  const handleVoiceToggle = () => {
    const newState = !isVoiceOn;
    setIsVoiceOn(newState);
    if (newState) {
      const lastAureMsg = [...messages].reverse().find(m => m.sender === 'aure');
      if (lastAureMsg) {
        setTimeout(() => speak(lastAureMsg.text), 150);
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Print friendly resume generator
  const triggerPrintResume = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0D8D0] selection:bg-[#C5B398]/30 selection:text-white flex flex-col antialiased custom-scrollbar print:bg-white print:text-black">
      
      {/* HEADER SECTION - Sophisticated Dark Header */}
      <header className="border-b border-[#2A2A2A] bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-40 print:relative print:border-none print:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#0F0F0F] border border-[#C5B398]/30 flex items-center justify-center text-[#C5B398] text-xl font-bold font-serif shadow-lg">
              AR
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif text-[#F5F2ED] leading-tight tracking-tight">
                  Auriane <span className="font-light italic text-[#C5B398]">Remacle</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest bg-[#C5B398]/10 text-[#C5B398] border border-[#C5B398]/20 uppercase">
                  Sept 2026
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8E8271] font-mono uppercase tracking-widest mt-1">
                {cvData.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={triggerPrintResume}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#A09890] bg-[#121212] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] rounded border border-[#2A2A2A] transition-all cursor-pointer"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-[#C5B398]" />
              <span>Imprimer (PDF)</span>
            </button>
            <a
              href={cvData.contact.linkedin}
              target="_blank"
              referrerPolicy="no-referrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#0A0A0A] bg-[#C5B398] hover:bg-[#C5B398]/90 rounded transition-all shadow-md shadow-[#C5B398]/10"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </header>

      {/* BANNER WITH RECRUITMENT FOCUS */}
      <div className="bg-[#0F0F0F] text-[#A09890] py-3.5 px-4 print:hidden text-center text-xs tracking-wide border-b border-[#2A2A2A] font-light">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-[#C5B398] uppercase tracking-widest">
            <Sparkles className="w-4 h-4 animate-pulse text-yellow-500/80" />
            <span>Alternance Active :</span>
          </div>
          <span>3 semaines chez <strong className="text-[#F5F2ED] font-semibold">APICIL Épargne (Paris)</strong> • 1 semaine à l'école <strong className="text-[#F5F2ED] font-semibold">ESCE (Bac+5 Master)</strong></span>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: AURE AI PANEL */}
        <section className="lg:col-span-5 bg-[#0F0F0F] rounded-xl border border-[#2A2A2A] shadow-2xl overflow-hidden flex flex-col h-[670px] lg:sticky lg:top-28 print:hidden">
          
          {/* PROFILE ASSISTANT HEADER */}
          <div className="p-4 bg-[#080808] border-b border-[#2A2A2A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Gold/Beige theme avatar */}
              <div className="relative">
                <div className="w-11 h-11 rounded border border-[#C5B398]/40 bg-[#161616] flex items-center justify-center text-[#C5B398] font-serif italic text-xl shadow-lg">
                  Au
                </div>
                {/* Visualizer Ping Indicator */}
                {isSpeaking && (
                  <>
                    <span className="absolute inset-0 rounded bg-[#C5B398] opacity-25 animate-ping" />
                  </>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#C5B398] border-2 border-[#0F0F0F] rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif italic text-lg text-[#F5F2ED]">Aure</h2>
                  <span className="text-[9px] font-mono tracking-widest text-[#8E8271] uppercase border border-[#2A2A2A] px-1.5 py-0.5 rounded">Asst</span>
                </div>
                {isSpeaking ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex gap-0.5 items-end h-2 w-3.5 shrink-0">
                      <span className="w-0.5 bg-[#C5B398] animate-[bounce_0.6s_infinite_100ms]" style={{ height: '50%' }}></span>
                      <span className="w-0.5 bg-[#C5B398] animate-[bounce_0.6s_infinite_300ms]" style={{ height: '90%' }}></span>
                      <span className="w-0.5 bg-[#C5B398] animate-[bounce_0.6s_infinite_200ms]" style={{ height: '40%' }}></span>
                    </span>
                    <span className="text-[10px] text-[#C5B398] font-mono tracking-wider animate-pulse">Parle en français...</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8E8271] font-mono uppercase tracking-widest">Voix disponible</p>
                )}
              </div>
            </div>

            {/* Vocal Switch */}
            <button
              onClick={handleVoiceToggle}
              title={isVoiceOn ? "Désactiver la voix d'Aure" : "Activer la voix d'Aure"}
              className={`p-2 rounded font-mono uppercase tracking-widest text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
                isVoiceOn 
                  ? 'bg-[#C5B398] text-[#0A0A0A] font-semibold' 
                  : 'bg-[#121212] text-[#8E8271] border border-[#2A2A2A] hover:bg-[#1C1C1C]'
              }`}
            >
              {isVoiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isVoiceOn ? "Voix: On" : "Voix: Muet"}</span>
            </button>
          </div>

          {/* SIMULATED MINIMALIST VOICE WAVEFORM WHEN SPEAKING */}
          {isSpeaking && (
            <div className="bg-[#121212] px-4 py-2 border-b border-[#2A2A2A] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8E8271] uppercase tracking-wider">Breathing Voice Stream</span>
              <div className="flex items-center gap-1.5 h-6">
                <span className="w-0.5 bg-[#C5B398] rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 bg-[#C5B398] rounded-full animate-bounce h-5" style={{ animationDelay: '100ms' }} />
                <span className="w-0.5 bg-[#C5B398] rounded-full animate-bounce h-4" style={{ animationDelay: '200ms' }} />
                <span className="w-0.5 bg-[#C5B398] rounded-full animate-bounce h-6" style={{ animationDelay: '300ms' }} />
                <span className="w-0.5 bg-[#C5B398] rounded-full animate-bounce h-3" style={{ animationDelay: '400ms' }} />
                <span className="w-0.5 bg-[#C5B398] rounded-full animate-bounce h-5" style={{ animationDelay: '500ms' }} />
              </div>
            </div>
          )}

          {/* CHAT LOG SCREEN */}
          <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-[#0A0A0A]/50 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3.5 text-xs sm:text-sm leading-relaxed transition-all ${
                    msg.sender === 'user'
                      ? 'bg-[#C5B398] text-[#0A0A0A] rounded-tr-none font-medium'
                      : 'bg-[#121212] text-[#E0D8D0] border border-[#2A2A2A] rounded-tl-none font-light prose prose-invert'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-[13px] tracking-wide leading-relaxed">
                    {/* Parse double asterisks with precise gold text fallback styling */}
                    {msg.text.split('**').map((part, index) => 
                      index % 2 === 1 ? (
                        <strong key={index} className={msg.sender === 'user' ? 'underline font-extrabold' : 'text-[#C5B398] font-bold'}>
                          {part}
                        </strong>
                      ) : part
                    )}
                  </p>
                  <span className="block text-[8px] opacity-50 mt-2 text-right font-mono tracking-widest">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#121212] border border-[#2A2A2A] rounded-lg rounded-tl-none p-3.5">
                  <div className="flex items-center gap-1.5 h-3">
                    <span className="w-1.5 h-1.5 bg-[#C5B398] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#C5B398] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#C5B398] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUESTIONS SUGGESTED */}
          <div className="p-4 bg-[#0A0A0A] border-t border-[#2A2A2A]">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#8E8271] mb-2 px-1">Suggestion de dialogue</p>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="text-[10px] text-[#A09890] bg-[#121212] hover:bg-[#1C1C1C] hover:text-[#F5F2ED] hover:border-[#C5B398]/50 transition-all border border-[#2A2A2A] rounded py-1 px-2 font-mono text-left cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* CHAT INPUT FIELD */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(query);
            }}
            className="p-3 bg-[#0F0F0F] border-t border-[#2A2A2A] flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Écrivez un message ici..."
              className="flex-grow bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-2.5 text-xs sm:text-sm text-[#F5F2ED] focus:outline-none focus:border-[#C5B398] placeholder:text-[#8E8271]/60 font-sans tracking-wide"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="p-3 bg-[#C5B398] hover:bg-[#C5B398]/90 text-[#0A0A0A] rounded font-semibold transition-all disabled:opacity-30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: SOPHISTICATED INTERACTIVE CV */}
        <section className="lg:col-span-7 flex flex-col gap-6 print:col-span-12">
          
          {/* PROFILE SUMMARY HERO HERO CARD */}
          <div className="bg-[#0F0F0F] rounded-xl border border-[#2A2A2A] p-6 sm:p-8 relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#C5B398]/5 rounded-full blur-3xl" />
            
            <div className="flex flex-col gap-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5B398] font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5B398]" />
                Auriane Remacle • Présentation
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F5F2ED] italic leading-tight">
                Une candidate investie aux compétences pointues.
              </h2>
              <p className="text-xs sm:text-sm text-[#A09890] leading-relaxed font-sans font-light tracking-wide max-w-2xl">
                Créative, dynamique et autonome, j’accomplis actuellement un Master en Marketing International Client (Bac+5) à l’ESCE. En parallèle, je développe des compétences transverses et solides chez APICIL Épargne. Je suis ouverte aux propositions de postes en marketing, création de média, communication de marque et événementiel d'entreprise.
              </p>
              
              {/* Elegant Gold Accented Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#2A2A2A] text-xs font-mono">
                <button
                  onClick={() => copyToClipboard(cvData.contact.email, 'email')}
                  className="flex items-center gap-2.5 text-[#A09890] hover:text-[#F5F2ED] transition-colors text-left"
                >
                  <Mail className="w-4 h-4 text-[#C5B398] shrink-0" />
                  <span>{cvData.contact.email}</span>
                  {copiedText === 'email' ? (
                    <span className="text-[9px] text-[#C5B398] tracking-widest uppercase">Copié !</span>
                  ) : (
                    <Copy className="w-3 h-3 text-[#8E8271] shrink-0 opacity-40 select-none cursor-pointer" />
                  )}
                </button>

                <button
                  onClick={() => copyToClipboard(cvData.contact.phone, 'phone')}
                  className="flex items-center gap-2.5 text-[#A09890] hover:text-[#F5F2ED] transition-colors text-left"
                >
                  <Phone className="w-4 h-4 text-[#C5B398] shrink-0" />
                  <span>{cvData.contact.phone}</span>
                  {copiedText === 'phone' ? (
                    <span className="text-[9px] text-[#C5B398] tracking-widest uppercase">Copié !</span>
                  ) : (
                    <Copy className="w-3 h-3 text-[#8E8271] shrink-0 opacity-40 select-none cursor-pointer" />
                  )}
                </button>

                <div className="flex items-center gap-2.5 text-[#A09890]">
                  <MapPin className="w-4 h-4 text-[#C5B398] shrink-0" />
                  <span>{cvData.contact.address}</span>
                </div>

                <div className="flex items-center gap-2.5 text-[#A09890]">
                  <CheckCircle className="w-4 h-4 text-[#C5B398] shrink-0" />
                  <span>{cvData.contact.permis}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC TAB NAVIGATION CONTROLS */}
          <div className="bg-[#0F0F0F] p-1.5 rounded-lg border border-[#2A2A2A] shadow-lg flex items-center print:hidden overflow-x-auto gap-1 scrollbar-none">
            {[
              { id: 'experiences', label: 'Parcours Pro', icon: Briefcase },
              { id: 'education', label: 'Formations', icon: GraduationCap },
              { id: 'skills', label: 'Expertises & Outils', icon: Wrench },
              { id: 'interests', label: 'Sports & Loisirs', icon: Heart }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-mono uppercase tracking-widest transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#C5B398] text-[#0A0A0A] font-semibold'
                      : 'text-[#8E8271] hover:text-[#F5F2ED] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TRANSITIONAL ACTIVE DETAILS CARD */}
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-6 sm:p-8 min-h-[355px]">
            
            {/* SUB-SECTION: EXPERIENCES */}
            {(activeTab === 'experiences' || window.matchMedia('print').matches) && (
              <div className={`${activeTab !== 'experiences' ? 'hidden print:block' : 'block'}`}>
                <div className="flex items-center gap-3 mb-8 border-b border-[#2A2A2A] pb-4">
                  <Briefcase className="w-5 h-5 text-[#C5B398]" />
                  <h3 className="text-xl font-serif text-[#F5F2ED]">Expériences Professionnelles</h3>
                </div>

                <div className="space-y-10 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-[#2A2A2A]">
                  {cvData.experiences.map((exp: Experience, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className="relative pl-8 group"
                    >
                      {/* Chronology dot inspired by classical styling */}
                      <span className="absolute left-1 top-1.5 w-4.5 h-4.5 rounded-full border border-[#2A2A2A] bg-[#0A0A0A] flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#C5B398]" />
                      </span>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 leading-normal">
                          <h4 className="font-serif text-[#F5F2ED] text-base group-hover:text-[#C5B398] transition-colors">
                            {exp.role} <span className="text-[#8E8271] font-sans font-light text-xs sm:text-sm tracking-wide">chez {exp.company}</span>
                          </h4>
                          <span className="text-[10px] font-mono text-[#C5B398] bg-[#C5B398]/10 border border-[#C5B398]/20 px-2.5 py-0.5 rounded w-fit uppercase tracking-widest whitespace-nowrap">
                            {exp.period}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-[#8E8271] mt-0.5 uppercase tracking-wide">
                          <span className="text-[#C5B398] font-bold">{exp.sector}</span>
                          <span className="hidden sm:inline opacity-30">•</span>
                          <span>{exp.location}</span>
                          <span className="hidden sm:inline opacity-30">•</span>
                          <span className="italic select-none">{exp.type}</span>
                        </div>

                        {/* Achievements Bullet List */}
                        <ul className="mt-4 space-y-2 text-xs sm:text-sm text-[#A09890] font-sans font-light leading-relaxed">
                          {exp.details.map((detail, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2">
                              <span className="text-[#C5B398] hover:scale-125 transition-transform mt-1.5 shrink-0 select-none">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Interactive callback button */}
                        <div className="mt-4 print:hidden">
                          <button
                            onClick={() => {
                              setActiveTab('experiences');
                              handleSendMessage(`Détaille-moi l'expérience d'Auriane en tant que "${exp.role}" chez "${exp.company}".`);
                            }}
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#C5B398] hover:text-[#F5F2ED] hover:underline cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-500/70" />
                            <span>Développer cette expérience conjointe</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION: EDUCATION */}
            {(activeTab === 'education' || window.matchMedia('print').matches) && (
              <div className={`${activeTab !== 'education' ? 'hidden print:block' : 'block'}`}>
                <div className="flex items-center gap-3 mb-8 border-b border-[#2A2A2A] pb-4">
                  <GraduationCap className="w-5 h-5 text-[#C5B398]" />
                  <h3 className="text-xl font-serif text-[#F5F2ED]">Formations Académiques</h3>
                </div>

                <div className="space-y-6">
                  {cvData.educations.map((edu: Education, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.08 }}
                      className="p-5 bg-[#0A0A0A] rounded border border-[#2A2A2A] hover:border-[#C5B398]/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <h4 className="font-serif text-[#F5F2ED] text-base sm:text-lg">
                          {edu.degree}
                        </h4>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5B398] bg-[#C5B398]/10 px-2 py-0.5 rounded border border-[#C5B398]/20 shrink-0">
                          {edu.period}
                        </span>
                      </div>
                      
                      <p className="text-xs font-mono text-[#8E8271] uppercase tracking-wider mt-1">
                        {edu.school} • {edu.location}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[#2A2A2A]/40">
                        <p className="text-[10px] font-mono text-[#8E8271] uppercase tracking-[0.2em] mb-2">Domaines d'apprentissage majeurs</p>
                        <div className="flex flex-wrap gap-1.5">
                          {edu.courses.map((course, cIdx) => (
                            <span
                              key={cIdx}
                              className="text-xs bg-[#121212] text-[#A09890] border border-[#2A2A2A] px-2.5 py-1 rounded"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-SECTION: SKILLS */}
            {(activeTab === 'skills' || window.matchMedia('print').matches) && (
              <div className={`${activeTab !== 'skills' ? 'hidden print:block' : 'block'}`}>
                <div className="flex items-center gap-3 mb-8 border-b border-[#2A2A2A] pb-4">
                  <Wrench className="w-5 h-5 text-[#C5B398]" />
                  <h3 className="text-xl font-serif text-[#F5F2ED]">Compétences & Outils</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left inner column: Languages and Soft skills */}
                  <div className="space-y-6">
                    {/* Languages block */}
                    <div>
                      <h4 className="text-[11px] font-mono text-[#8E8271] uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                        <Languages className="w-4 h-4 text-[#C5B398]" />
                        Mondes & Langues
                      </h4>
                      <div className="space-y-2.5">
                        {cvData.skills.languages.map((lang, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-[#A09890]">
                            <span className="font-light">{lang.name}</span>
                            <span className="bg-[#121212] border border-[#2A2A2A] text-[#C5B398] px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider">{lang.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications block */}
                    <div>
                      <h4 className="text-[11px] font-mono text-[#8E8271] uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#C5B398]" />
                        Certifications agréées
                      </h4>
                      <div className="space-y-2">
                        {cvData.skills.certifications.map((cert, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#A09890] bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A]/80">
                            <CheckCircle className="w-4 h-4 text-[#C5B398] shrink-0 mt-0.5" />
                            <span className="font-light leading-relaxed">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Soft Skills */}
                    <div>
                      <h4 className="text-[11px] font-mono text-[#8E8271] uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#C5B398]" />
                        Qualités Personnelles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.soft.map((soft, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono uppercase tracking-wider bg-[#C5B398]/10 text-[#C5B398] border border-[#C5B398]/20 px-3 py-1 rounded"
                          >
                            {soft}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right inner column: Tech stack */}
                  <div>
                    <h4 className="text-[11px] font-mono text-[#8E8271] uppercase tracking-[0.2em] mb-3.5 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-[#C5B398]" />
                      Logiciels, Outils & Spécialités
                    </h4>
                    <div className="grid grid-cols-1 gap-2.5">
                      {cvData.skills.it.map((tool, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSendMessage(`Quelles sont les compétences d’Auriane de manière générale sur : ${tool.name} ?`)}
                          className="flex items-center justify-between p-2.5 rounded bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5B398]/50 hover:bg-[#121212] transition-colors text-xs text-[#A09890] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5B398]" />
                            <span className="font-light tracking-wide group-hover:text-[#F5F2ED] transition-colors">{tool.name}</span>
                          </div>
                          <span className="bg-[#121212] text-[#8E8271] font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#2A2A2A]/80">
                            {tool.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-SECTION: INTERESTS */}
            {(activeTab === 'interests' || window.matchMedia('print').matches) && (
              <div className={`${activeTab !== 'interests' ? 'hidden print:block' : 'block'}`}>
                <div className="flex items-center gap-3 mb-8 border-b border-[#2A2A2A] pb-4">
                  <Heart className="w-5 h-5 text-[#C5B398]" />
                  <h3 className="text-xl font-serif text-[#F5F2ED]">Loisirs, Sports & État d’esprit</h3>
                </div>

                <div className="flex flex-col gap-5">
                  <p className="text-xs sm:text-sm text-[#A09890] leading-relaxed font-sans font-light tracking-wide">
                    Auriane accorde une place essentielle à la concentration, la persévérance et au dépassement de soi. C'est à travers la pratique régulière de disciplines exigeantes qu'elle nourrit sa rigueur professionnelle et son esprit d'équipe :
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {cvData.interests.map((interest, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-[#0A0A0A] rounded border border-[#2A2A2A] text-center flex flex-col items-center justify-center gap-2 group hover:border-[#C5B398]/40 hover:bg-[#111111] transition-all font-serif text-sm italic text-[#E0D8D0]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#C5B398] group-hover:scale-120 transition-transform" />
                        <span>{interest}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4.5 bg-[#0A0A0A] border border-[#C5B398]/20 rounded mt-4">
                    <p className="text-xs text-[#A09890] leading-relaxed font-sans font-light">
                      <strong className="text-[#C5B398] font-semibold font-mono tracking-wider uppercase text-[10px] block mb-1">MÉTAPNORE DU COURT AU BUREAU :</strong> Que ce soit en tennis, boxe ou équitation, Auriane y puise une réactivité de tous les instants, une endurance mentale évidente ainsi qu’un penchant naturel pour le travail d'équipe. Des qualités qu'elle intègre avec brio lors de chacun de ses projets de marketing produit ou événementiel.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* CONTACT INFO CARD PANEL BANNER */}
          <div className="p-6 sm:p-8 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl relative overflow-hidden transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5B398]/5 rounded-full blur-2xl" />
            
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center relative z-10">
              <div>
                <h4 className="text-white font-serif italic text-xl mb-1.5">Intéressé(e) par le profil d’Auriane ?</h4>
                <p className="text-xs text-[#8E8271] font-sans font-light tracking-wide">Elle se tient disponible pour un dialogue constructif ou un rendez-vous (Paris/IDF).</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={`mailto:${cvData.contact.email}`}
                  className="bg-[#C5B398] hover:bg-[#C5B398]/90 text-[#0A0A0A] font-mono uppercase tracking-widest text-xs py-3 px-5 rounded transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#C5B398]/10"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Envoyer un mail</span>
                </a>
                <a
                  href={`tel:${cvData.contact.phone}`}
                  className="bg-[#121212] hover:bg-[#1C1C1C] text-[#F5F2ED] border border-[#2A2A2A] font-mono uppercase tracking-widest text-xs py-3 px-5 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5B398]" />
                  <span>Téléphone</span>
                </a>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* COMPACT FLOATING BAR AT FOOTER */}
      <footer className="bg-[#070707] border-t border-[#2A2A2A] text-[#8E8271] py-8 text-center text-xs mt-auto print:hidden font-mono tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p>© 2026 Auriane Remacle. Tous droits réservés.</p>
          <p className="text-[10px] opacity-70">Propulsé par Aure, son assistante virtuelle intelligente au look Sophisticated Dark.</p>
        </div>
      </footer>

    </div>
  );
}
