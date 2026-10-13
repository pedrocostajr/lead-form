import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, CheckCircle2, Star, ArrowRight, Zap, Shield, Sparkles, Smartphone,
  Globe, MessageCircle, BarChart3, Layers, FileText, ExternalLink, ChevronDown,
  ChevronUp, Lock, Users, Building2, Eye, ShieldCheck, Flame, Award, HeartHandshake,
  HelpCircle, PhoneCall, CheckCircle, Image as ImageIcon, Video, ArrowUpRight
} from 'lucide-react';

export const LandingPageView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [previewTab, setPreviewTab] = useState<'pagelead' | 'leadform'>('pagelead');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const checkoutMonthlyUrl = 'https://os.phoenixrise.com.br/k/pr_awszpobtrk5x';
  const checkoutAnnualUrl = 'https://os.phoenixrise.com.br/k/pr_gu5p32ovnmti';

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, []);

  const handleCheckoutClick = (planName: string, value: number) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: planName,
        value: value,
        currency: 'BRL'
      });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'O que está incluso na assinatura?',
      a: 'Você recebe acesso completo e irrestrito a duas ferramentas em uma única conta: o LeadForm (criador de formulários multi-etapas interativos tipo Typeform para captação e qualificação de clientes) e o PageLead (criador de landing pages exclusivas para seus imóveis de alto padrão, lançamentos e imóveis prontos). Além disso, inclui painel de leads, upload direto de fotos e integrações com Meta Pixel e Webhooks.'
    },
    {
      q: 'Preciso ter conhecimentos de programação ou design?',
      a: 'Absolutamente nenhum! A plataforma foi pensada especificamente para corretores e imobiliárias. Todos os templates já vêm prontos, validados e otimizados para conversão. Você só precisa preencher os dados do imóvel, subir as fotos e colocar seu WhatsApp.'
    },
    {
      q: 'Como os leads chegam até mim?',
      a: 'Os leads chegam diretamente no seu WhatsApp através do botão inteligente (com mensagem personalizada indicando o imóvel de interesse) e também ficam salvos em tempo real no seu Painel de Leads com nome, telefone, e-mail e respostas de qualificação, podendo ser exportados para Excel ou enviados via Webhook para seu CRM.'
    },
    {
      q: 'Posso usar no celular?',
      a: 'Sim! Toda a plataforma é 100% responsiva. Você pode criar e gerenciar suas páginas e formulários pelo computador ou pelo celular, inclusive enviando fotos direto da galeria do seu smartphone.'
    },
    {
      q: 'Existe limite de páginas, formulários ou leads?',
      a: 'Não! Tanto no plano mensal quanto no plano anual você pode criar páginas e formulários ilimitados e receber leads ilimitados.'
    },
    {
      q: 'Como funciona a garantia de 7 dias?',
      a: 'O seu risco é zero! Se após assinar você achar que a ferramenta não supriu suas expectativas por qualquer motivo, basta solicitar o reembolso dentro de 7 dias e 100% do valor pago será devolvido imediatamente.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner de Oferta Especial */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 shadow-inner">
        <Flame size={15} className="text-amber-300 animate-pulse" />
        <span>OFERTA DE LANÇAMENTO: Combo Completo <b>LeadForm + PageLead</b> por apenas R$ 5,58/mês no plano anual!</span>
        <button
          onClick={() => scrollToSection('planos')}
          className="underline hover:text-blue-100 ml-1 font-black cursor-pointer"
        >
          Aproveitar Agora &rarr;
        </button>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight">LeadForm</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  + PageLead
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-semibold">COMBO IMOBILIÁRIO DEFINITIVO</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
            <button onClick={() => scrollToSection('combo')} className="hover:text-white transition-colors cursor-pointer">
              O Combo 2 em 1
            </button>
            <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-white transition-colors cursor-pointer">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection('como-funciona')} className="hover:text-white transition-colors cursor-pointer">
              Como Funciona
            </button>
            <button onClick={() => scrollToSection('planos')} className="hover:text-white transition-colors cursor-pointer">
              Planos & Preços
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors cursor-pointer">
              Dúvidas
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 sm:px-4 py-2 transition-colors"
            >
              Entrar
            </Link>
            <button
              onClick={() => scrollToSection('planos')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Começar Agora <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} className="text-amber-400" /> Duas Ferramentas Essenciais em Uma Única Assinatura
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Crie Landing Pages de Imóveis e Formulários Inteligentes em <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Minutos</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            A solução completa para corretores e imobiliárias que querem captar clientes qualificados: landing pages exclusivas para seus imóveis com o <b>PageLead</b> e formulários passo a passo com o <b>LeadForm</b>. Tudo conectado direto ao seu WhatsApp comercial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => scrollToSection('planos')}
              className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-2xl shadow-blue-600/40 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Garantir Meu Acesso (Apenas R$ 5,58/mês) <ArrowRight size={18} />
            </button>
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-base transition-all cursor-pointer"
            >
              Ver Como Funciona na Prática
            </button>
          </div>

          {/* Social Proof / Micro Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-medium border-t border-slate-800/80 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" /> Páginas e Formulários Ilimitados
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" /> Botão de WhatsApp Inteligente
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" /> Envio de Fotos Direto do Celular
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" /> 7 Dias de Garantia Incondicional
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase / Demonstração Visual */}
      <section id="combo" className="py-16 md:py-24 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">O Combo Completo 2 em 1</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Veja na Prática o que Você Vai Entregar</h2>
            <p className="text-slate-400 text-base">
              Alterne entre as abas abaixo para ver como suas páginas e seus formulários serão exibidos para seus clientes.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center justify-center">
            <div className="p-1.5 bg-slate-950 border border-slate-800 rounded-2xl inline-flex gap-2">
              <button
                onClick={() => setPreviewTab('pagelead')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                  previewTab === 'pagelead'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 size={16} /> 1. PageLead: Landing Pages de Imóveis
              </button>
              <button
                onClick={() => setPreviewTab('leadform')}
                className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 ${
                  previewTab === 'leadform'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={16} /> 2. LeadForm: Formulários Multi-Etapas
              </button>
            </div>
          </div>

          {/* TAB 1: PAGELEAD SHOWCASE */}
          {previewTab === 'pagelead' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Template 1: Alto Padrão */}
                <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col group hover:border-amber-500/50 transition-all">
                  <div className="aspect-[16/10] relative overflow-hidden bg-zinc-900">
                    <img
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop"
                      alt="Alto Padrão"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg">
                      Template Alto Padrão
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-amber-300 font-black text-xs px-3 py-1 rounded-xl">
                      R$ 4.850.000
                    </span>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-black text-lg text-white">Mansão Suspensa com Vista Panorâmica</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        Design escuro e sofisticado com detalhes em dourado. Ideal para coberturas, condomínios fechados e propriedades exclusivas.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>4 Suítes • 380m² • 4 Vagas</span>
                      <span className="text-amber-400">Ver Demonstração &rarr;</span>
                    </div>
                  </div>
                </div>

                {/* Template 2: Lançamento */}
                <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col group hover:border-blue-500/50 transition-all">
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop"
                      alt="Lançamento"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg">
                      Template Lançamento na Planta
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-blue-300 font-black text-xs px-3 py-1 rounded-xl">
                      A partir de R$ 590.000
                    </span>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-black text-lg text-white">Horizon Residence & Rooftop</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        Visual moderno de alta conversão. Foco em condições de entrada, tabela especial, plantas inteligentes e captação rápida de investidores.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>2 e 3 Dorms • Lazer Club</span>
                      <span className="text-blue-400">Ver Demonstração &rarr;</span>
                    </div>
                  </div>
                </div>

                {/* Template 3: Imóvel Pronto */}
                <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col group hover:border-emerald-500/50 transition-all">
                  <div className="aspect-[16/10] relative overflow-hidden bg-zinc-900">
                    <img
                      src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop"
                      alt="Imóvel Pronto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg">
                      Template Imóvel Pronto
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-emerald-300 font-black text-xs px-3 py-1 rounded-xl">
                      R$ 1.290.000
                    </span>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-black text-lg text-white">Casa Contemporânea em Condomínio</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        Design limpo e direto ao ponto. Galeria de ambientes completa, tour virtual em vídeo e botão para agendamento presencial de visitas.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>Pronta para Morar • Aceita FGTS</span>
                      <span className="text-emerald-400">Ver Demonstração &rarr;</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Upload Direto sem Hospedagem Externa</h4>
                    <p className="text-xs text-slate-400">Agora você pode subir fotos direto do seu celular ou computador sem complicações.</p>
                  </div>
                </div>
                <button
                  onClick={() => scrollToSection('planos')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Quero Criar Minhas Páginas
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LEADFORM SHOWCASE */}
          {previewTab === 'leadform' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 p-8 md:p-12 rounded-[36px] border border-slate-800">
                <div className="lg:col-span-5 space-y-5">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase">
                    Formulários Multi-Etapas Inteligentes
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Por que o LeadForm Converte até 4x Mais que Formulários Comuns?
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Formulários tradicionais assustam o visitante com 10 campos de uma vez. O <b>LeadForm</b> guia o cliente com perguntas interativas e prazerosas (estilo Typeform), captando o lead antes mesmo dele cansar de preencher.
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span><b>Qualificação Automática:</b> Saiba a renda, urgência e bairro de interesse</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span><b>Foco no WhatsApp:</b> Validação e clique direto para falar com você</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span><b>Vincule com suas Páginas:</b> Integre o formulário dentro de qualquer PageLead com 1 clique</span>
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
                  {/* Mockup de Formulário */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-slate-400 ml-2">leadform.pro/f/encontre-seu-imovel</span>
                    </div>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      Etapa 2 de 4
                    </span>
                  </div>

                  <div className="space-y-4 py-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Perfil do Comprador</p>
                    <h4 className="text-xl sm:text-2xl font-black text-white">
                      Qual faixa de investimento você planeja para o seu novo imóvel?
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-4 rounded-2xl border border-slate-700 bg-slate-950/80 hover:border-blue-500 hover:bg-blue-600/10 cursor-pointer transition-all flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-200">Até R$ 350.000</span>
                        <span className="text-xs font-mono text-slate-500 group-hover:text-blue-400">A</span>
                      </div>
                      <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-600/20 cursor-pointer transition-all flex items-center justify-between shadow-lg shadow-blue-600/20">
                        <span className="text-sm font-black text-white">R$ 350 mil a R$ 800 mil</span>
                        <Check size={18} className="text-blue-400" />
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-700 bg-slate-950/80 hover:border-blue-500 hover:bg-blue-600/10 cursor-pointer transition-all flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-200">R$ 800 mil a R$ 1,5 Milhão</span>
                        <span className="text-xs font-mono text-slate-500 group-hover:text-blue-400">C</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-700 bg-slate-950/80 hover:border-blue-500 hover:bg-blue-600/10 cursor-pointer transition-all flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-200">Acima de R$ 1,5 Milhão</span>
                        <span className="text-xs font-mono text-slate-500 group-hover:text-blue-400">D</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-400">Pressione <b>Enter ↵</b> para avançar</span>
                      <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1">
                        Avançar <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Funcionalidades & Benefícios */}
      <section id="funcionalidades" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Recursos Profissionais</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Tudo o que Você Precisa para Captar Mais e Vender Mais
            </h2>
            <p className="text-slate-400 text-base">
              Ferramentas de alto nível que antes só estavam ao alcance de imobiliárias gigantes com equipes caras de tecnologia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Templates Imobiliários Prontos</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Modelos exclusivos desenhados especificamente para imóveis de luxo, lançamentos na planta e imóveis prontos. Basta preencher as informações.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Botão WhatsApp Inteligente</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                O visitante clica e já cai no seu WhatsApp com a mensagem automática pré-preenchida contendo o nome e o código do imóvel.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">100% Mobile First & Ultra Rápido</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Mais de 90% dos seus clientes virão de anúncios no Instagram e WhatsApp pelo celular. Nossas páginas carregam em menos de 1 segundo.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black">
                <ImageIcon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Envio de Fotos Direto do Aparelho</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Selecione as fotos da galeria do seu celular ou do computador. O sistema comprime e otimiza tudo na hora para máxima velocidade.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Painel Central de Gestão de Leads</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Veja todos os contatos capturados, status de atendimento, data, origem da campanha e exporte tudo para planilha Excel ou CSV.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 space-y-4 hover:border-rose-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center font-black">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Pixel do Meta, GTM e Webhooks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rastreie conversões de anúncios no Instagram e Facebook com seu Meta Pixel e envie leads automaticamente para qualquer CRM via Webhook.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona (Passo a Passo) */}
      <section id="como-funciona" className="py-20 md:py-28 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Passo a Passo Simples</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Sua Página no Ar em Menos de 5 Minutos
            </h2>
            <p className="text-slate-400 text-base">
              Sem dor de cabeça com tecnologia ou configurações demoradas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                01
              </div>
              <h3 className="text-xl font-bold text-white">Escolha o Objetivo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Decida se vai criar uma landing page para um imóvel específico (PageLead) ou um formulário para qualificar compradores e captar proprietários (LeadForm).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">
                02
              </div>
              <h3 className="text-xl font-bold text-white">Selecione o Template</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Escolha entre os modelos prontos: Alto Padrão, Lançamento na Planta, Imóvel Pronto ou Perfil de Comprador.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-lg flex items-center justify-center">
                03
              </div>
              <h3 className="text-xl font-bold text-white">Insira Suas Fotos e Info</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suba as fotos direto do seu celular ou PC, coloque o valor, endereço, descrição e o seu número de WhatsApp.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center">
                04
              </div>
              <h3 className="text-xl font-bold text-white">Publique e Receba Leads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Copie o link pronto para a bio do Instagram, anúncios patrocinados ou WhatsApp e receba os contatos qualificados na mesma hora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativo de Mercado */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Economia Inteligente</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Por que Pagar Mais por Ferramentas Complicadas?
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Compare e veja como o combo LeadForm + PageLead é a melhor escolha em custo-benefício para corretores.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3 p-5 sm:p-6 bg-slate-950 border-b border-slate-800 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-400">
              <div>Critério</div>
              <div className="text-slate-500">Outras Ferramentas</div>
              <div className="text-blue-400">LeadForm + PageLead</div>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-5 sm:p-6 items-center">
                <div className="font-bold text-white">Preço Médio</div>
                <div className="text-slate-400">R$ 150 a R$ 400/mês</div>
                <div className="font-black text-emerald-400">A partir de R$ 5,58/mês</div>
              </div>

              <div className="grid grid-cols-3 p-5 sm:p-6 items-center bg-slate-900/40">
                <div className="font-bold text-white">Foco no Mercado Imobiliário</div>
                <div className="text-slate-400">Genéricas e sem foco</div>
                <div className="font-black text-emerald-400">100% Feito para Corretores</div>
              </div>

              <div className="grid grid-cols-3 p-5 sm:p-6 items-center">
                <div className="font-bold text-white">Facilidade de Uso</div>
                <div className="text-slate-400">Exige plugins e código</div>
                <div className="font-black text-emerald-400">Pronto em 5 minutos</div>
              </div>

              <div className="grid grid-cols-3 p-5 sm:p-6 items-center bg-slate-900/40">
                <div className="font-bold text-white">WhatsApp Integrado</div>
                <div className="text-slate-400">Configuração manual complexa</div>
                <div className="font-black text-emerald-400">Nativo com 1 clique</div>
              </div>

              <div className="grid grid-cols-3 p-5 sm:p-6 items-center">
                <div className="font-bold text-white">Duas Ferramentas em Uma</div>
                <div className="text-slate-400">Pague páginas e forms separados</div>
                <div className="font-black text-emerald-400">Combo 2 em 1 Incluso</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS E PREÇOS */}
      <section id="planos" className="py-20 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Planos Acessíveis</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Escolha o Plano Ideal para Alavancar Suas Vendas
            </h2>
            <p className="text-slate-400 text-base">
              Menos que o valor de um cafezinho por mês para ter landing pages e formulários de alto nível.
            </p>

            {/* Toggle Anual / Mensal */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                Mensal
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
                className="w-14 h-8 rounded-full bg-slate-800 p-1 border border-slate-700 transition-colors cursor-pointer relative"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-blue-500 transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6 bg-emerald-500' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
                  Anual
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Economize 44%
                </span>
              </div>
            </div>
          </div>

          {/* Cards de Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* PLANO MENSAL */}
            <div className={`bg-slate-950 p-8 sm:p-10 rounded-[36px] border flex flex-col justify-between transition-all ${
              billingCycle === 'monthly' ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-2xl' : 'border-slate-800 opacity-90'
            }`}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">Plano Mensal</h3>
                    <p className="text-xs text-slate-400 mt-1">Flexibilidade total, cancele quando quiser</p>
                  </div>
                </div>

                <div className="py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white">R$ 10,00</span>
                    <span className="text-slate-400 font-bold text-sm">/mês</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Cobrança mensal recorrente sem fidelidade</p>
                </div>

                <div className="border-t border-slate-800 pt-6 space-y-3.5 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><b>LeadForm:</b> Formulários multi-etapas ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><b>PageLead:</b> Landing pages de imóveis ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Leads e visitas 100% ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Todos os templates imobiliários</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Botão de WhatsApp Inteligente</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Envio de fotos direto do celular/PC</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Meta Pixel + Google Tag Manager + Webhooks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Suporte via e-mail e WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href={checkoutMonthlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleCheckoutClick('Plano Mensal LeadForm + PageLead', 10.0)}
                  className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:border-blue-500"
                >
                  Assinar Mensal por R$ 10,00 <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* PLANO ANUAL (DESTAQUE) */}
            <div className={`bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-10 rounded-[36px] border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/10 flex flex-col justify-between relative transition-all ${
              billingCycle === 'annual' ? 'scale-[1.03] ring-4 ring-emerald-500/20' : ''
            }`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
                <Star size={13} fill="currentColor" /> MAIS POPULAR • ECONOMIA DE 44%
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Plano Anual</h3>
                  <p className="text-xs text-emerald-300 font-bold mt-1">Acesso garantido pelo ano todo com desconto máximo</p>
                </div>

                <div className="py-2 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-emerald-400">R$ 67,00</span>
                    <span className="text-slate-400 font-bold text-sm">/ano</span>
                  </div>
                  <p className="text-xs text-emerald-300 font-bold">
                    Equivalente a apenas <b>R$ 5,58 por mês</b>!
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-6 space-y-3.5 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><b>Tudo do plano mensal incluso</b></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><b>LeadForm + PageLead</b> ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Leads e contatos ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Todos os templates de alta conversão</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Botão de WhatsApp Inteligente</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Envio de fotos direto do celular/PC</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Meta Pixel + Google Tag Manager + Webhooks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span><b>Suporte Prioritário por WhatsApp</b></span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <a
                  href={checkoutAnnualUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleCheckoutClick('Plano Anual LeadForm + PageLead', 67.0)}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02]"
                >
                  Garantir Oferta Anual por R$ 67 <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Garantia de 7 Dias */}
          <div className="max-w-2xl mx-auto p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Garantia Incondicional de 7 Dias</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Você pode testar a ferramenta com tranquilidade. Se por qualquer motivo não gostar, solicite o reembolso com 1 clique dentro do prazo e devolveremos 100% do seu dinheiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (Perguntas Frequentes) */}
      <section id="faq" className="py-20 md:py-28 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Dúvidas Comuns</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Perguntas Frequentes
            </h2>
            <p className="text-slate-400 text-base">
              Ainda tem dúvidas? Veja as respostas para as perguntas mais comuns.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900"
                >
                  <span className="font-bold text-base text-white">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={20} className="text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-8 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-3xl text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Precisa de ajuda ou quer tirar uma dúvida específica?</h3>
            <p className="text-sm text-slate-300">Nossa equipe de suporte está disponível para te atender diretamente no WhatsApp.</p>
            <a
              href="https://wa.me/5554996895454?text=Ol%C3%A1!%20Tenho%20d%C3%BAvidas%20sobre%20o%20combo%20LeadForm%20%2B%20PageLead"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              <MessageCircle size={16} /> Falar com o Suporte no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                <Building2 size={18} />
              </div>
              <span className="text-base font-black text-white">LeadForm + PageLead</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-bold text-slate-400">
              <button onClick={() => scrollToSection('combo')} className="hover:text-white cursor-pointer">O Combo</button>
              <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-white cursor-pointer">Funcionalidades</button>
              <button onClick={() => scrollToSection('planos')} className="hover:text-white cursor-pointer">Planos</button>
              <Link to="/login" className="hover:text-white">Acessar Conta</Link>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 LeadForm + PageLead. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1.5">
              <Lock size={12} /> Pagamentos 100% seguros com criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
