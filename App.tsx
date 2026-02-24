
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2, ShieldCheck, Webhook, Smartphone, MousePointer2, Settings2,
  Code, Share2, Layers, Palette, Save, Trash2, UserPlus, Info, Plus,
  ChevronRight, ChevronLeft, LayoutDashboard, FileText, Users, Settings,
  BarChart3, LogOut, ExternalLink, Edit, Eye, Filter, Download, X,
  Type, Image as ImageIcon, Video, Square, GripVertical, Copy, ArrowUp, ArrowDown,
  Columns, Columns2, Columns3, MoreVertical, Hash, Calendar, HelpCircle,
  Search, AlertCircle, Send
} from 'lucide-react';
import { User, Role, Form, FormStatus, FormStep, FormBlock, BlockType, Column, StepLayout, Lead, Integration } from './types';
import { db } from './store';
import { ICONS } from './constants';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lp_session');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string) => {
    const users = await db.getUsers();
    const found = users.find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('lp_session', JSON.stringify(found));
    } else {
      alert('E-mail não encontrado. Use: contato@leadsign.com.br');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lp_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Layout & Sidebar ---

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: ICONS.Dashboard, path: '/dashboard' },
    { label: 'Formulários', icon: ICONS.Forms, path: '/dashboard/forms' },
    { label: 'Leads', icon: ICONS.Leads, path: '/dashboard/leads' },
    { label: 'Integrações', icon: ICONS.Integrations, path: '/dashboard/integrations' },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">L</div>
          LeadForm Pro
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium ${location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
          {ICONS.Logout}
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <main className="flex-1 ml-64 p-8 overflow-x-hidden">{children}</main>
  </div>
);

// --- Dashboard View ---

const DashboardView = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [integrationsCount, setIntegrationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [l, f, i] = await Promise.all([
          db.getLeads(),
          db.getForms(),
          db.getIntegrations()
        ]);
        setLeads(l);
        setForms(f);
        setIntegrationsCount(i.length);
      } catch (error) {
        console.error('Erro ao buscar dados do Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Dashboard...</div>;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h2>
        <p className="text-gray-500 font-medium">Visão geral da sua operação de leads.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Leads</p>
          <h4 className="text-4xl font-black text-gray-900">{leads.length}</h4>
          <p className="text-xs text-green-600 font-bold mt-2">Novos leads hoje</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Formulários Ativos</p>
          <h4 className="text-4xl font-black text-gray-900">{forms.filter(f => f.status === FormStatus.ACTIVE).length}</h4>
          <p className="text-xs text-blue-600 font-bold mt-2">Aguardando conversão</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Integrações</p>
          <h4 className="text-4xl font-black text-gray-900">{integrationsCount}</h4>
          <p className="text-xs text-gray-400 font-bold mt-2">Webhooks configurados</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">Leads Recentes</h3>
          <Link to="/dashboard/leads" className="text-blue-600 font-bold text-sm hover:underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Nome / E-mail</th>
                <th className="px-8 py-4">Formulário</th>
                <th className="px-8 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.slice(0, 5).map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50/50">
                  <td className="px-8 py-6">
                    <span className="font-bold text-gray-900">{lead.data.name || lead.data.full_name || 'Anônimo'}</span>
                    <p className="text-xs text-gray-400">{lead.data.email}</p>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-500">
                    {forms.find(f => f.id === lead.formId)?.name || 'Removido'}
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Leads View ---

const LeadListView = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [l, f] = await Promise.all([
          db.getLeads(),
          db.getForms()
        ]);
        setLeads(l);
        setForms(f);
      } catch (error) {
        console.error('Erro ao buscar leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Leads...</div>;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Leads</h2>
          <p className="text-gray-500 font-medium">Gerencie sua base de contatos capturados.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-100 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all">
          <Download size={18} /> Exportar CSV
        </button>
      </header>

      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Lead</th>
              <th className="px-8 py-4">Dados Extras</th>
              <th className="px-8 py-4">Formulário</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50/50">
                <td className="px-8 py-6">
                  <span className="font-bold text-gray-900">{lead.data.name || lead.data.full_name || 'Desconhecido'}</span>
                  <p className="text-xs text-gray-400">{lead.data.email || lead.data.phone}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(lead.data).map(([k, v]) => !['name', 'email', 'phone', 'full_name'].includes(k) && (
                      <span key={k} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-500 uppercase">{k}: {v as string}</span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-gray-500">
                  {forms.find(f => f.id === lead.formId)?.name}
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Novo</span>
                </td>
                <td className="px-8 py-6 text-sm text-gray-400">{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Integrations View ---

const IntegrationListView = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const ints = await db.getIntegrations();
        setIntegrations(ints);
      } catch (error) {
        console.error('Erro ao buscar integrações:', error);
      }
    };
    fetchIntegrations();
  }, []);

  const handleAdd = async () => {
    if (!newUrl || !newName) return;
    const integration: Integration = {
      id: `int-${Date.now()}`,
      orgId: 'org-1',
      name: newName,
      type: 'WEBHOOK',
      url: newUrl,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    await db.saveIntegration(integration);
    const updated = await db.getIntegrations();
    setIntegrations(updated);
    setIsAdding(false);
    setNewUrl('');
    setNewName('');
  };

  const handleDelete = async (id: string) => {
    await db.deleteIntegration(id);
    const updated = await db.getIntegrations();
    setIntegrations(updated);
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Integrações</h2>
          <p className="text-gray-500 font-medium">Envie seus leads para CRMs externos.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
          <Plus size={20} /> Nova Integração
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold">Adicionar Webhook</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nome Amigável</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Kommo CRM" className="w-full px-4 py-3 border rounded-xl outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL do Webhook (POST)</label>
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://hook.us1.make.com/..." className="w-full px-4 py-3 border rounded-xl outline-none" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-400 font-bold">Cancelar</button>
            <button onClick={handleAdd} className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold">Salvar Integração</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(int => (
          <div key={int.id} className="bg-white p-8 rounded-[40px] border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Webhook size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{int.name}</h4>
                <p className="text-xs text-gray-400 font-mono truncate w-48">{int.url}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(int.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Public Form View ---

const PublicFormView = () => {
  const { orgSlug, formSlug } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const found = await db.getFormBySlug(orgSlug || '', formSlug || '');
        if (found) setForm(found);
      } catch (error) {
        console.error('Erro ao buscar formulário público:', error);
      }
    };
    fetchForm();
  }, [orgSlug, formSlug]);

  if (!form) return <div className="min-h-screen flex items-center justify-center font-bold">404 - Formulário não encontrado</div>;

  const steps = form.steps;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsLoading(true);

    const lead: Lead = {
      id: `lead-${Date.now()}`,
      orgId: form.orgId,
      formId: form.id,
      data: formData,
      utm: {}, // Aqui capturaríamos via search params
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    await db.saveLead(lead);

    // Real Webhook Dispatch
    const currentIntegrations = await db.getIntegrations();
    if (form.settings.webhookIds && form.settings.webhookIds.length > 0) {
      const integrations = currentIntegrations.filter(i => form.settings.webhookIds.includes(i.id));
      integrations.forEach(integration => {
        if (integration.url) {
          console.log(`Disparando webhook: ${integration.name} -> ${integration.url}`);
          fetch(integration.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
          }).catch(err => console.error('Erro no webhook:', err));
        }
      });
    } else {
      // Fallback: Dispatch to all active webhooks if none selected (simplification for prototype)
      const allIntegrations = currentIntegrations.filter(i => i.isActive);
      allIntegrations.forEach(integration => {
        console.log(`Disparando webhook (global): ${integration.name} -> ${integration.url}`);
        fetch(integration.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        }).catch(err => console.error('Erro no webhook:', err));
      });
    }

    setIsLoading(false);

    if (form.settings.redirectUrl) {
      window.location.href = form.settings.redirectUrl;
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Obrigado!</h1>
        <p className="text-gray-500 max-w-sm">Seus dados foram enviados com sucesso. Em breve entraremos em contato.</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 font-bold">Voltar ao início</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative shadow-2xl">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} />
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{currentStep.title}</h1>
          </div>

          <div className={`grid gap-4 ${currentStep.layout === '1-column' ? 'grid-cols-1' : currentStep.layout === '2-columns' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {currentStep.columns.map(col => (
              <div key={col.id} className="space-y-6">
                {col.blocks.map(block => (
                  <div key={block.id} className="space-y-2">
                    {block.type === 'heading' && <h2 className={`font-bold text-gray-800 ${block.settings.level === 'h1' ? 'text-xl' : 'text-lg'}`}>{block.settings.label}</h2>}
                    {block.type === 'text' && <p className="text-sm text-gray-500 leading-relaxed">{block.settings.label}</p>}
                    {block.type === 'image' && <img src={block.settings.src} className="w-full rounded-2xl shadow-sm" />}

                    {block.type === 'short_text' || block.type === 'email' || block.type === 'standard_contact' ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.settings.label}</label>
                        <input
                          type={block.type === 'email' ? 'email' : 'text'}
                          placeholder={block.settings.placeholder}
                          value={formData[block.settings.mappingKey || block.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [block.settings.mappingKey || block.id]: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    ) : null}

                    {block.type === 'single_choice' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.settings.label}</label>
                        <div className="space-y-2">
                          {block.settings.options?.map(opt => (
                            <button
                              key={opt}
                              onClick={() => {
                                setFormData({ ...formData, [block.settings.mappingKey || block.id]: opt });
                                if (block.settings.autoAdvance) handleNext();
                              }}
                              className={`w-full p-4 border rounded-2xl text-left font-medium transition-all ${formData[block.settings.mappingKey || block.id] === opt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 hover:border-gray-300'
                                }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 border-t bg-white">
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Enviando...' : currentStepIndex === steps.length - 1 ? 'Enviar Agora' : 'Próximo Passo'}
          {!isLoading && <ChevronRight size={20} />}
        </button>
        <p className="text-center text-[8px] font-bold text-gray-300 uppercase tracking-[4px] mt-6">LeadForm Pro Protection</p>
      </div>
    </div>
  );
};

// --- Form Detail Tabs (Builder, Leads, Settings) ---

const FormBuilderTab = ({ form, setForm }: { form: Form, setForm: (f: Form) => void }) => {
  const [activeStepId, setActiveStepId] = useState(form.steps[0]?.id || '');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState<{ stepId: string, colId: string } | null>(null);

  const activeStep = form.steps.find(s => s.id === activeStepId) || form.steps[0];

  const addStep = () => {
    const newStep: FormStep = {
      id: `step-${Date.now()}`,
      title: `Etapa ${form.steps.length + 1}`,
      layout: '1-column',
      columns: [{ id: `col-${Date.now()}`, blocks: [] }]
    };
    setForm({ ...form, steps: [...form.steps, newStep] });
    setActiveStepId(newStep.id);
  };

  const updateBlockSettings = (blockId: string, settings: any) => {
    const newSteps = form.steps.map(step => ({
      ...step,
      columns: step.columns.map(col => ({
        ...col,
        blocks: col.blocks.map(b => b.id === blockId ? { ...b, settings: { ...b.settings, ...settings } } : b)
      }))
    }));
    setForm({ ...form, steps: newSteps });
  };

  const addBlock = (type: BlockType, stepId: string, colId: string) => {
    const newBlock: FormBlock = {
      id: `block-${Date.now()}`,
      type,
      settings: {
        label: type.includes('choice') || type.includes('text') ? 'Pergunta sem título' : 'Novo Bloco',
        required: true,
        options: type.includes('choice') ? ['Opção 1', 'Opção 2'] : undefined,
      }
    };
    setForm({
      ...form,
      steps: form.steps.map(s => s.id === stepId ? { ...s, columns: s.columns.map(c => c.id === colId ? { ...c, blocks: [...c.blocks, newBlock] } : c) } : s)
    });
    setSelectedBlockId(newBlock.id);
    setIsAddingBlock(null);
  };

  const selectedBlock = form.steps.flatMap(s => s.columns.flatMap(c => c.blocks)).find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-[calc(100vh-320px)] border rounded-[32px] overflow-hidden bg-white shadow-sm">
      <div className="w-64 border-r flex flex-col bg-gray-50/50">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fluxo</span>
          <button onClick={addStep} className="p-1 hover:bg-blue-50 text-blue-600 rounded-lg"><Plus size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {form.steps.map((s, i) => (
            <div key={s.id} onClick={() => setActiveStepId(s.id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${activeStepId === s.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white text-gray-600'}`}>
              <span className="text-xs font-bold truncate block">{i + 1}. {s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="w-[300px] h-[540px] bg-white rounded-[40px] shadow-2xl border-[8px] border-gray-900 overflow-hidden flex flex-col scale-[0.9]">
          <div className="h-6 w-full bg-gray-900 flex items-center justify-center"><div className="w-12 h-1 bg-white/20 rounded-full"></div></div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            <h2 className="text-lg font-bold">{activeStep.title}</h2>
            {activeStep.columns.map(col => (
              <div key={col.id} className="space-y-3">
                {col.blocks.map(b => (
                  <div key={b.id} onClick={() => setSelectedBlockId(b.id)} className={`p-3 rounded-xl border-2 cursor-pointer ${selectedBlockId === b.id ? 'border-blue-500 bg-blue-50/50' : 'bg-white border-white shadow-sm'}`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{b.type}</p>
                    <p className="text-xs font-bold text-gray-800">{b.settings.label}</p>
                  </div>
                ))}
                <button onClick={() => setIsAddingBlock({ stepId: activeStepId, colId: col.id })} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all">+ Adicionar Bloco</button>
              </div>
            ))}
          </div>
        </div>

        {isAddingBlock && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xs space-y-4">
              <h4 className="font-bold border-b pb-2">Novo Bloco</h4>
              <div className="grid grid-cols-2 gap-2">
                {['heading', 'text', 'image', 'short_text', 'single_choice', 'button'].map(type => (
                  <button key={type} onClick={() => addBlock(type as BlockType, isAddingBlock.stepId, isAddingBlock.colId)} className="p-3 bg-gray-50 rounded-xl text-[10px] font-bold uppercase hover:bg-blue-50 transition-all">{type.replace('_', ' ')}</button>
                ))}
              </div>
              <button onClick={() => setIsAddingBlock(null)} className="w-full py-2 text-xs text-gray-400">Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div className="w-80 border-l p-6 bg-white overflow-y-auto">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Propriedades</h3>
        {selectedBlock ? (
          <div className="space-y-6">
            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Título / Pergunta</label><input value={selectedBlock.settings.label} onChange={e => updateBlockSettings(selectedBlock.id, { label: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none" /></div>

            {selectedBlock.type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL da Imagem</label>
                  <input
                    value={selectedBlock.settings.src || ''}
                    onChange={e => updateBlockSettings(selectedBlock.id, { src: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border rounded-xl outline-none text-xs font-mono"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Dica do Canva</p>
                  <p className="text-[11px] text-blue-700 leading-tight mb-3">Crie seu design no Canva, clique em "Compartilhar", selecione "Mais" e escolha "Incorporar" para pegar o link da imagem.</p>
                  <a
                    href="https://www.canva.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-white text-blue-600 rounded-lg text-[10px] font-bold uppercase shadow-sm hover:shadow-md transition-all"
                  >
                    <ImageIcon size={14} /> Abrir Canva
                  </a>
                </div>
              </div>
            )}

            {['short_text', 'email', 'standard_contact'].includes(selectedBlock.type) && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Chave de Mapeamento (JSON Key)</label>
                <input
                  value={selectedBlock.settings.mappingKey || ''}
                  onChange={e => updateBlockSettings(selectedBlock.id, { mappingKey: e.target.value })}
                  placeholder="Ex: nome, email, telefone"
                  className="w-full px-4 py-2 border rounded-xl outline-none font-mono text-xs"
                />
                <p className="text-[9px] text-gray-400 mt-1">Use "name", "email" ou "phone" para identificação automática.</p>
              </div>
            )}
            {selectedBlock.settings.options && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">Opções</label>
                {selectedBlock.settings.options.map((opt, i) => (
                  <input key={i} value={opt} onChange={e => {
                    const n = [...selectedBlock.settings.options!];
                    n[i] = e.target.value;
                    updateBlockSettings(selectedBlock.id, { options: n });
                  }} className="w-full px-3 py-1.5 border rounded-lg text-xs" />
                ))}
                <button onClick={() => updateBlockSettings(selectedBlock.id, { options: [...selectedBlock.settings.options!, 'Nova Opção'] })} className="w-full py-2 border border-dashed border-blue-200 rounded-lg text-[10px] text-blue-600 font-bold">+ Opção</button>
              </div>
            )}
            <button onClick={() => setForm({ ...form, steps: form.steps.map(s => ({ ...s, columns: s.columns.map(c => ({ ...c, blocks: c.blocks.filter(b => b.id !== selectedBlock.id) })) })) })} className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase">Remover Bloco</button>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-300 font-bold italic">Selecione um bloco para editar</div>
        )}
      </div>
    </div>
  );
};

// --- App Root and Routes ---

const LoginView = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('contato@leadsign.com.br');
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-[50px] shadow-2xl p-12 border border-gray-100">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center text-white text-4xl font-black mx-auto mb-8 shadow-2xl shadow-blue-200">L</div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">LeadForm Pro</h1>
          <p className="text-gray-400 font-medium mt-3">SaaS para Imobiliárias</p>
        </div>
        <div className="space-y-8">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">E-mail Corporativo</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-[24px] outline-none transition-all font-bold" /></div>
          <button onClick={() => login(email)} className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all">Entrar no Painel</button>
        </div>
      </div>
    </div>
  );
};

const FormDetailView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [activeTab, setActiveTab] = useState('builder');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        if (formId === 'new') {
          const newForm: Form = {
            id: `form-${Date.now()}`,
            orgId: 'org-1', // Mock org
            name: 'Novo Formulário',
            slug: `novo-fluxo-${Date.now()}`,
            status: FormStatus.DRAFT,
            theme: { primaryColor: '#2563eb' },
            steps: [
              {
                id: `step-${Date.now()}`,
                title: 'Início',
                layout: '1-column',
                columns: [{ id: `col-${Date.now()}`, blocks: [] }]
              }
            ],
            settings: { webhookIds: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await db.saveForm(newForm);
          navigate(`/dashboard/forms/${newForm.id}`, { replace: true });
          return;
        }

        const forms = await db.getForms();
        const found = forms.find(f => f.id === formId);
        if (found) setForm(found);
      } catch (error) {
        console.error('Erro ao buscar detalhe do formulário:', error);
      }
    };
    fetchForm();
  }, [formId, navigate]);

  if (!form) return null;

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/forms')} className="p-2 border rounded-full hover:bg-white"><ChevronLeft size={20} /></button>
          <div><h2 className="text-3xl font-black">{form.name}</h2><p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Fluxo ID: {form.slug}</p></div>
        </div>
        <div className="flex gap-3">
          <Link to={`/f/leadsign/${form.slug}`} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-white border rounded-2xl font-bold hover:shadow-md transition-all"><ExternalLink size={18} /> Ver Página</Link>
          <button onClick={async () => { await db.saveForm(form); alert('Salvo!'); }} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100"><Save size={18} /> Salvar</button>
        </div>
      </header>
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {['builder', 'leads', 'settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>
            {tab === 'builder' ? 'Editor Visual' : tab === 'leads' ? 'Leads do Fluxo' : 'Integrações'}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'builder' && <FormBuilderTab form={form} setForm={setForm} />}
        {activeTab === 'leads' && (
          <LeadsByFormView formId={form.id} />
        )}
        {activeTab === 'settings' && (
          <div className="p-8 bg-white rounded-[32px] border shadow-sm space-y-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-xl border-b pb-4">Configurações do Fluxo</h3>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Nome do Formulário</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border rounded-xl outline-none active:border-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Slug (URL Amigável)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/f/leadsign/</span>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="flex-1 px-4 py-3 border rounded-xl outline-none font-bold text-blue-600" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Redirecionamento (Ao finalizar)</label>
              <input
                value={form.settings.redirectUrl || ''}
                onChange={e => setForm({ ...form, settings: { ...form.settings, redirectUrl: e.target.value } })}
                placeholder="https://sua-pagina-de-obrigado.com"
                className="w-full px-4 py-3 border rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pixel ID (Facebook)</label>
                <input
                  value={form.settings.pixelId || ''}
                  onChange={e => setForm({ ...form, settings: { ...form.settings, pixelId: e.target.value } })}
                  className="w-full px-4 py-3 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">GTM ID (Google)</label>
                <input
                  value={form.settings.gtmId || ''}
                  onChange={e => setForm({ ...form, settings: { ...form.settings, gtmId: e.target.value } })}
                  className="w-full px-4 py-3 border rounded-xl outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormListView = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const f = await db.getForms();
        setForms(f);
      } catch (error) {
        console.error('Erro ao buscar lista de formulários:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Formulários...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div><h2 className="text-4xl font-black text-gray-900 tracking-tight">Formulários</h2><p className="text-gray-500 font-medium">Capture leads com fluxos de alta conversão.</p></div>
        <button onClick={() => navigate('/dashboard/forms/new')} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[20px] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"><Plus size={20} /> Novo Fluxo</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map(form => (
          <div key={form.id} onClick={() => navigate(`/dashboard/forms/${form.id}`)} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500"><FileText size={32} /></div>
            <h3 className="text-2xl font-bold text-gray-900 truncate">{form.name}</h3>
            <div className="flex items-center justify-between border-t border-gray-50 pt-8 mt-8"><span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-4 py-1.5 rounded-full tracking-widest">{form.status}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Subview for Leads by Form ---
const LeadsByFormView = ({ formId }: { formId: string }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const l = await db.getLeadsByForm(formId);
        setLeads(l);
      } catch (error) {
        console.error('Erro ao buscar leads por formulário:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [formId]);

  if (loading) return <div className="p-10 text-center font-bold">Carregando leads...</div>;

  return (
    <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50"><tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"><th className="px-8 py-4">Lead</th><th className="px-8 py-4">Data</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map(l => (
            <tr key={l.id}><td className="px-8 py-4 font-bold">{l.data.email || 'Anônimo'}</td><td className="px-8 py-4 text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/forms" element={<ProtectedRoute><Layout><FormListView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/forms/:formId" element={<ProtectedRoute><Layout><FormDetailView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/leads" element={<ProtectedRoute><Layout><LeadListView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/integrations" element={<ProtectedRoute><Layout><IntegrationListView /></Layout></ProtectedRoute>} />
        <Route path="/f/:orgSlug/:formSlug" element={<PublicFormView />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  </AuthProvider>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default App;
