import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Plus, Save, Trash2, Copy, Share2, ExternalLink, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, Smartphone, Monitor, Sparkles, Building2, Home,
  MapPin, Bed, Bath, Car, Maximize2, Video, Image as ImageIcon, Check,
  MessageCircle, Phone, Mail, ShieldCheck, Webhook, Eye, X, Palette, Layers,
  ArrowRight, Star, Award, Calendar
} from 'lucide-react';
import { User, Form, FormStatus, Lead, Integration, PageLead, PageTemplateId } from './types';
import { db } from './store';

const formatPhone = (value: string) => {
  if (!value) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const getEmbedVideoUrl = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (trimmed.startsWith('http')) return trimmed;
  return null;
};

export interface TemplatePreset {
  id: PageTemplateId;
  name: string;
  tagline: string;
  badgeColor: string;
  previewImage: string;
  defaultData: Omit<PageLead, 'id' | 'orgId' | 'name' | 'slug' | 'status' | 'createdAt' | 'updatedAt' | 'settings'>;
}

export const TEMPLATE_PRESETS: Record<PageTemplateId, TemplatePreset> = {
  luxury: {
    id: 'luxury',
    name: 'Alto Padrão & Luxo',
    tagline: 'Visual escuro e sofisticado com detalhes em dourado. Ideal para mansões, coberturas e imóveis exclusivos.',
    badgeColor: 'bg-amber-500 text-zinc-950',
    previewImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    defaultData: {
      templateId: 'luxury',
      primaryColor: '#d97706',
      property: {
        badge: 'EXCLUSIVIDADE ALTO PADRÃO',
        title: 'Mansão Suspensa com Vista Panorâmica Definitiva',
        subtitle: 'Arquitetura autoral, acabamento em mármore importado e lazer privativo digno de resort 5 estrelas no coração do bairro mais nobre.',
        price: 'R$ 4.850.000',
        priceNote: 'Estuda permuta de menor valor • Condomínio Club Completo',
        location: 'Jardins • São Paulo, SP',
        heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1400&auto=format&fit=crop',
        videoUrl: '',
        description: 'Projetada para quem exige o extraordinário. Esta residência combina integração total entre living e terraço gourmet, pé-direito duplo de 6 metros, iluminação natural abundante e total privacidade. Cada detalhe foi concebido com materiais nobres, automação residencial preparada e vista livre permanente.',
        bedrooms: '4',
        suites: '4',
        parking: '4',
        area: '380',
        features: [
          'Elevador Privativo Codificado',
          'Terraço Gourmet com Churrasqueira a Carvão',
          'Piscina Aquecida com Borda Infinita',
          'Automação de Iluminação e Persianas',
          'Suíte Master com Closet Sr. e Sra.',
          'Segurança Blindada 24h',
          'Adega Climatizada para 120 Rótulos',
          'Vagas Box com Carregador para Carro Elétrico'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=900&auto=format&fit=crop'
        ]
      },
      broker: {
        name: 'Consultor Especialista Prime',
        creci: 'CRECI 123456-F',
        phone: '(11) 99999-9999',
        email: 'prime@imobiliaria.com.br',
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
        bio: 'Atendimento sigiloso e personalizado para aquisição de imóveis de alto padrão e investimentos imobiliários.'
      },
      conversion: {
        mode: 'native_form',
        ctaText: 'Agendar Visita Privativa',
        formTitle: 'Atendimento Private',
        formSubtitle: 'Preencha seus dados para receber o book completo e agendar sua visita com exclusividade.',
        showWhatsappFloating: true,
        whatsappMessage: 'Olá! Vi a página da Mansão Suspensa e gostaria de mais informações e agendar uma visita.'
      }
    }
  },
  launch: {
    id: 'launch',
    name: 'Lançamento na Planta',
    tagline: 'Design moderno de alta conversão focado em tabela de pré-lançamento, valorização e condições de pagamento.',
    badgeColor: 'bg-blue-600 text-white',
    previewImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop',
    defaultData: {
      templateId: 'launch',
      primaryColor: '#2563eb',
      property: {
        badge: 'PRÉ-LANÇAMENTO • TABELA ZERO',
        title: 'Horizon Residence: O Novo Ícone Moderno da Região',
        subtitle: 'Garanta condições exclusivas de lançamento com fluxo de pagamento facilitado direto com a construtora e alto potencial de valorização.',
        price: 'A partir de R$ 590.000',
        priceNote: 'Entrada parcelada em até 36x • Use seu FGTS',
        location: 'Centro Sul • Ao lado do Parque Central',
        heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1400&auto=format&fit=crop',
        videoUrl: '',
        description: 'O Horizon Residence nasce para redefinir o conceito de morar bem e investir com segurança. Plantas inteligentes de 2 e 3 dormitórios com varanda gourmet integrada, rooftop panorâmico no 25º andar e mais de 20 itens de lazer entregues equipados e decorados.',
        bedrooms: '2 e 3',
        suites: '1 a 3',
        parking: '1 ou 2',
        area: '78 a 115',
        features: [
          'Rooftop Panorâmico no 25º Andar',
          'Piscina Adulto e Infantil Climatizada',
          'Coworking Moderno com Salas de Reunião',
          'Academia Profissional by Technogym',
          'Quadra de Beach Tennis Oficial',
          'Pet Place & Pet Care',
          'Mini Market 24h no Condomínio',
          'Entrega Equipada e Decorada'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=900&auto=format&fit=crop'
        ]
      },
      broker: {
        name: 'Coordenação de Lançamentos',
        creci: 'CRECI 98765-J',
        phone: '(11) 99999-9999',
        email: 'lancamentos@imobiliaria.com.br',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
        bio: 'Acesso antecipado à Tabela Zero, plantas humanizadas e simulação personalizada de financiamento.'
      },
      conversion: {
        mode: 'native_form',
        ctaText: 'Baixar Tabela e Plantas Agora',
        formTitle: 'Receba a Tabela de Pré-Lançamento',
        formSubtitle: 'Cadastre-se para desbloquear as plantas, valores de tabela zero e condições de parcelamento.',
        showWhatsappFloating: true,
        whatsappMessage: 'Olá! Quero receber a tabela de preços e as plantas do lançamento Horizon Residence.'
      }
    }
  },
  ready: {
    id: 'ready',
    name: 'Imóvel Pronto / Oportunidade',
    tagline: 'Layout claro, limpo e direto ao ponto. Destaca fotos reais, ficha técnica clara e agendamento rápido de visita.',
    badgeColor: 'bg-emerald-600 text-white',
    previewImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop',
    defaultData: {
      templateId: 'ready',
      primaryColor: '#059669',
      property: {
        badge: 'PRONTO PARA MORAR • OPORTUNIDADE',
        title: 'Casa Contemporânea em Condomínio Fechado',
        subtitle: 'Ambientes integrados, espaço gourmet completo com piscina e acabamento impecável. Documentação 100% pronta para financiamento.',
        price: 'R$ 1.290.000',
        priceNote: 'Aceita financiamento bancário e FGTS',
        location: 'Condomínio Reserva do Vale',
        heroImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1400&auto=format&fit=crop',
        videoUrl: '',
        description: 'Excelente oportunidade para sua família viver com segurança e conforto imediato. Casa recém-construída em terreno amplo, com sala de estar e jantar integradas à cozinha americana, área gourmet coberta, quintal gramado com piscina e 3 suítes espaçosas com armários planejados.',
        bedrooms: '3',
        suites: '3',
        parking: '4',
        area: '215',
        features: [
          'Pronta para Morar',
          'Documentação 100% Regularizada',
          'Área Gourmet com Churrasqueira',
          'Piscina com Preparação para Aquecimento',
          'Móveis Planejados na Cozinha e Suítes',
          'Energia Solar Fotovoltaica Instalada',
          'Condomínio com Portaria 24h e Lazer',
          'Aceita Permuta até 40%'
        ],
        gallery: [
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=900&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=900&auto=format&fit=crop'
        ]
      },
      broker: {
        name: 'Seu Corretor Especialista',
        creci: 'CRECI 54321-F',
        phone: '(11) 99999-9999',
        email: 'contato@imobiliaria.com.br',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        bio: 'Especialista em casas em condomínio. Agende sua visita presencial ou por vídeo chamada hoje mesmo.'
      },
      conversion: {
        mode: 'native_form',
        ctaText: 'Agendar Visita ao Imóvel',
        formTitle: 'Gostou deste imóvel?',
        formSubtitle: 'Deixe seu contato abaixo para tirar dúvidas, simular financiamento ou agendar uma visita.',
        showWhatsappFloating: true,
        whatsappMessage: 'Olá! Tenho interesse na Casa Contemporânea em Condomínio Fechado e gostaria de agendar uma visita.'
      }
    }
  }
};

// --- Conversion Widget (Native Form or Linked Lead Form Quiz) ---

const PageConversionCard: React.FC<{
  page: PageLead;
  linkedForm?: Form | null;
  isPreview?: boolean;
  darkTheme?: boolean;
}> = ({ page, linkedForm, isPreview = false, darkTheme = false }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State for linked multi-step form
  const [stepIndex, setStepIndex] = useState(0);
  const [quizData, setQuizData] = useState<Record<string, any>>({});

  const dispatchLeadAndWebhooks = async (dataPayload: Record<string, any>) => {
    if (isPreview) {
      alert('Modo de Pré-visualização: Na página pública, este envio salvará o Lead e disparará os Webhooks configurados.');
      setIsSubmitted(true);
      return;
    }

    setIsLoading(true);
    try {
      const lead: Lead = {
        id: `lead-${Date.now()}`,
        orgId: page.orgId,
        formId: page.id,
        data: {
          ...dataPayload,
          origin_type: 'PAGE_LEAD',
          page_name: page.name,
          property_title: page.property.title,
          property_price: page.property.price,
          property_location: page.property.location
        },
        utm: {},
        status: 'NEW',
        createdAt: new Date().toISOString()
      };

      await db.saveLead(lead);

      if (page.settings.pixelId && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
      }

      const currentIntegrations = await db.getIntegrations(page.orgId);
      if (page.settings.webhookIds && page.settings.webhookIds.length > 0) {
        const integrations = currentIntegrations.filter(i => page.settings.webhookIds.includes(i.id));
        const payloadObj = {
          ...lead,
          ...lead.data,
          lead_id: lead.id,
          submission_date: lead.createdAt,
          form_name: `[Page Lead] ${page.name}`
        };
        const payload = JSON.stringify(payloadObj);

        const promises = integrations.map(async (integration) => {
          if (!integration.url) return;
          try {
            const response = await fetch(integration.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            });
            if (!response.ok && response.type !== 'opaque') {
              throw new Error(`Status ${response.status}`);
            }
          } catch {
            try {
              await fetch(integration.url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: payload,
                keepalive: true,
                mode: 'no-cors'
              });
            } catch (fallbackErr) {
              console.error('Erro no envio de webhook da Page Lead:', fallbackErr);
            }
          }
        });

        await Promise.allSettled(promises);
      }

      if (page.settings.redirectUrl) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        window.location.href = page.settings.redirectUrl;
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar lead da página:', error);
      alert('Ocorreu um erro ao enviar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNativeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Por favor, preencha seu nome e WhatsApp.');
      return;
    }
    dispatchLeadAndWebhooks({ name, phone, email });
  };

  const cleanBrokerPhone = page.broker.phone.replace(/\D/g, '');
  const whatsappHref = cleanBrokerPhone
    ? `https://wa.me/${cleanBrokerPhone.startsWith('55') ? cleanBrokerPhone : `55${cleanBrokerPhone}`}?text=${encodeURIComponent(page.conversion.whatsappMessage || `Olá! Tenho interesse no imóvel: ${page.property.title}`)}`
    : '#';

  if (isSubmitted) {
    return (
      <div className={`p-8 rounded-3xl border text-center space-y-5 shadow-2xl ${darkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-2xl font-black">Solicitação Recebida!</h3>
        <p className={`text-sm leading-relaxed ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
          Recebemos seu interesse em <b>{page.property.title}</b>. Nosso especialista entrará em contato em instantes.
        </p>
        {cleanBrokerPhone && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <MessageCircle size={20} /> Chamar no WhatsApp Agora
          </a>
        )}
        <button
          onClick={() => {
            setIsSubmitted(false);
            setStepIndex(0);
          }}
          className={`text-xs font-bold underline ${darkTheme ? 'text-zinc-400' : 'text-gray-400'}`}
        >
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  // Linked Form Mode
  if (page.conversion.mode === 'linked_form' && linkedForm && linkedForm.steps.length > 0) {
    const steps = linkedForm.steps;
    const currentStep = steps[stepIndex] || steps[0];

    const handleQuizNext = () => {
      const inputTypes = ['short_text', 'long_text', 'email', 'standard_contact', 'single_choice', 'number', 'date'];
      const requiredBlocks = currentStep.columns.flatMap(col =>
        col.blocks.filter(b => b.settings.required && inputTypes.includes(b.type))
      );
      const missing = requiredBlocks.filter(b => {
        const key = b.settings.mappingKey || b.id;
        const val = quizData[key];
        return !val || (typeof val === 'string' && val.trim() === '');
      });
      if (missing.length > 0) {
        alert(`Preencha os campos obrigatórios: ${missing.map(b => b.settings.label).join(', ')}`);
        return;
      }
      if (stepIndex < steps.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        dispatchLeadAndWebhooks(quizData);
      }
    };

    return (
      <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-6 ${darkTheme ? 'bg-zinc-900/95 border-zinc-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
            <span>{page.conversion.formTitle || linkedForm.name}</span>
            <span>Etapa {stepIndex + 1} de {steps.length}</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${darkTheme ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((stepIndex + 1) / steps.length) * 100}%`,
                backgroundColor: page.primaryColor || '#2563eb'
              }}
            />
          </div>
        </div>

        <h3 className="text-xl font-bold leading-snug">{currentStep.title}</h3>

        <div className="space-y-4">
          {currentStep.columns.map(col => (
            <div key={col.id} className="space-y-4">
              {col.blocks.map(block => (
                <div key={block.id} className="space-y-1.5">
                  {block.type === 'heading' && <h4 className="font-bold text-base">{block.settings.label}</h4>}
                  {block.type === 'text' && <p className={`text-xs ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>{block.settings.label}</p>}
                  {(block.type === 'short_text' || block.type === 'email' || block.type === 'standard_contact') && (
                    <div>
                      <label className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
                        {block.settings.label}
                      </label>
                      <input
                        type={block.type === 'email' ? 'email' : 'text'}
                        placeholder={block.settings.placeholder}
                        value={quizData[block.settings.mappingKey || block.id] || ''}
                        onChange={e => {
                          let val = e.target.value;
                          if (block.type === 'standard_contact') val = formatPhone(val);
                          setQuizData({ ...quizData, [block.settings.mappingKey || block.id]: val });
                        }}
                        className={`w-full px-4 py-3.5 rounded-xl border outline-none text-sm font-medium ${darkTheme ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
                      />
                    </div>
                  )}
                  {block.type === 'single_choice' && (
                    <div className="space-y-2">
                      <label className={`text-[10px] font-bold uppercase tracking-widest block ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
                        {block.settings.label}
                      </label>
                      <div className="space-y-2">
                        {block.settings.options?.map(opt => {
                          const selected = quizData[block.settings.mappingKey || block.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setQuizData({ ...quizData, [block.settings.mappingKey || block.id]: opt });
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${selected
                                ? 'border-blue-500 bg-blue-600 text-white'
                                : darkTheme
                                  ? 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-200'
                                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                                }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => setStepIndex(stepIndex - 1)}
              className={`px-4 py-4 rounded-2xl font-bold text-sm border ${darkTheme ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleQuizNext}
            style={{ backgroundColor: page.primaryColor || '#2563eb' }}
            className="flex-1 py-4 px-6 text-white rounded-2xl font-bold text-sm shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : stepIndex === steps.length - 1 ? page.conversion.ctaText : 'Continuar'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    );
  }

  // Default: Native Form Mode
  return (
    <form
      onSubmit={handleNativeSubmit}
      className={`p-6 md:p-8 rounded-3xl border shadow-2xl space-y-5 ${darkTheme ? 'bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-md' : 'bg-white border-gray-100 text-gray-900'}`}
    >
      <div className="space-y-1.5">
        <span
          className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            backgroundColor: darkTheme ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 99, 235, 0.1)',
            color: page.primaryColor || (darkTheme ? '#fbbf24' : '#2563eb')
          }}
        >
          Atendimento Rápido
        </span>
        <h3 className="text-2xl font-black tracking-tight">{page.conversion.formTitle}</h3>
        <p className={`text-xs leading-relaxed ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
          {page.conversion.formSubtitle}
        </p>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
            Seu Nome Completo *
          </label>
          <input
            required
            type="text"
            placeholder="Digite seu nome"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full px-4 py-3.5 rounded-xl border outline-none text-sm font-medium transition-all ${darkTheme ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
          />
        </div>

        <div>
          <label className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
            Seu WhatsApp *
          </label>
          <input
            required
            type="tel"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            className={`w-full px-4 py-3.5 rounded-xl border outline-none text-sm font-medium transition-all ${darkTheme ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
          />
        </div>

        <div>
          <label className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${darkTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
            Seu Melhor E-mail
          </label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-3.5 rounded-xl border outline-none text-sm font-medium transition-all ${darkTheme ? 'bg-zinc-950 border-zinc-800 text-white focus:border-amber-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-600'}`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{ backgroundColor: page.primaryColor || '#2563eb' }}
        className="w-full py-4 px-6 text-white rounded-2xl font-black text-sm shadow-xl hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? 'Enviando...' : page.conversion.ctaText}
        {!isLoading && <ArrowRight size={18} />}
      </button>

      <div className="flex items-center justify-center gap-2 pt-1 opacity-60">
        <ShieldCheck size={14} />
        <span className="text-[10px] font-semibold">Seus dados estão 100% seguros e protegidos</span>
      </div>
    </form>
  );
};

// --- Template Renderer (Renders Luxury, Launch, or Ready templates) ---

export const PageLeadRenderer: React.FC<{
  page: PageLead;
  linkedForm?: Form | null;
  isPreview?: boolean;
}> = ({ page, linkedForm, isPreview = false }) => {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const embedVideo = getEmbedVideoUrl(page.property.videoUrl);
  const cleanBrokerPhone = page.broker.phone.replace(/\D/g, '');
  const whatsappHref = cleanBrokerPhone
    ? `https://wa.me/${cleanBrokerPhone.startsWith('55') ? cleanBrokerPhone : `55${cleanBrokerPhone}`}?text=${encodeURIComponent(page.conversion.whatsappMessage || `Olá! Tenho interesse no imóvel: ${page.property.title}`)}`
    : '#';

  const scrollToForm = () => {
    const el = document.getElementById('page-lead-capture');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ============================================================================
  // TEMPLATE 1: LUXURY / ALTO PADRÃO (DARK & GOLD)
  // ============================================================================
  if (page.templateId === 'luxury') {
    const accent = page.primaryColor || '#d97706';
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black relative">
        {/* Top Luxury Bar */}
        <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-zinc-950" style={{ backgroundColor: accent }}>
                <Award size={18} />
              </div>
              <div>
                <p className="text-xs font-black tracking-widest uppercase text-white">{page.broker.name}</p>
                <p className="text-[10px] text-zinc-400 tracking-wider">{page.broker.creci}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
                <MapPin size={14} style={{ color: accent }} /> {page.property.location}
              </span>
              <button
                onClick={scrollToForm}
                style={{ backgroundColor: accent }}
                className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-zinc-950 hover:opacity-90 transition-all"
              >
                Agendar Visita
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={page.property.heroImage}
              alt={page.property.title}
              className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[11px] font-black uppercase tracking-[3px]">
                <Star size={12} /> {page.property.badge}
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                {page.property.title}
              </h1>

              <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                {page.property.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400 pt-1">
                <MapPin size={16} style={{ color: accent }} />
                <span>{page.property.location}</span>
              </div>

              {/* Price & Specs Highlight */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-400 block mb-1">Valor de Investimento</span>
                  <div className="text-3xl md:text-4xl font-black" style={{ color: accent }}>{page.property.price}</div>
                  {page.property.priceNote && <p className="text-xs text-zinc-400 mt-1">{page.property.priceNote}</p>}
                </div>

                <div className="grid grid-cols-4 gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                  <div className="text-center px-2">
                    <p className="text-lg font-black text-white">{page.property.area}m²</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Área Útil</p>
                  </div>
                  <div className="text-center px-2 border-l border-zinc-800">
                    <p className="text-lg font-black text-white">{page.property.bedrooms}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Quartos</p>
                  </div>
                  <div className="text-center px-2 border-l border-zinc-800">
                    <p className="text-lg font-black text-white">{page.property.suites}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Suítes</p>
                  </div>
                  <div className="text-center px-2 border-l border-zinc-800">
                    <p className="text-lg font-black text-white">{page.property.parking}</p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Vagas</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="page-lead-capture" className="lg:col-span-5">
              <PageConversionCard page={page} linkedForm={linkedForm} isPreview={isPreview} darkTheme={true} />
            </div>
          </div>
        </section>

        {/* Description & Features */}
        <section className="py-16 md:py-24 border-t border-zinc-900 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-black uppercase tracking-[3px]" style={{ color: accent }}>Sobre a Propriedade</span>
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                Cada detalhe planejado para uma experiência única de moradia
              </h2>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {page.property.description}
              </p>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] font-black uppercase tracking-[3px]" style={{ color: accent }}>Diferenciais Exclusivos</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {page.property.features.map((feat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-zinc-950" style={{ backgroundColor: accent }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        {page.property.gallery.length > 0 && (
          <section className="py-16 md:py-24 bg-zinc-900/40 border-t border-zinc-900">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[3px]" style={{ color: accent }}>Tour Visual</span>
                  <h2 className="text-2xl md:text-4xl font-black text-white mt-1">Galeria de Ambientes</h2>
                </div>
                <p className="text-xs text-zinc-400">Clique nas imagens para ampliar em tela cheia</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {page.property.gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxImg(imgUrl)}
                    className={`group relative rounded-3xl overflow-hidden cursor-pointer border border-zinc-800 ${index === 0 ? 'sm:col-span-2 sm:row-span-2 aspect-[16/11]' : 'aspect-[4/3]'}`}
                  >
                    <img src={imgUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Video Section */}
        {embedVideo && (
          <section className="py-16 md:py-24 border-t border-zinc-900">
            <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-8 text-center">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[3px]" style={{ color: accent }}>Vídeo Tour</span>
                <h2 className="text-2xl md:text-4xl font-black text-white mt-1">Conheça Cada Detalhe em Vídeo</h2>
              </div>
              <div className="aspect-video w-full rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                <iframe src={embedVideo} className="w-full h-full" allowFullScreen title="Vídeo do Imóvel" />
              </div>
            </div>
          </section>
        )}

        {/* Broker Footer */}
        <footer className="py-16 border-t border-zinc-900 bg-zinc-950">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="p-8 md:p-10 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
                {page.broker.photoUrl ? (
                  <img src={page.broker.photoUrl} alt={page.broker.name} className="w-24 h-24 rounded-full object-cover border-2" style={{ borderColor: accent }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-zinc-950" style={{ backgroundColor: accent }}>
                    {page.broker.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-1.5 max-w-md">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {page.broker.creci}
                  </span>
                  <h3 className="text-2xl font-black text-white">{page.broker.name}</h3>
                  {page.broker.bio && <p className="text-xs text-zinc-400 leading-relaxed">{page.broker.bio}</p>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {cleanBrokerPhone && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <MessageCircle size={18} /> Falar no WhatsApp
                  </a>
                )}
                <button
                  onClick={scrollToForm}
                  style={{ backgroundColor: accent }}
                  className="px-6 py-4 rounded-2xl text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition-all"
                >
                  Solicitar Contato
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-zinc-600 uppercase tracking-[4px] mt-10">
              Powered by Lead Form • Page Lead
            </p>
          </div>
        </footer>

        {/* Floating WhatsApp */}
        {page.conversion.showWhatsappFloating && cleanBrokerPhone && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
            title="Chamar no WhatsApp"
          >
            <MessageCircle size={26} />
          </a>
        )}

        {/* Lightbox */}
        {lightboxImg && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
            <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full"><X size={24} /></button>
            <img src={lightboxImg} alt="Ampliada" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // TEMPLATE 2: LANÇAMENTO NA PLANTA (MODERNO / HIGH CONVERSION)
  // ============================================================================
  if (page.templateId === 'launch') {
    const accent = page.primaryColor || '#2563eb';
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
        {/* Top Announcement Bar */}
        <div className="text-white text-center py-2.5 px-4 text-xs font-bold tracking-wide" style={{ backgroundColor: accent }}>
          🔥 {page.property.badge} — {page.property.priceNote}
        </div>

        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={page.property.heroImage} alt={page.property.title} className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest">
                <Sparkles size={14} className="text-amber-400" /> {page.property.location}
              </div>

              <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                {page.property.title}
              </h1>

              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                {page.property.subtitle}
              </p>

              {/* Launch Specs Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                  <Bed size={20} className="text-blue-400 mb-1" />
                  <p className="text-lg font-black">{page.property.bedrooms}</p>
                  <p className="text-[11px] text-slate-300">Dormitórios</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                  <Bath size={20} className="text-blue-400 mb-1" />
                  <p className="text-lg font-black">{page.property.suites}</p>
                  <p className="text-[11px] text-slate-300">Suítes</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                  <Maximize2 size={20} className="text-blue-400 mb-1" />
                  <p className="text-lg font-black">{page.property.area} m²</p>
                  <p className="text-[11px] text-slate-300">Plantas Inteligentes</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                  <Car size={20} className="text-blue-400 mb-1" />
                  <p className="text-lg font-black">{page.property.parking}</p>
                  <p className="text-[11px] text-slate-300">Vagas</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/30 to-indigo-600/20 border border-blue-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block">Condição Especial de Lançamento</span>
                  <span className="text-2xl md:text-3xl font-black text-white">{page.property.price}</span>
                </div>
                <span className="text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-xl self-start sm:self-center">
                  {page.property.priceNote}
                </span>
              </div>
            </div>

            <div id="page-lead-capture" className="lg:col-span-5">
              <PageConversionCard page={page} linkedForm={linkedForm} isPreview={isPreview} darkTheme={false} />
            </div>
          </div>
        </section>

        {/* Project Highlights & Amenities */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                O Empreendimento
              </span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Por que investir ou morar no {page.name}?
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {page.property.description}
              </p>
              <button
                onClick={scrollToForm}
                style={{ backgroundColor: accent }}
                className="px-8 py-4 rounded-2xl text-white font-bold text-sm shadow-xl hover:opacity-95 transition-all inline-flex items-center gap-2"
              >
                Receber Plantas e Tabela <ArrowRight size={18} />
              </button>
            </div>

            <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900">Lazer Completo & Diferenciais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {page.property.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-7 h-7 rounded-xl text-white flex items-center justify-center shrink-0" style={{ backgroundColor: accent }}>
                      <Check size={15} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        {page.property.gallery.length > 0 && (
          <section className="py-16 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-600">Perspectivas Ilustradas</span>
                <h2 className="text-3xl font-black text-slate-900">Conheça o Padrão do Empreendimento</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {page.property.gallery.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImg(img)}
                    className="group relative aspect-[4/3] rounded-3xl overflow-hidden border shadow-sm cursor-pointer"
                  >
                    <img src={img} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Video */}
        {embedVideo && (
          <section className="py-16 max-w-5xl mx-auto px-4 md:px-8">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border">
              <iframe src={embedVideo} className="w-full h-full" allowFullScreen title="Vídeo de Apresentação" />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-14">
          <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              {page.broker.photoUrl && (
                <img src={page.broker.photoUrl} alt={page.broker.name} className="w-16 h-16 rounded-2xl object-cover" />
              )}
              <div>
                <p className="font-black text-lg">{page.broker.name}</p>
                <p className="text-xs text-slate-400">{page.broker.creci} • {page.broker.phone}</p>
                {page.broker.bio && <p className="text-xs text-slate-400 mt-1 max-w-md">{page.broker.bio}</p>}
              </div>
            </div>
            {cleanBrokerPhone && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2"
              >
                <MessageCircle size={18} /> Atendimento via WhatsApp
              </a>
            )}
          </div>
        </footer>

        {page.conversion.showWhatsappFloating && cleanBrokerPhone && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
          >
            <MessageCircle size={26} />
          </a>
        )}

        {lightboxImg && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
            <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full"><X size={24} /></button>
            <img src={lightboxImg} alt="Ampliada" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // TEMPLATE 3: IMÓVEL PRONTO / OPORTUNIDADE (CLEAN & DIRECT)
  // ============================================================================
  const accent = page.primaryColor || '#059669';
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans relative">
      {/* Clean Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {page.broker.photoUrl ? (
              <img src={page.broker.photoUrl} alt={page.broker.name} className="w-10 h-10 rounded-full object-cover border" />
            ) : (
              <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: accent }}>
                {page.broker.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">{page.broker.name}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{page.broker.creci}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {cleanBrokerPhone && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            <button
              onClick={scrollToForm}
              style={{ backgroundColor: accent }}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all"
            >
              Agendar Visita
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12">
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Cover Photo */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-lg border bg-white">
              <img src={page.property.heroImage} alt={page.property.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-lg" style={{ backgroundColor: accent }}>
                  {page.property.badge}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {page.property.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {page.property.gallery.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setLightboxImg(img)}
                    className="aspect-[4/3] rounded-2xl overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Title & Specs Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <MapPin size={14} style={{ color: accent }} /> {page.property.location}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">{page.property.title}</h1>
                  <p className="text-sm text-gray-500">{page.property.subtitle}</p>
                </div>
                <div className="md:text-right shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Valor do Imóvel</span>
                  <p className="text-2xl md:text-3xl font-black" style={{ color: accent }}>{page.property.price}</p>
                  {page.property.priceNote && <p className="text-xs text-gray-400 font-medium">{page.property.priceNote}</p>}
                </div>
              </div>

              {/* Technical Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
                  <Maximize2 size={20} style={{ color: accent }} />
                  <div>
                    <p className="text-base font-black text-gray-900">{page.property.area} m²</p>
                    <p className="text-[11px] text-gray-400 font-medium">Área Útil</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
                  <Bed size={20} style={{ color: accent }} />
                  <div>
                    <p className="text-base font-black text-gray-900">{page.property.bedrooms}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Quartos</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
                  <Bath size={20} style={{ color: accent }} />
                  <div>
                    <p className="text-base font-black text-gray-900">{page.property.suites}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Suítes</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
                  <Car size={20} style={{ color: accent }} />
                  <div>
                    <p className="text-base font-black text-gray-900">{page.property.parking}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Vagas</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 pt-2">
                <h3 className="text-lg font-bold text-gray-900">Descrição do Imóvel</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{page.property.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-lg font-bold text-gray-900"> Destaques e Comodidades</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {page.property.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                      <CheckCircle2 size={16} style={{ color: accent }} className="shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {embedVideo && (
              <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Vídeo do Imóvel</h3>
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <iframe src={embedVideo} className="w-full h-full" allowFullScreen title="Vídeo do Imóvel" />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Conversion Sidebar */}
          <div id="page-lead-capture" className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <PageConversionCard page={page} linkedForm={linkedForm} isPreview={isPreview} darkTheme={false} />

            {/* Broker Mini Card */}
            <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4">
              {page.broker.photoUrl ? (
                <img src={page.broker.photoUrl} alt={page.broker.name} className="w-16 h-16 rounded-2xl object-cover border" />
              ) : (
                <div className="w-16 h-16 rounded-2xl text-white flex items-center justify-center font-black text-xl shrink-0" style={{ backgroundColor: accent }}>
                  {page.broker.name.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{page.broker.name}</p>
                <p className="text-xs text-gray-400 font-medium">{page.broker.creci}</p>
                {page.broker.bio && <p className="text-xs text-gray-500 leading-snug">{page.broker.bio}</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {page.conversion.showWhatsappFloating && cleanBrokerPhone && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
        >
          <MessageCircle size={26} />
        </a>
      )}

      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full"><X size={24} /></button>
          <img src={lightboxImg} alt="Ampliada" className="max-w-full max-h-[90vh] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PUBLIC PAGE LEAD VIEW (/p/:orgSlug/:pageSlug)
// ============================================================================

export const PublicPageLeadView: React.FC = () => {
  const { orgSlug, pageSlug } = useParams();
  const [page, setPage] = useState<PageLead | null>(null);
  const [linkedForm, setLinkedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const found = await db.getPageBySlug(orgSlug || '', pageSlug || '');
        if (found) {
          setPage(found);

          if (found.conversion.mode === 'linked_form' && found.conversion.linkedFormId) {
            const orgForms = await db.getForms(found.orgId);
            const targetForm = orgForms.find(f => f.id === found.conversion.linkedFormId) || null;
            setLinkedForm(targetForm);
          }

          if (found.settings.pixelId) {
            const script = document.createElement('script');
            script.innerHTML = `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${found.settings.pixelId}');
              fbq('track', 'PageView');
            `;
            document.head.appendChild(script);
          }

          if (found.settings.gtmId) {
            const script = document.createElement('script');
            script.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${found.settings.gtmId}');
            `;
            document.head.appendChild(script);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar Page Lead pública:', e);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [orgSlug, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="w-14 h-14 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-[4px] text-[10px]">Carregando Imóvel...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Página Não Encontrada</h2>
        <p className="text-gray-500 font-medium max-w-xs">Verifique se o endereço da Landing Page do imóvel está correto.</p>
      </div>
    );
  }

  return <PageLeadRenderer page={page} linkedForm={linkedForm} />;
};

// ============================================================================
// PAGE LEAD LIST VIEW (/dashboard/pages)
// ============================================================================

export const PageLeadListView: React.FC<{ user: User | null; isGlobalView: boolean }> = ({ user, isGlobalView }) => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PageLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChoosingTemplate, setIsChoosingTemplate] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplateId>('luxury');
  const [creating, setCreating] = useState(false);

  const [sharingPage, setSharingPage] = useState<PageLead | null>(null);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const list = await db.getPages(user?.orgId, user?.email, isGlobalView);
        setPages(list || []);
      } catch (e) {
        console.error('Erro ao buscar páginas:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, [user, isGlobalView]);

  const handleCreatePage = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const preset = TEMPLATE_PRESETS[selectedTemplate];
      const titleName = newPageName.trim() || preset.defaultData.property.title;
      const slugBase = titleName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 35);

      const newPage: PageLead = {
        id: `page-${Date.now()}`,
        orgId: user.orgId,
        name: titleName,
        slug: `${slugBase || 'imovel'}-${Date.now().toString().slice(-4)}`,
        status: FormStatus.ACTIVE,
        ... JSON.parse(JSON.stringify(preset.defaultData)),
        settings: { webhookIds: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (user.name) {
        newPage.broker.name = user.name;
      }
      if (user.email) {
        newPage.broker.email = user.email;
      }

      await db.savePage(newPage);
      navigate(`/dashboard/pages/${newPage.id}`);
    } catch (e) {
      alert('Erro ao criar Landing Page.');
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, page: PageLead) => {
    e.stopPropagation();
    try {
      const copy: PageLead = {
        ...JSON.parse(JSON.stringify(page)),
        id: `page-${Date.now()}`,
        name: `${page.name} (Cópia)`,
        slug: `${page.slug}-copia-${Date.now().toString().slice(-4)}`,
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.savePage(copy);
      setPages([copy, ...pages]);
    } catch {
      alert('Erro ao duplicar página.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta Landing Page? Os leads capturados continuarão salvos.')) return;
    try {
      await db.deletePage(id);
      setPages(pages.filter(p => p.id !== id));
    } catch {
      alert('Erro ao excluir página.');
    }
  };

  const handleShare = async () => {
    if (!sharingPage || !shareEmail) return;
    try {
      await db.sharePage(sharingPage.id, shareEmail);
      alert(`Landing Page compartilhada com ${shareEmail}`);
      setSharingPage(null);
      setShareEmail('');
    } catch {
      alert('Erro ao compartilhar página.');
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Page Lead...</div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2">
            <Sparkles size={12} /> Novo Módulo
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Page Lead</h2>
          <p className="text-gray-500 font-medium">Crie Landing Pages exclusivas para seus imóveis em segundos usando templates prontos.</p>
        </div>
        <button
          onClick={() => setIsChoosingTemplate(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} /> Nova Landing Page
        </button>
      </header>

      {/* Template Picker Modal */}
      {isChoosingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[36px] p-6 md:p-10 max-w-4xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Escolha o Template do Imóvel</h3>
                <p className="text-sm text-gray-500">Todos os modelos já vêm estruturados para alta conversão e podem ser 100% editados.</p>
              </div>
              <button onClick={() => setIsChoosingTemplate(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                Nome do Imóvel / Empreendimento
              </label>
              <input
                type="text"
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                placeholder="Ex: Cobertura Duplex Jardins, Residencial Horizon, Casa Condomínio..."
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(Object.values(TEMPLATE_PRESETS) as TemplatePreset[]).map(preset => {
                const isSelected = selectedTemplate === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedTemplate(preset.id)}
                    className={`rounded-3xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col ${isSelected ? 'border-blue-600 ring-4 ring-blue-600/10 shadow-xl' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                      <img src={preset.previewImage} alt={preset.name} className="w-full h-full object-cover" />
                      <span className={`absolute top-3 left-3 text-[10px] font-black uppercase px-3 py-1 rounded-full ${preset.badgeColor}`}>
                        {preset.name}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-black text-gray-900 text-lg">{preset.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{preset.tagline}</p>
                      </div>
                      <div className={`text-xs font-bold flex items-center gap-1.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                        {isSelected ? 'Modelo Selecionado' : 'Selecionar Modelo'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setIsChoosingTemplate(false)}
                className="px-6 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                disabled={creating}
                onClick={handleCreatePage}
                className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? 'Criando Página...' : 'Criar e Personalizar Imóvel'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {sharingPage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">Compartilhar Landing Page</h3>
              <button onClick={() => setSharingPage(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <p className="text-sm text-gray-500">Insira o e-mail do corretor/usuário para compartilhar a página <b>{sharingPage.name}</b>.</p>
            <input
              type="email"
              value={shareEmail}
              onChange={e => setShareEmail(e.target.value)}
              placeholder="corretor@email.com"
              className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none focus:border-blue-600"
            />
            <button onClick={handleShare} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">
              Compartilhar Agora
            </button>
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <div className="bg-white rounded-[40px] border p-12 text-center space-y-6 max-w-xl mx-auto">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
            <Building2 size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Crie sua primeira Landing Page de Imóvel</h3>
            <p className="text-sm text-gray-500">
              Escolha entre os templates de Alto Padrão, Lançamento na Planta ou Imóvel Pronto, ajuste as fotos e valores e comece a receber leads qualificados.
            </p>
          </div>
          <button
            onClick={() => setIsChoosingTemplate(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} /> Escolher Template Pronto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pages.map(page => {
            const preset = TEMPLATE_PRESETS[page.templateId] || TEMPLATE_PRESETS.ready;
            return (
              <div
                key={page.id}
                onClick={() => navigate(`/dashboard/pages/${page.id}`)}
                className="bg-white rounded-[36px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col group"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                  <img
                    src={page.property.heroImage || preset.previewImage}
                    alt={page.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className={`absolute top-4 left-4 text-[10px] font-black uppercase px-3 py-1 rounded-full ${preset.badgeColor}`}>
                    {preset.name}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs opacity-80 flex items-center gap-1 truncate">
                      <MapPin size={12} /> {page.property.location}
                    </p>
                    <p className="text-lg font-black truncate">{page.property.price}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 truncate">{page.name}</h3>
                    <p className="text-xs text-gray-400 truncate mt-1">{page.property.title}</p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <Link
                      to={`/p/leadsign/${page.slug}`}
                      target="_blank"
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={14} /> Ver Página
                    </Link>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); setSharingPage(page); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Compartilhar"
                      >
                        <Share2 size={17} />
                      </button>
                      <button
                        onClick={e => handleDuplicate(e, page)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Duplicar"
                      >
                        <Copy size={17} />
                      </button>
                      <button
                        onClick={e => handleDelete(e, page.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PAGE LEAD DETAIL & VISUAL EDITOR (/dashboard/pages/:pageId)
// ============================================================================

export const PageLeadDetailView: React.FC<{ user: User | null; isGlobalView: boolean }> = ({ user, isGlobalView }) => {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState<PageLead | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [activeTab, setActiveTab] = useState<'editor' | 'leads' | 'settings'>('editor');
  const [editorSection, setEditorSection] = useState<'template' | 'property' | 'media' | 'broker' | 'conversion'>('property');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);

  const [newFeature, setNewFeature] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pagesList, formsList, intsList] = await Promise.all([
          db.getPages(user?.orgId, user?.email, isGlobalView),
          db.getForms(user?.orgId, user?.email, isGlobalView),
          db.getIntegrations(user?.orgId, isGlobalView)
        ]);
        const found = (pagesList || []).find(p => p.id === pageId);
        if (found) {
          setPage(found);
          const pageLeads = await db.getLeadsByForm(found.id);
          setLeads(pageLeads || []);
        }
        setForms(formsList || []);
        setAvailableIntegrations(intsList || []);
      } catch (e) {
        console.error('Erro ao carregar editor do Page Lead:', e);
      }
    };
    fetchAll();
  }, [pageId, user, isGlobalView]);

  const handleSave = async () => {
    if (!page || !user) return;
    setIsSaving(true);
    try {
      const updated = { ...page, updatedAt: new Date().toISOString() };
      await db.savePage(updated);
      setPage(updated);
      alert('✅ Landing Page salva com sucesso!');
    } catch (e) {
      alert('❌ Erro ao salvar página: ' + (e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTemplatePreset = (templateId: PageTemplateId, overwriteContent: boolean) => {
    if (!page) return;
    const preset = TEMPLATE_PRESETS[templateId];
    if (overwriteContent) {
      setPage({
        ...page,
        templateId,
        primaryColor: preset.defaultData.primaryColor,
        property: JSON.parse(JSON.stringify(preset.defaultData.property)),
        conversion: {
          ...page.conversion,
          ctaText: preset.defaultData.conversion.ctaText,
          formTitle: preset.defaultData.conversion.formTitle,
          formSubtitle: preset.defaultData.conversion.formSubtitle
        }
      });
    } else {
      setPage({
        ...page,
        templateId,
        primaryColor: preset.defaultData.primaryColor
      });
    }
  };

  const copyPublicUrl = () => {
    if (!page) return;
    const url = `${window.location.origin}/#/p/leadsign/${page.slug}`;
    navigator.clipboard.writeText(url);
    alert('🔗 Link da Landing Page copiado para a área de transferência!');
  };

  if (!page) return <div className="p-20 text-center font-bold">Carregando Editor do Page Lead...</div>;

  const linkedForm = forms.find(f => f.id === page.conversion.linkedFormId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/pages')} className="p-2.5 border rounded-2xl hover:bg-gray-50">
            <ChevronLeft size={20} />
          </button>
          <div>
            <input
              value={page.name}
              onChange={e => setPage({ ...page, name: e.target.value })}
              className="text-xl md:text-2xl font-black text-gray-900 bg-transparent border-b border-transparent focus:border-blue-600 outline-none"
            />
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">/p/leadsign/{page.slug}</span>
              <button onClick={copyPublicUrl} className="text-[10px] font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1">
                <Copy size={11} /> Copiar Link
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/p/leadsign/${page.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 border rounded-2xl font-bold text-xs md:text-sm transition-all"
          >
            <ExternalLink size={16} /> Ver Página Pública
          </Link>
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs md:text-sm shadow-lg shadow-blue-100 disabled:opacity-50 transition-all"
          >
            <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'editor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Editor & Informações
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${activeTab === 'leads' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Leads Capturados
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-600">{leads.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Pixel & Webhooks
          </button>
        </div>

        {activeTab === 'editor' && (
          <div className="flex lg:hidden gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setMobileViewMode('edit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${mobileViewMode === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              Editar Dados
            </button>
            <button
              onClick={() => setMobileViewMode('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${mobileViewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              Ver Preview
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: EDITOR & LIVE PREVIEW */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Structured Form Controls */}
          <div className={`lg:col-span-5 bg-white rounded-3xl border shadow-sm overflow-hidden ${mobileViewMode === 'preview' ? 'hidden lg:block' : 'block'}`}>
            {/* Section Selector Bar */}
            <div className="flex overflow-x-auto border-b bg-gray-50/70 p-2 gap-1">
              {[
                { id: 'property', label: '1. Imóvel' },
                { id: 'media', label: '2. Fotos & Lazer' },
                { id: 'broker', label: '3. Corretor' },
                { id: 'conversion', label: '4. Captura' },
                { id: 'template', label: '5. Template' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setEditorSection(sec.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${editorSection === sec.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* SECTION: PROPERTY DETAILS */}
              {editorSection === 'property' && (
                <div className="space-y-4">
                  <h3 className="font-black text-gray-900 text-base border-b pb-2">Informações do Imóvel</h3>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Selo de Destaque (Topo)</label>
                    <input
                      value={page.property.badge}
                      onChange={e => setPage({ ...page, property: { ...page.property, badge: e.target.value } })}
                      placeholder="Ex: EXCLUSIVIDADE ALTO PADRÃO"
                      className="w-full px-4 py-2.5 border rounded-xl text-sm font-medium outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Título Principal (Headline)</label>
                    <input
                      value={page.property.title}
                      onChange={e => setPage({ ...page, property: { ...page.property, title: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Subtítulo Persuasivo</label>
                    <textarea
                      rows={2}
                      value={page.property.subtitle}
                      onChange={e => setPage({ ...page, property: { ...page.property, subtitle: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Preço / Valor</label>
                      <input
                        value={page.property.price}
                        onChange={e => setPage({ ...page, property: { ...page.property, price: e.target.value } })}
                        placeholder="Ex: R$ 1.450.000"
                        className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold text-emerald-700 outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Condição / Sub-preço</label>
                      <input
                        value={page.property.priceNote}
                        onChange={e => setPage({ ...page, property: { ...page.property, priceNote: e.target.value } })}
                        placeholder="Ex: Entrada parcelada em 36x"
                        className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Localização (Bairro / Cidade)</label>
                    <input
                      value={page.property.location}
                      onChange={e => setPage({ ...page, property: { ...page.property, location: e.target.value } })}
                      placeholder="Ex: Jardins • São Paulo, SP"
                      className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Specs */}
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Ficha Técnica</label>
                    <div className="grid grid-cols-4 gap-2.5">
                      <div>
                        <span className="text-[10px] text-gray-500 block mb-1">Área (m²)</span>
                        <input
                          value={page.property.area}
                          onChange={e => setPage({ ...page, property: { ...page.property, area: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block mb-1">Quartos</span>
                        <input
                          value={page.property.bedrooms}
                          onChange={e => setPage({ ...page, property: { ...page.property, bedrooms: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block mb-1">Suítes</span>
                        <input
                          value={page.property.suites}
                          onChange={e => setPage({ ...page, property: { ...page.property, suites: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block mb-1">Vagas</span>
                        <input
                          value={page.property.parking}
                          onChange={e => setPage({ ...page, property: { ...page.property, parking: e.target.value } })}
                          className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Descrição Completa do Imóvel</label>
                    <textarea
                      rows={5}
                      value={page.property.description}
                      onChange={e => setPage({ ...page, property: { ...page.property, description: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: MEDIA & FEATURES */}
              {editorSection === 'media' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-black text-gray-900 text-base border-b pb-2">Foto Principal & Vídeo</h3>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL da Foto de Capa (Hero)</label>
                      <input
                        value={page.property.heroImage}
                        onChange={e => setPage({ ...page, property: { ...page.property, heroImage: e.target.value } })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 border rounded-xl text-xs font-mono outline-none focus:border-blue-600"
                      />
                    </div>
                    {page.property.heroImage && (
                      <img src={page.property.heroImage} alt="Capa" className="w-full h-36 object-cover rounded-2xl border" />
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Vídeo do Imóvel (YouTube ou Vimeo - Opcional)</label>
                      <input
                        value={page.property.videoUrl || ''}
                        onChange={e => setPage({ ...page, property: { ...page.property, videoUrl: e.target.value } })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 border rounded-xl text-xs font-mono outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="space-y-3 pt-4 border-t">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Galeria de Fotos ({page.property.gallery.length})</label>
                    <div className="flex gap-2">
                      <input
                        value={newGalleryUrl}
                        onChange={e => setNewGalleryUrl(e.target.value)}
                        placeholder="Cole a URL da foto (https://...)"
                        className="flex-1 px-3.5 py-2 border rounded-xl text-xs font-mono outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newGalleryUrl.trim()) return;
                          setPage({
                            ...page,
                            property: { ...page.property, gallery: [...page.property.gallery, newGalleryUrl.trim()] }
                          });
                          setNewGalleryUrl('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        + Foto
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {page.property.gallery.map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border aspect-video bg-gray-50">
                          <img src={img} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPage({
                              ...page,
                              property: { ...page.property, gallery: page.property.gallery.filter((_, idx) => idx !== i) }
                            })}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features / Amenities */}
                  <div className="space-y-3 pt-4 border-t">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Diferenciais e Lazer ({page.property.features.length})</label>
                    <div className="flex gap-2">
                      <input
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!newFeature.trim()) return;
                            setPage({
                              ...page,
                              property: { ...page.property, features: [...page.property.features, newFeature.trim()] }
                            });
                            setNewFeature('');
                          }
                        }}
                        placeholder="Ex: Piscina Aquecida, Portaria 24h..."
                        className="flex-1 px-3.5 py-2 border rounded-xl text-xs outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFeature.trim()) return;
                          setPage({
                            ...page,
                            property: { ...page.property, features: [...page.property.features, newFeature.trim()] }
                          });
                          setNewFeature('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        + Item
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {page.property.features.map((feat, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium">
                          {feat}
                          <button
                            type="button"
                            onClick={() => setPage({
                              ...page,
                              property: { ...page.property, features: page.property.features.filter((_, i) => i !== idx) }
                            })}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: BROKER INFO */}
              {editorSection === 'broker' && (
                <div className="space-y-4">
                  <h3 className="font-black text-gray-900 text-base border-b pb-2">Dados do Corretor / Imobiliária</h3>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nome de Exibição</label>
                    <input
                      value={page.broker.name}
                      onChange={e => setPage({ ...page, broker: { ...page.broker, name: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">CRECI</label>
                      <input
                        value={page.broker.creci}
                        onChange={e => setPage({ ...page, broker: { ...page.broker, creci: e.target.value } })}
                        placeholder="CRECI 12345-F"
                        className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">WhatsApp de Atendimento</label>
                      <input
                        value={page.broker.phone}
                        onChange={e => setPage({ ...page, broker: { ...page.broker, phone: formatPhone(e.target.value) } })}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold text-blue-600 outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL da Foto do Corretor / Logo</label>
                    <input
                      value={page.broker.photoUrl || ''}
                      onChange={e => setPage({ ...page, broker: { ...page.broker, photoUrl: e.target.value } })}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 border rounded-xl text-xs font-mono outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Apresentação / Bio Curta</label>
                    <textarea
                      rows={3}
                      value={page.broker.bio || ''}
                      onChange={e => setPage({ ...page, broker: { ...page.broker, bio: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-600 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: CONVERSION & CAPTURE */}
              {editorSection === 'conversion' && (
                <div className="space-y-4">
                  <h3 className="font-black text-gray-900 text-base border-b pb-2">Captura de Leads na Página</h3>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block">Modo de Conversão</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPage({ ...page, conversion: { ...page.conversion, mode: 'native_form' } })}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${page.conversion.mode === 'native_form' ? 'border-blue-600 bg-blue-50/60' : 'border-gray-200'}`}
                      >
                        <p className="text-xs font-black text-gray-900">Formulário Direto na Página (Recomendado)</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Captura Nome, WhatsApp e E-mail diretamente e envia aos seus Leads e Webhooks.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPage({ ...page, conversion: { ...page.conversion, mode: 'linked_form', linkedFormId: page.conversion.linkedFormId || forms[0]?.id } })}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${page.conversion.mode === 'linked_form' ? 'border-blue-600 bg-blue-50/60' : 'border-gray-200'}`}
                      >
                        <p className="text-xs font-black text-gray-900">Vincular Fluxo Interativo do Lead Form</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Incorpora as etapas de qualificação de um Formulário já criado por você.</p>
                      </button>
                    </div>
                  </div>

                  {page.conversion.mode === 'linked_form' && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Selecionar Fluxo do Lead Form</label>
                      <select
                        value={page.conversion.linkedFormId || ''}
                        onChange={e => setPage({ ...page, conversion: { ...page.conversion, linkedFormId: e.target.value } })}
                        className="w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none bg-gray-50"
                      >
                        <option value="">Selecione um formulário...</option>
                        {forms.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Título do Box de Captura</label>
                    <input
                      value={page.conversion.formTitle}
                      onChange={e => setPage({ ...page, conversion: { ...page.conversion, formTitle: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Subtítulo do Box</label>
                    <textarea
                      rows={2}
                      value={page.conversion.formSubtitle}
                      onChange={e => setPage({ ...page, conversion: { ...page.conversion, formSubtitle: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Texto do Botão Principal (CTA)</label>
                    <input
                      value={page.conversion.ctaText}
                      onChange={e => setPage({ ...page, conversion: { ...page.conversion, ctaText: e.target.value } })}
                      className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="pt-3 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Botão Flutuante de WhatsApp</p>
                        <p className="text-[11px] text-gray-400">Exibe ícone do WhatsApp no canto da página</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPage({ ...page, conversion: { ...page.conversion, showWhatsappFloating: !page.conversion.showWhatsappFloating } })}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${page.conversion.showWhatsappFloating ? 'bg-emerald-600' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${page.conversion.showWhatsappFloating ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mensagem Automática do WhatsApp</label>
                      <input
                        value={page.conversion.whatsappMessage || ''}
                        onChange={e => setPage({ ...page, conversion: { ...page.conversion, whatsappMessage: e.target.value } })}
                        className="w-full px-4 py-2.5 border rounded-xl text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: TEMPLATE & STYLE */}
              {editorSection === 'template' && (
                <div className="space-y-5">
                  <h3 className="font-black text-gray-900 text-base border-b pb-2">Modelo & Estilo Visual</h3>

                  <div className="space-y-3">
                    {(Object.values(TEMPLATE_PRESETS) as TemplatePreset[]).map(preset => {
                      const active = page.templateId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleApplyTemplatePreset(preset.id, false)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${active ? 'border-blue-600 bg-blue-50/40' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm text-gray-900">{preset.name}</span>
                            {active && <span className="text-[10px] font-bold text-blue-600 uppercase">Ativo</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{preset.tagline}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Cor de Destaque Principal (Botões e Selos)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={page.primaryColor || '#2563eb'}
                        onChange={e => setPage({ ...page, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-xl border cursor-pointer"
                      />
                      <div className="flex flex-wrap gap-2">
                        {['#d97706', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#0f172a'].map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setPage({ ...page, primaryColor: color })}
                            style={{ backgroundColor: color }}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Live Interactive Preview */}
          <div className={`lg:col-span-7 space-y-3 ${mobileViewMode === 'edit' ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white px-5 py-3 rounded-2xl border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview em Tempo Real</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  title="Visualização Desktop"
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  title="Visualização Celular"
                >
                  <Smartphone size={16} />
                </button>
              </div>
            </div>

            <div className="bg-gray-200/70 rounded-[32px] p-3 md:p-6 border flex justify-center overflow-hidden">
              <div
                className={`bg-white rounded-[24px] shadow-2xl border overflow-y-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'w-[375px] h-[680px]' : 'w-full h-[680px]'}`}
              >
                <PageLeadRenderer page={page} linkedForm={linkedForm} isPreview={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADS CAPTURED BY THIS PAGE */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Leads Capturados neste Imóvel</h3>
              <p className="text-xs text-gray-400">Todos os contatos também aparecem na aba geral de Leads.</p>
            </div>
          </div>
          {leads.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">
              Nenhum lead capturado nesta página ainda. Compartilhe o link público para começar!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leads.map(lead => (
                <div key={lead.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">{lead.data.name || lead.data.full_name || 'Lead sem nome'}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {lead.data.phone && <span className="font-bold text-blue-600">{lead.data.phone}</span>}
                      {lead.data.email && <span>{lead.data.email}</span>}
                      <span>{new Date(lead.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.data.phone && (
                      <a
                        href={`https://wa.me/55${String(lead.data.phone).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle size={14} /> Chamar
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS, PIXEL & WEBHOOKS */}
      {activeTab === 'settings' && (
        <div className="p-6 md:p-8 bg-white rounded-[32px] border shadow-sm space-y-6 max-w-2xl mx-auto">
          <h3 className="font-bold text-xl border-b pb-4">Configurações, Rastreamento & Webhooks</h3>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nome Interno da Página</label>
            <input
              value={page.name}
              onChange={e => setPage({ ...page, name: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Slug da URL Amigável</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">/p/leadsign/</span>
              <input
                value={page.slug}
                onChange={e => setPage({ ...page, slug: e.target.value })}
                className="flex-1 px-4 py-3 border rounded-xl outline-none font-bold text-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL de Redirecionamento (Opcional após envio)</label>
            <input
              value={page.settings.redirectUrl || ''}
              onChange={e => setPage({ ...page, settings: { ...page.settings, redirectUrl: e.target.value } })}
              placeholder="https://..."
              className="w-full px-4 py-3 border rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pixel ID (Meta / Facebook)</label>
              <input
                value={page.settings.pixelId || ''}
                onChange={e => setPage({ ...page, settings: { ...page.settings, pixelId: e.target.value } })}
                placeholder="Ex: 1234567890"
                className="w-full px-4 py-3 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Google Tag Manager (GTM ID)</label>
              <input
                value={page.settings.gtmId || ''}
                onChange={e => setPage({ ...page, settings: { ...page.settings, gtmId: e.target.value } })}
                placeholder="Ex: GTM-XXXXXX"
                className="w-full px-4 py-3 border rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-4">Webhooks Ativos para esta Landing Page</label>
            <div className="space-y-3">
              {availableIntegrations.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhuma integração cadastrada na aba Integrações.</p>
              ) : (
                availableIntegrations.map(int => {
                  const enabled = page.settings.webhookIds?.includes(int.id);
                  return (
                    <div key={int.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center">
                          <Webhook size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{int.name}</p>
                          <p className="text-[10px] text-gray-400 truncate w-48">{int.url}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentIds = page.settings.webhookIds || [];
                          const newIds = enabled
                            ? currentIds.filter(id => id !== int.id)
                            : [...currentIds, int.id];
                          setPage({ ...page, settings: { ...page.settings, webhookIds: newIds } });
                        }}
                        className={`w-10 h-5 rounded-full p-1 transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
