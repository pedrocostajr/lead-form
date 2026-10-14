
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2, ShieldCheck, Webhook, Smartphone, MousePointer2, Settings2,
  Code, Share2, Layers, Palette, Save, Trash2, UserPlus, Info, Plus,
  ChevronRight, ChevronLeft, LayoutDashboard, FileText, Users, Settings,
  BarChart3, LogOut, ExternalLink, Edit, Eye, Filter, Download, X,
  Type, Image as ImageIcon, Video, Square, GripVertical, Copy, ArrowUp, ArrowDown,
  Columns, Columns2, Columns3, MoreVertical, Hash, Calendar, HelpCircle,
  Search, AlertCircle, Send, Clock, EyeOff, Menu, CheckCircle, Slash, RefreshCw, Key, Mail,
  Building2, Sparkles
} from 'lucide-react';
import { User, Role, Form, FormStatus, FormStep, FormBlock, BlockType, Column, StepLayout, Lead, Integration, Organization, PageLead } from './types';
import { db } from './store';
import { ICONS } from './constants';
import { PageLeadListView, PageLeadDetailView, PublicPageLeadView } from './PageLead';
import { LandingPageView } from './LandingPage';

const cleanCanvaHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
};

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength <= 2) return phoneNumber;
  if (phoneNumberLength <= 6) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  }
  if (phoneNumberLength <= 10) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
  }
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  isGlobalView: boolean;
  setGlobalView: (value: boolean) => void;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lp_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [isGlobalView, setIsGlobalView] = useState(() => {
    return localStorage.getItem('lp_global_view') === 'true';
  });

  const setGlobalView = (value: boolean) => {
    setIsGlobalView(value);
    localStorage.setItem('lp_global_view', value.toString());
  };

  const refreshUser = async (): Promise<User | null> => {
    const saved = localStorage.getItem('lp_session');
    const currentUser = user || (saved ? JSON.parse(saved) : null);
    if (!currentUser) return null;
    try {
      let fresh: User | null = null;
      if (currentUser.id) {
        fresh = await db.getUserById(currentUser.id);
      }
      if (!fresh && currentUser.email) {
        fresh = await db.getUserByEmail(currentUser.email);
      }
      if (fresh) {
        setUser(fresh);
        localStorage.setItem('lp_session', JSON.stringify(fresh));
        return fresh;
      }
    } catch (e) {
      console.error("Erro ao sincronizar sessão do usuário:", e);
    }
    return null;
  };

  useEffect(() => {
    if (user?.id || user?.email) {
      refreshUser();
    }
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      let found = await db.getUserByEmail(email);

      // Bypass especial para o admin mestre com senha fixa
      if (!found && email === 'contato@leadsign.com.br') {
        const admin: User = {
          id: 'admin-1',
          orgId: 'org-admin',
          email: 'contato@leadsign.com.br',
          password: 'Home170861#',
          name: 'Super Admin',
          role: Role.SUPER_ADMIN,
          status: 'APPROVED',
          createdAt: new Date().toISOString()
        };
        found = admin;
      }

      if (found) {
        if (found.password && found.password !== password) {
          alert('Senha incorreta.');
          return;
        }

        setUser(found);
        localStorage.setItem('lp_session', JSON.stringify(found));
      } else {
        alert('Usuário não encontrado.');
      }
    } catch (e) {
      console.error("Login error:", e);
      alert("Erro ao conectar com o banco de dados.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lp_session');
  };

  return (
    <AuthContext.Provider value={{ user, isGlobalView, setGlobalView, login, logout, refreshUser }}>
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

const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
  const { logout, user, isGlobalView, setGlobalView } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: ICONS.Dashboard, path: '/dashboard' },
    { label: 'Formulários', icon: ICONS.Forms, path: '/dashboard/forms' },
    { label: 'Page Lead', icon: <Building2 size={20} />, path: '/dashboard/pages' },
    { label: 'Hospedar Fotos', icon: <ImageIcon size={20} />, path: '/dashboard/images-guide' },
    { label: 'Leads', icon: ICONS.Leads, path: '/dashboard/leads' },
    { label: 'Integrações', icon: ICONS.Integrations, path: '/dashboard/integrations' },
    { label: 'Configurações', icon: <Settings2 size={20} />, path: '/dashboard/settings' },
    { label: 'Página de Vendas', icon: <Sparkles size={20} />, path: '/planos' },
    { label: 'Ajuda', icon: <HelpCircle size={20} />, path: '/dashboard/help' },
  ];

  if (user?.role === Role.SUPER_ADMIN) {
    menuItems.push({ label: 'Usuários', icon: <Users size={20} />, path: '/dashboard/admin/users' });
  }

  const handleNav = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`w-64 bg-white border-r h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">L</div>
            Lead Form
          </h1>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium ${location.pathname.startsWith(item.path) ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        {user?.role === Role.SUPER_ADMIN && (
          <div className="p-4 border-t px-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modo Global</span>
              <button
                onClick={() => setGlobalView(!isGlobalView)}
                className={`w-10 h-5 rounded-full p-1 transition-colors ${isGlobalView ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isGlobalView ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-1">Ver dados de todas as orgs</p>
          </div>
        )}
        <div className="p-4 border-t">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            {ICONS.Logout}
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation (redundant but safe)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">L</div>
          <span>Lead Form</span>
        </h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-x-hidden w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

// --- Dashboard View ---

const DashboardView = () => {
  const { user, isGlobalView } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [pages, setPages] = useState<PageLead[]>([]);
  const [integrationsCount, setIntegrationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [l, f, i, p] = await Promise.all([
          db.getLeads(user?.orgId, user?.email, isGlobalView),
          db.getForms(user?.orgId, user?.email, isGlobalView),
          db.getIntegrations(user?.orgId, isGlobalView),
          db.getPages(user?.orgId, user?.email, isGlobalView)
        ]);
        setLeads(l || []);
        setForms(f || []);
        setIntegrationsCount((i || []).length);
        setPages(p || []);
      } catch (error) {
        console.error('Erro ao buscar dados do Dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isGlobalView]);

  const getSourceName = (lead: Lead) => {
    const form = forms.find(f => f.id === lead.formId);
    if (form) return form.name;
    const page = pages.find(p => p.id === lead.formId);
    if (page) return `[LP] ${page.name}`;
    if (lead.data.page_name) return `[LP] ${lead.data.page_name}`;
    if (lead.data.property_title) return `[LP] ${lead.data.property_title}`;
    return 'Removido';
  };

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Dashboard...</div>;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h2>
        <p className="text-gray-500 font-medium">Visão geral da sua operação de leads.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-7 rounded-[36px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Leads</p>
          <h4 className="text-3xl md:text-4xl font-black text-gray-900">{leads.length}</h4>
          <p className="text-xs text-green-600 font-bold mt-2">Contatos capturados</p>
        </div>
        <div className="bg-white p-7 rounded-[36px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Formulários</p>
          <h4 className="text-3xl md:text-4xl font-black text-gray-900">{forms.filter(f => f.status === FormStatus.ACTIVE).length}</h4>
          <p className="text-xs text-blue-600 font-bold mt-2">Fluxos ativos</p>
        </div>
        <div className="bg-white p-7 rounded-[36px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Page Lead (LPs)</p>
          <h4 className="text-3xl md:text-4xl font-black text-gray-900">{pages.length}</h4>
          <p className="text-xs text-purple-600 font-bold mt-2">Landing Pages de imóveis</p>
        </div>
        <div className="bg-white p-7 rounded-[36px] border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Integrações</p>
          <h4 className="text-3xl md:text-4xl font-black text-gray-900">{integrationsCount}</h4>
          <p className="text-xs text-gray-400 font-bold mt-2">Webhooks conectados</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold">Leads Recentes</h3>
          <Link to="/dashboard/leads" className="text-blue-600 font-bold text-sm hover:underline">Ver todos</Link>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {leads.slice(0, 5).map(lead => (
            <div key={lead.id} className="p-6 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-900">{lead.data.name || lead.data.full_name || 'Anônimo'}</span>
                <span className="text-[10px] text-gray-400 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-400">{lead.data.email}</p>
              <div className="pt-1">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {getSourceName(lead)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Nome / E-mail</th>
                <th className="px-8 py-4">Origem / Fluxo</th>
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
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {getSourceName(lead)}
                    </span>
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
  const { user, isGlobalView } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [pages, setPages] = useState<PageLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [l, f, p] = await Promise.all([
          db.getLeads(user?.orgId, user?.email, isGlobalView),
          db.getForms(user?.orgId, user?.email, isGlobalView),
          db.getPages(user?.orgId, user?.email, isGlobalView)
        ]);
        setLeads(l || []);
        setForms(f || []);
        setPages(p || []);
      } catch (error) {
        console.error('Erro ao buscar leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isGlobalView]);

  const getSourceName = (lead: Lead) => {
    const form = forms.find(f => f.id === lead.formId);
    if (form) return form.name;
    const page = pages.find(p => p.id === lead.formId);
    if (page) return `[LP] ${page.name}`;
    if (lead.data.page_name) return `[LP] ${lead.data.page_name}`;
    if (lead.data.property_title) return `[LP] ${lead.data.property_title}`;
    return 'Removido';
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;

    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Origem', 'Status', 'Data', 'Campos Adicionais'];
    const rows = leads.map(l => [
      l.id,
      l.data.name || l.data.full_name || '',
      l.data.email || '',
      l.data.phone || '',
      getSourceName(l),
      l.status,
      new Date(l.createdAt).toLocaleString(),
      JSON.stringify(Object.fromEntries(Object.entries(l.data).filter(([k]) => !['name', 'email', 'phone', 'full_name'].includes(k))))
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja excluir este lead permanentemente?')) return;
    try {
      await db.deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
    } catch (e) {
      alert('Erro ao excluir lead.');
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Leads...</div>;

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Leads</h2>
          <p className="text-sm md:text-base text-gray-500 font-medium">Gerencie sua base de contatos capturados.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 w-full md:w-auto"
        >
          <Download size={18} /> Exportar CSV
        </button>
      </header>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {leads.map(lead => (
          <div key={lead.id} className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-gray-900 truncate">{lead.data.name || lead.data.full_name || 'Anônimo'}</span>
                <span className="text-xs text-gray-400 truncate">{lead.data.email}</span>
                {lead.data.phone && <span className="text-xs text-blue-600 font-medium">{lead.data.phone}</span>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] text-gray-400 font-medium">{new Date(lead.createdAt).toLocaleDateString()}</span>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{lead.status}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Origem: {getSourceName(lead)}
              </span>
              <button
                onClick={() => handleDeleteLead(lead.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-[40px] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Lead</th>
              <th className="px-8 py-4">Dados Extras</th>
              <th className="px-8 py-4">Origem / Fluxo</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50/50 group">
                <td className="px-8 py-6">
                  <span className="font-bold text-gray-900">{lead.data.name || lead.data.full_name || 'Anônimo'}</span>
                  <p className="text-xs text-gray-400">{lead.data.email}</p>
                  {lead.data.phone && <p className="text-xs text-blue-600 font-medium">{lead.data.phone}</p>}
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {Object.entries(lead.data).filter(([k]) => !['name', 'email', 'phone', 'full_name', 'origin_type'].includes(k)).map(([k, v]) => (
                      <span key={k} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-gray-500">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {getSourceName(lead)}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{lead.status}</span>
                  <p className="text-[9px] text-gray-400 mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleDeleteLead(lead.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </td>
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
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const ints = await db.getIntegrations(user?.orgId);
        setIntegrations(ints || []);
      } catch (error) {
        console.error('Erro ao buscar integrações:', error);
      }
    };
    fetchIntegrations();
  }, [user]);

  const handleAdd = async () => {
    if (!newUrl || !newName) return;
    const newInt: Integration = {
      id: `int-${Date.now()}`,
      orgId: user?.orgId || '',
      name: newName,
      type: 'WEBHOOK',
      url: newUrl,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    await db.saveIntegration(newInt);
    const updated = await db.getIntegrations(user?.orgId);
    setIntegrations(updated);
    setIsAdding(false);
    setNewUrl('');
    setNewName('');
  };

  const handleDelete = async (id: string) => {
    await db.deleteIntegration(id);
    const updated = await db.getIntegrations(user?.orgId);
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
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const found = await db.getFormBySlug(orgSlug || '', formSlug || '');
        if (found) {
          setForm(found);

          // Meta Pixel injection
          if (found.settings.pixelId) {
            console.log(`Injetando Pixel: ${found.settings.pixelId}`);
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

          // GTM injection
          if (found.settings.gtmId) {
            console.log(`Injetando GTM: ${found.settings.gtmId}`);
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
      } catch (error) {
        console.error('Erro ao buscar formulário público:', error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchForm();
  }, [orgSlug, formSlug]);

  if (pageLoading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-400 font-bold uppercase tracking-[4px] text-[10px]">Carregando Fluxo...</p>
    </div>
  );

  if (!form) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Ops! Link Inválido</h2>
      <p className="text-gray-500 font-medium max-w-xs">Não encontramos o formulário que você está procurando. Verifique se o link está correto.</p>
    </div>
  );

  const steps = form.steps;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    // Validation: Check if all required blocks in the current step have values
    const inputTypes = ['short_text', 'long_text', 'email', 'standard_contact', 'single_choice', 'number', 'date', 'file'];
    const requiredBlocks = currentStep.columns.flatMap(col =>
      col.blocks.filter(block => block.settings.required && inputTypes.includes(block.type))
    );

    const missingFields = requiredBlocks.filter(block => {
      const key = block.settings.mappingKey || block.id;
      const value = formData[key];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      alert(`Por favor, preencha todos os campos obrigatórios: ${missingFields.map(b => b.settings.label).join(', ')}`);
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      submitForm();
    }
  };

  const submitForm = async () => {
    setIsLoading(true);

    try {
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

      // Meta Pixel Lead Event
      if (form.settings.pixelId && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
      }

      // Real Webhook Dispatch (Isolated by orgId)
      console.log(`[Webhook] Buscando integrações para Org: ${form.orgId}`);
      const currentIntegrations = await db.getIntegrations(form.orgId);

      if (form.settings.webhookIds && form.settings.webhookIds.length > 0) {
        const integrations = currentIntegrations.filter(i => form.settings.webhookIds.includes(i.id));
        console.log(`[Webhook] Total de integrações vinculadas ao formulário: ${integrations.length}`);

        // Payload amigável para CRM: Metadados do Lead + Dados do Formulário no root
        const payloadObj = {
          ...lead,
          ...formData, // Espalha os dados mapeados no root para facilitar integração
          lead_id: lead.id,
          submission_date: lead.createdAt,
          form_name: form.name
        };
        const payload = JSON.stringify(payloadObj);

        const promises = integrations.map(async (integration) => {
          if (!integration.url) return;
          console.log(`[Webhook] Tentando envio para: ${integration.name} (${integration.url})`);

          try {
            // TENTATIVA 1: Envio padrão com Content-Type correto (Pode disparar Preflight/CORS)
            const response = await fetch(integration.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload,
              keepalive: true
            });

            if (response.ok || response.type === 'opaque') {
              console.log(`[Webhook] ✅ Sucesso no envio para: ${integration.name}`);
            } else {
              console.error(`[Webhook] ❌ Servidor retornou erro ${response.status} para: ${integration.name}`);
              throw new Error(`Status ${response.status}`);
            }
          } catch (err) {
            console.warn(`[Webhook] ⚠️ Falha no envio padrão (CORS ou rede), tentando Fallback para: ${integration.name}`);

            // TENTATIVA 2: Fallback com no-cors (Não permite headers personalizados como application/json)
            try {
              await fetch(integration.url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: payload,
                keepalive: true,
                mode: 'no-cors'
              });
              console.log(`[Webhook] ℹ️ Envio via Fallback (no-cors) concluído para: ${integration.name}`);
            } catch (fallbackErr) {
              console.error(`[Webhook] ❌ Falha total no envio para ${integration.name}:`, fallbackErr);
            }
          }
        });

        await Promise.allSettled(promises);
      } else {
        console.log('[Webhook] Nenhum webhook configurado para este formulário.');
      }


      // Diagnostic Delay: Se houver redirecionamento, damos 1.5s extras para o browser terminar o handshake CORS/POST
      if (form.settings.redirectUrl) {
        console.log(`[System] Aguardando 1.5s para garantir entrega do webhook antes de redirecionar...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setIsLoading(false);

      if (form.settings.redirectUrl) {
        window.location.href = form.settings.redirectUrl;
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      alert('Houve um erro ao enviar seus dados. Por favor, tente novamente.');
      setIsLoading(false);
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
                    {block.type === 'image' && (
                      <div className="w-full">
                        {block.settings.src?.trim().startsWith('<') ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: cleanCanvaHtml(block.settings.src) }}
                            className="w-full rounded-2xl overflow-hidden shadow-sm [&_iframe]:w-full [&_iframe]:aspect-video"
                          />
                        ) : (
                          <img src={block.settings.src} className="w-full rounded-2xl shadow-sm" />
                        )}
                      </div>
                    )}

                    {(block.type === 'short_text' || block.type === 'email' || block.type === 'standard_contact') ? (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.settings.label}</label>
                        <input
                          type={block.type === 'email' ? 'email' : 'text'}
                          placeholder={block.settings.placeholder}
                          value={formData[block.settings.mappingKey || block.id] || ''}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (block.type === 'standard_contact') {
                              val = formatPhoneNumber(val);
                            }
                            setFormData({ ...formData, [block.settings.mappingKey || block.id]: val });
                          }}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    ) : null}

                    {block.type === 'long_text' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{block.settings.label}</label>
                        <textarea
                          placeholder={block.settings.placeholder}
                          value={formData[block.settings.mappingKey || block.id] || ''}
                          onChange={(e) => setFormData({ ...formData, [block.settings.mappingKey || block.id]: e.target.value })}
                          rows={4}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium resize-none"
                        />
                      </div>
                    )}

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
        <p className="text-center text-[8px] font-bold text-gray-300 uppercase tracking-[4px] mt-6">Lead Form Protection</p>
      </div>
    </div>
  );
};

// --- Form Detail Tabs (Builder, Leads, Settings) ---

const FormBuilderTab = ({ form, setForm }: { form: Form, setForm: (f: Form) => void }) => {
  const [activeStepId, setActiveStepId] = useState(form.steps[0]?.id || '');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState<{ stepId: string, colId: string } | null>(null);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

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
    let finalSettings = { ...settings };

    // Se for alteração de 'src' em bloco de imagem, limpa o código do Canva
    if (finalSettings.src && finalSettings.src.startsWith('<div')) {
      const match = finalSettings.src.match(/<div[\s\S]*?<\/div>/);
      if (match) finalSettings.src = match[0];
    }

    const newSteps = form.steps.map(step => ({
      ...step,
      columns: step.columns.map(col => ({
        ...col,
        blocks: col.blocks.map(b => b.id === blockId ? { ...b, settings: { ...b.settings, ...finalSettings } } : b)
      }))
    }));
    setForm({ ...form, steps: newSteps });
  };

  const addBlock = (type: BlockType, stepId: string, colId: string) => {
    let label = 'Novo Bloco';
    let placeholder = '';
    let mappingKey = '';

    if (type === 'heading') label = 'Título';
    else if (type === 'text') label = 'Descrição ou texto explicativo';
    else if (type === 'short_text') { label = 'Campo de Texto'; placeholder = 'Sua resposta'; mappingKey = `campo_${Date.now().toString(36)}`; }
    else if (type === 'long_text') { label = 'Texto Longo'; placeholder = 'Sua mensagem ou descrição'; mappingKey = `mensagem_${Date.now().toString(36)}`; }
    else if (type === 'email') { label = 'E-mail'; placeholder = 'seu@email.com'; mappingKey = 'email'; }
    else if (type === 'standard_contact') { label = 'WhatsApp'; placeholder = '(11) 99999-9999'; mappingKey = 'phone'; }
    else if (type === 'single_choice') label = 'Pergunta de múltipla escolha';
    else if (type === 'button') label = 'Enviar dados';

    const newBlock: FormBlock = {
      id: `block-${Date.now()}`,
      type,
      settings: {
        label,
        placeholder,
        mappingKey,
        required: ['short_text', 'long_text', 'email', 'standard_contact', 'single_choice'].includes(type),
        src: type === 'image' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop' : undefined,
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

  const duplicateBlock = (e: React.MouseEvent, block: FormBlock, stepId: string, colId: string) => {
    e.stopPropagation();
    const newBlock: FormBlock = {
      ...block,
      id: `block-${Date.now()}`,
      settings: { ...block.settings, label: `${block.settings.label} (Cópia)` }
    };

    setForm({
      ...form,
      steps: form.steps.map(s => s.id === stepId ? {
        ...s,
        columns: s.columns.map(c => c.id === colId ? {
          ...c,
          blocks: c.blocks.reduce((acc, b) => {
            acc.push(b);
            if (b.id === block.id) acc.push(newBlock);
            return acc;
          }, [] as FormBlock[])
        } : c)
      } : s)
    });
    setSelectedBlockId(newBlock.id);
  };

  const moveStep = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newSteps = [...form.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setForm({ ...form, steps: newSteps });
  };

  const duplicateStep = (e: React.MouseEvent, step: FormStep, index: number) => {
    e.stopPropagation();
    const newStepId = `step-${Date.now()}`;
    const newStep: FormStep = {
      ...step,
      id: newStepId,
      title: `${step.title} (Cópia)`,
      columns: step.columns.map(col => ({
        ...col,
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        blocks: col.blocks.map(block => ({
          ...block,
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        }))
      }))
    };

    const newSteps = [...form.steps];
    newSteps.splice(index + 1, 0, newStep);
    setForm({ ...form, steps: newSteps });
    setActiveStepId(newStepId);
  };

  const deleteStep = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    if (form.steps.length <= 1) {
      alert('O formulário deve ter pelo menos uma etapa.');
      return;
    }
    if (!confirm('Deseja excluir esta etapa e todos os seus blocos?')) return;

    const newSteps = form.steps.filter(s => s.id !== stepId);
    setForm({ ...form, steps: newSteps });
    if (activeStepId === stepId) {
      setActiveStepId(newSteps[0].id);
    }
  };

  const [draggedBlock, setDraggedBlock] = useState<{ blockId: string, stepId: string, colId: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, blockId: string, stepId: string, colId: string) => {
    setDraggedBlock({ blockId, stepId, colId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStepId: string, targetColId: string, targetBlockId?: string) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const { blockId: draggedId, stepId: sourceStepId, colId: sourceColId } = draggedBlock;

    // Find the block
    const sourceStep = form.steps.find(s => s.id === sourceStepId);
    const sourceCol = sourceStep?.columns.find(c => c.id === sourceColId);
    const blockToMove = sourceCol?.blocks.find(b => b.id === draggedId);

    if (!blockToMove) return;

    const newSteps = form.steps.map(s => {
      // Remove from source
      let updatedColumns = s.columns.map(c => {
        if (s.id === sourceStepId && c.id === sourceColId) {
          return { ...c, blocks: c.blocks.filter(b => b.id !== draggedId) };
        }
        return c;
      });

      // Add to target
      updatedColumns = updatedColumns.map(c => {
        if (s.id === targetStepId && c.id === targetColId) {
          const newBlocks = [...c.blocks];
          if (targetBlockId) {
            const index = newBlocks.findIndex(b => b.id === targetBlockId);
            newBlocks.splice(index, 0, blockToMove);
          } else {
            newBlocks.push(blockToMove);
          }
          return { ...c, blocks: newBlocks };
        }
        return c;
      });

      return { ...s, columns: updatedColumns };
    });

    setForm({ ...form, steps: newSteps });
    setDraggedBlock(null);
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
            <div key={s.id} onClick={() => setActiveStepId(s.id)} className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${activeStepId === s.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white text-gray-600'}`}>
              {editingStepId === s.id ? (
                <input
                  autoFocus
                  value={s.title}
                  onChange={(e) => setForm({ ...form, steps: form.steps.map(step => step.id === s.id ? { ...step, title: e.target.value } : step) })}
                  onBlur={() => setEditingStepId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingStepId(null)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold bg-white text-gray-900 border-none rounded px-1 w-[calc(100%-40px)] outline-none"
                />
              ) : (
                <span className="text-xs font-bold truncate block pr-16">{i + 1}. {s.title}</span>
              )}

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); setEditingStepId(s.id); }} className="p-1 hover:bg-black/10 rounded" title="Renomear Etapa"><Edit size={12} /></button>
                <button onClick={(e) => duplicateStep(e, s, i)} className="p-1 hover:bg-black/10 rounded" title="Duplicar Etapa"><Copy size={12} /></button>
                <div className="flex flex-col gap-0.5">
                  {i < form.steps.length - 1 && <button onClick={(e) => moveStep(e, i, 'down')} className="p-0.5 hover:bg-black/10 rounded"><ArrowDown size={10} /></button>}
                </div>
                <button onClick={(e) => deleteStep(e, s.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded" title="Excluir Etapa"><Trash2 size={12} /></button>
              </div>
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
                  <div
                    key={b.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, b.id, activeStepId, col.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, activeStepId, col.id, b.id)}
                    onClick={() => setSelectedBlockId(b.id)}
                    className={`group relative p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedBlockId === b.id ? 'border-blue-500 bg-blue-50/50' : 'bg-white border-white shadow-sm hover:border-gray-200'}`}
                  >
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400">
                      <GripVertical size={14} />
                    </div>

                    <div className="absolute -right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={(e) => duplicateBlock(e, b, activeStepId, col.id)} className="p-1.5 bg-white border shadow-sm rounded-lg text-blue-600 hover:bg-blue-50 transition-all" title="Duplicar"><Copy size={12} /></button>
                    </div>

                    {b.type === 'heading' && <h3 className="font-bold text-gray-800 pointer-events-none">{b.settings.label}</h3>}
                    {b.type === 'text' && <p className="text-[10px] text-gray-500 leading-tight pointer-events-none">{b.settings.label}</p>}
                    {b.type === 'image' && (
                      <div className="space-y-1">
                        {b.settings.src ? (
                          b.settings.src.trim().startsWith('<') ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: cleanCanvaHtml(b.settings.src) }}
                              className="w-full rounded-lg overflow-hidden [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:h-auto pointer-events-none"
                            />
                          ) : (
                            <img src={b.settings.src} alt="" className="w-full rounded-lg pointer-events-none" />
                          )
                        ) : (
                          <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sem Imagem</div>
                        )}
                      </div>
                    )}
                    {['short_text', 'email', 'standard_contact'].includes(b.type) && (
                      <div className="space-y-1 pointer-events-none">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">{b.settings.label}</label>
                        <div className="w-full h-8 bg-gray-50 border border-gray-100 rounded-lg" />
                      </div>
                    )}
                    {b.type === 'long_text' && (
                      <div className="space-y-1 pointer-events-none">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">{b.settings.label}</label>
                        <div className="w-full h-16 bg-gray-50 border border-gray-100 rounded-lg" />
                      </div>
                    )}
                    {b.type === 'single_choice' && (
                      <div className="space-y-2 pointer-events-none">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">{b.settings.label}</label>
                        <div className="w-full h-8 border border-gray-100 rounded-lg flex items-center px-3 text-[10px] text-gray-400">Selecionar...</div>
                      </div>
                    )}
                    {b.type === 'button' && (
                      <div className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold text-center pointer-events-none">{b.settings.label}</div>
                    )}
                  </div>
                ))}
                <button
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, activeStepId, col.id)}
                  onClick={() => setIsAddingBlock({ stepId: activeStepId, colId: col.id })}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all"
                >
                  + Adicionar Bloco
                </button>
              </div>
            ))}
          </div>
        </div>

        {isAddingBlock && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xs space-y-4">
              <h4 className="font-bold border-b pb-2">Novo Bloco</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'heading', label: 'Título' },
                  { type: 'text', label: 'Texto' },
                  { type: 'image', label: 'Imagem/Canva' },
                  { type: 'short_text', label: 'Campo Texto' },
                  { type: 'long_text', label: 'Texto Longo' },
                  { type: 'email', label: 'E-mail' },
                  { type: 'standard_contact', label: 'WhatsApp' },
                  { type: 'single_choice', label: 'Opções' },
                  { type: 'button', label: 'Botão' }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => addBlock(item.type as BlockType, isAddingBlock.stepId, isAddingBlock.colId)}
                    className="p-3 bg-gray-50 rounded-2xl text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center gap-2 border border-gray-100"
                  >
                    <div className="w-6 h-6 flex items-center justify-center opacity-60">
                      {item.type === 'heading' && <Type size={16} />}
                      {item.type === 'text' && <FileText size={16} />}
                      {item.type === 'image' && <ImageIcon size={16} />}
                      {item.type === 'short_text' && <UserPlus size={16} />}
                      {item.type === 'long_text' && <FileText size={16} />}
                      {item.type === 'email' && <Send size={16} />}
                      {item.type === 'standard_contact' && <Smartphone size={16} />}
                      {item.type === 'single_choice' && <Layers size={16} />}
                      {item.type === 'button' && <Save size={16} />}
                    </div>
                    {item.label}
                  </button>
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
            {selectedBlock.type !== 'image' && (
              <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Título / Pergunta</label><input value={selectedBlock.settings.label} onChange={e => updateBlockSettings(selectedBlock.id, { label: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none" /></div>
            )}

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
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">!</span>
                    Dica do Canva
                  </div>
                  <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                    Para usar um design do Canva:<br />
                    1. Clique em <b>Compartilhar</b><br />
                    2. Mais {">"} <b>Incorporar (Embed)</b><br />
                    3. Copie o <b>Código de incorporação HTML</b> e cole acima.
                  </p>
                  <a href="https://www.canva.com" target="_blank" className="block text-center py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold hover:bg-blue-700 transition-all">Abrir Canva</a>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <ImageIcon size={14} className="text-emerald-600" />
                    Hospedar Fotos Grátis (Postimages)
                  </div>
                  <p className="text-[10px] text-emerald-900 leading-relaxed font-medium">
                    Envie fotos no Postimages sem cadastro e copie a linha <b>Link direto</b>.
                  </p>
                  <div className="flex gap-2">
                    <a href="https://postimages.org" target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1">
                      Abrir Postimages <ExternalLink size={12} />
                    </a>
                    <Link to="/dashboard/images-guide" target="_blank" className="flex-1 text-center py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-bold hover:bg-emerald-50 transition-all">
                      Ver Guia
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {['short_text', 'long_text', 'email', 'standard_contact', 'single_choice'].includes(selectedBlock.type) && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Obrigatório</span>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </div>
                <button
                  onClick={() => updateBlockSettings(selectedBlock.id, { required: !selectedBlock.settings.required })}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${selectedBlock.settings.required ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${selectedBlock.settings.required ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            )}

            {['short_text', 'long_text', 'email', 'standard_contact'].includes(selectedBlock.type) && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Chave de Mapeamento (JSON Key)</label>
                <input
                  value={selectedBlock.settings.mappingKey || ''}
                  onChange={e => updateBlockSettings(selectedBlock.id, { mappingKey: e.target.value })}
                  placeholder="Ex: profissao, observacoes, email"
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
            <div className="flex gap-2">
              <button onClick={(e) => duplicateBlock(e, selectedBlock, activeStepId, activeStep.columns[0].id)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Copy size={14} /> Duplicar</button>
              <button onClick={() => setForm({ ...form, steps: form.steps.map(s => ({ ...s, columns: s.columns.map(c => ({ ...c, blocks: c.blocks.filter(b => b.id !== selectedBlock.id) })) })) })} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase">Remover</button>
            </div>
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-blue-100 border border-blue-50">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mx-auto text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">L</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Lead Form</h2>
          <p className="text-gray-500 font-medium">Capture leads com fluxos de alta conversão.</p>
        </div>
        <div className="space-y-4">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 px-4">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-medium" placeholder="seu@email.com" /></div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 px-4">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-medium pr-14"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button onClick={() => login(email, password)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all duration-300">Entrar na Plataforma</button>
        </div>
        <div className="text-center pt-4 space-y-2">
          <p className="text-sm text-gray-500">Ainda não tem conta? <button onClick={() => navigate('/signup')} className="text-blue-600 font-bold hover:underline">Cadastre-se como Corretor</button></p>
          <p className="text-xs text-gray-400"><button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 font-bold">← Conhecer o Combo LeadForm + PageLead</button></p>
        </div>
      </div>
    </div>
  );
};

const SignupView = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !email || !password) return alert('Preencha todos os campos.');
    setLoading(true);

    try {
      const orgId = `org-${Date.now()}`;
      const userId = `user-${Date.now()}`;

      const newOrg: Organization = {
        id: orgId,
        name: `Imobiliária ${name}`,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        plan: 'FREE',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      const newUser: User = {
        id: userId,
        orgId,
        email,
        password,
        name,
        role: Role.ORG_ADMIN,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      await db.saveOrg(newOrg);
      await db.saveUser(newUser);

      alert('Cadastro realizado! Aguarde a aprovação do administrador para entrar.');
      navigate('/login');
    } catch (e) {
      console.error('Signup error:', e);
      alert('Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-blue-100 border border-blue-50">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mx-auto text-white font-black text-3xl shadow-xl shadow-blue-200 mb-6">L</div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Criar Conta</h2>
          <p className="text-gray-500 font-medium">Comece a capturar leads imobiliários hoje.</p>
        </div>
        <div className="space-y-4">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 px-4">Nome Completo</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-medium" placeholder="Seu nome" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 px-4">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-medium" placeholder="seu@email.com" /></div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 px-4">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all font-medium pr-14"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button onClick={handleSignup}
            disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-50">
            {loading ? 'Criando conta...' : 'Cadastrar agora'}
          </button>
        </div>
        <div className="text-center pt-4 space-y-2">
          <p className="text-sm text-gray-500">Já tem conta? <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">Fazer Login</button></p>
          <p className="text-xs text-gray-400"><button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 font-bold">← Conhecer o Combo LeadForm + PageLead</button></p>
        </div>
      </div>
    </div>
  );
};

const FormDetailView = () => {
  const { user, isGlobalView } = useAuth();
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [isSaving, setIsSaving] = useState(false);
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);

  const saveForm = async () => {
    if (!form || !user) return;
    setIsSaving(true);
    try {
      const formToSave = { ...form, orgId: user.orgId, updatedAt: new Date().toISOString() };
      await db.saveForm(formToSave);
      setForm(formToSave);
      alert('✅ Formulário salvo com sucesso!');
    } catch (e) {
      alert('❌ Erro ao salvar: ' + (e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        if (formId === 'new') {
          const newForm: Form = {
            id: `form-${Date.now()}`,
            orgId: user?.orgId || 'org-1',
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

        const forms = await db.getForms(user?.orgId, user?.email, isGlobalView);
        const found = (forms || []).find(f => f.id === formId);
        if (found) setForm(found);

        // Fetch integrations for this org
        const ints = await db.getIntegrations(user?.orgId);
        setAvailableIntegrations(ints || []);
      } catch (error) {
        console.error('Erro ao buscar detalhe do formulário:', error);
        alert('Erro ao carregar ou salvar formulário. Verifique se o Firestore está configurado em "Modo de Teste" no console do Firebase.');
      }
    };
    fetchForm();
  }, [formId, navigate, user]);

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
          <button
            disabled={isSaving}
            onClick={saveForm}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 disabled:opacity-50"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
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

            <div className="pt-4 border-t">
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-4">Webhooks Ativos para este Fluxo</label>
              <div className="space-y-3">
                {availableIntegrations.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhuma integração configurada no painel principal.</p>
                ) : (
                  availableIntegrations.map(int => (
                    <div key={int.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center">
                          <Webhook size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{int.name}</p>
                          <p className="text-[10px] text-gray-400 truncate w-40">{int.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const currentIds = form.settings.webhookIds || [];
                          const newIds = currentIds.includes(int.id)
                            ? currentIds.filter(id => id !== int.id)
                            : [...currentIds, int.id];
                          setForm({ ...form, settings: { ...form.settings, webhookIds: newIds } });
                        }}
                        className={`w-10 h-5 rounded-full p-1 transition-colors ${form.settings.webhookIds?.includes(int.id) ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${form.settings.webhookIds?.includes(int.id) ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormListView = () => {
  const { user, isGlobalView } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const f = await db.getForms(user?.orgId, user?.email, isGlobalView);
        setForms(f || []);
      } catch (error) {
        console.error('Erro ao buscar lista de formulários:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [user, isGlobalView]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir este formulário? Seus leads continuarão salvos.')) return;
    try {
      await db.deleteForm(id);
      setForms(forms.filter(f => f.id !== id));
    } catch (e) {
      alert('Erro ao excluir formulário.');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    try {
      const newForm: Form = {
        ...form,
        id: `form-${Date.now()}`,
        name: `${form.name} (Cópia)`,
        slug: `${form.slug}-copia-${Date.now()}`,
        sharedWith: [], // Reset shared with on duplicate
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.saveForm(newForm);
      setForms([newForm, ...forms]);
      alert('Formulário duplicado com sucesso!');
    } catch (e) {
      alert('Erro ao duplicar formulário.');
    }
  };

  const [sharingForm, setSharingForm] = useState<Form | null>(null);
  const [shareEmail, setShareEmail] = useState('');

  const handleShare = async () => {
    if (!sharingForm || !shareEmail) return;
    try {
      await db.shareForm(sharingForm.id, shareEmail);
      alert(`Formulário compartilhado com ${shareEmail}`);
      setSharingForm(null);
      setShareEmail('');
    } catch (e) {
      alert('Erro ao compartilhar formulário.');
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20 font-bold">Carregando Formulários...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div><h2 className="text-4xl font-black text-gray-900 tracking-tight">Formulários</h2><p className="text-gray-500 font-medium">Capture leads com fluxos de alta conversão.</p></div>
        <button onClick={() => navigate('/dashboard/forms/new')} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-[20px] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"><Plus size={20} /> Novo Fluxo</button>
      </div>

      {sharingForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black">Compartilhar Fluxo</h3>
              <button onClick={() => setSharingForm(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <p className="text-gray-500 font-medium">Insira o e-mail do usuário com quem deseja compartilhar o formulário <b>{sharingForm.name}</b>.</p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail do destinatário</label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="usuario@email.com"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <button
              onClick={handleShare}
              className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Compartilhar Agora
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map(form => (
          <div key={form.id} onClick={() => navigate(`/dashboard/forms/${form.id}`)} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all group relative">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500"><FileText size={32} /></div>
            <h3 className="text-2xl font-bold text-gray-900 truncate">{form.name}</h3>
            <div className="flex items-center justify-between border-t border-gray-50 pt-8 mt-8">
              <span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-4 py-1.5 rounded-full tracking-widest">{form.status}</span>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setSharingForm(form); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Compartilhar"><Share2 size={18} /></button>
                <button onClick={(e) => handleDuplicate(e, form)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Duplicar"><Copy size={18} /></button>
                <button onClick={(e) => handleDelete(e, form.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir"><Trash2 size={18} /></button>
              </div>
            </div>
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
      const timeout = setTimeout(() => setLoading(false), 5000);
      try {
        const l = await db.getLeadsByForm(formId);
        setLeads(l || []);
        clearTimeout(timeout);
      } catch (error) {
        console.error('Erro ao buscar leads por formulário:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [formId]);

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja excluir este lead permanentemente?')) return;
    try {
      await db.deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
    } catch (e) {
      alert('Erro ao excluir lead.');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Carregando leads...</div>;

  return (
    <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50"><tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"><th className="px-8 py-4">Lead</th><th className="px-8 py-4">Data</th><th className="px-8 py-4 w-10"></th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map(l => (
            <tr key={l.id} className="hover:bg-gray-50/50 group">
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{l.data.name || l.data.full_name || l.data.email || 'Lead sem nome'}</span>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    {l.data.email && <span>{l.data.email}</span>}
                    {l.data.email && l.data.phone && <span className="w-1 h-1 bg-gray-200 rounded-full" />}
                    {l.data.phone && <span className="text-blue-600">{l.data.phone}</span>}
                  </div>
                </div>
              </td>
              <td className="px-8 py-4 text-xs text-gray-400 font-medium">{new Date(l.createdAt).toLocaleDateString()}</td>
              <td className="px-8 py-4 text-right">
                <button onClick={() => handleDeleteLead(l.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminUsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, o] = await Promise.all([db.getUsers(), db.getOrgs()]);
        setUsers(u);
        setOrganizations(o);
      } catch (error) {
        console.error('Erro ao buscar dados admin:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (user: User) => {
    try {
      await db.saveUser({ ...user, status: 'APPROVED' });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'APPROVED' } : u));
    } catch (error) {
      alert('Erro ao aprovar usuário.');
    }
  };

  const handleSuspend = async (user: User) => {
    try {
      await db.saveUser({ ...user, status: 'SUSPENDED' });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'SUSPENDED' } : u));
    } catch (error) {
      alert('Erro ao suspender usuário.');
    }
  };

  const handleResetPassword = async (user: User) => {
    const DEFAULT_PASSWORD = 'Mudar@123';
    if (!confirm(`Deseja resetar a senha de ${user.name} para a padrão (${DEFAULT_PASSWORD})?`)) return;

    try {
      await db.saveUser({ ...user, password: DEFAULT_PASSWORD });
      alert(`Senha resetada com sucesso para: ${DEFAULT_PASSWORD}`);
    } catch (error) {
      alert('Erro ao resetar senha.');
      console.error(error);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Carregando painel administrativo...</div>;

  return (
    <div className="space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Gestão de Usuários</h2>
          <p className="text-sm md:text-base text-gray-500 font-medium">Aprove ou suspenda o acesso de corretores à plataforma.</p>
        </div>
      </header>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.filter(u => u.role !== Role.SUPER_ADMIN).map(user => {
          const org = organizations.find(o => o.id === user.orgId);
          return (
            <div key={user.id} className="bg-white p-5 rounded-3xl border shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-lg leading-tight">{user.name}</span>
                  <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{org?.name || 'Sem Org'}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-widest ${user.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                  user.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                  {user.status}
                </span>
              </div>

              <div className="text-xs text-gray-500 font-medium border-t border-gray-50 pt-3">
                <p className="flex items-center gap-2 mb-2"><Mail size={14} className="text-gray-400" /> {user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {user.status === 'PENDING' && (
                  <button onClick={() => handleApprove(user)} className="bg-blue-600 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"><CheckCircle size={14} /> Aprovar</button>
                )}
                {user.status === 'APPROVED' && (
                  <button onClick={() => handleSuspend(user)} className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Slash size={14} /> Suspender</button>
                )}
                {user.status === 'SUSPENDED' && (
                  <button onClick={() => handleApprove(user)} className="bg-green-600 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><RefreshCw size={14} /> Reativar</button>
                )}
                <button
                  onClick={() => handleResetPassword(user)}
                  className="bg-gray-50 text-gray-500 px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  title="Resetar para senha padrão"
                >
                  <Key size={14} /> Senha
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-[40px] border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Usuário / Imobiliária</th>
              <th className="px-8 py-4">E-mail</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.filter(u => u.role !== Role.SUPER_ADMIN).map(user => {
              const org = organizations.find(o => o.id === user.orgId);
              return (
                <tr key={user.id} className="hover:bg-gray-50/50">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{user.name}</span>
                      <span className="text-xs text-blue-600 font-medium">{org?.name || 'Sem Org'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-medium text-gray-500">{user.email}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest ${user.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                      user.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      {user.status === 'PENDING' && (
                        <button onClick={() => handleApprove(user)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">Aprovar</button>
                      )}
                      {user.status === 'APPROVED' && (
                        <button onClick={() => handleSuspend(user)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">Suspender</button>
                      )}
                      {user.status === 'SUSPENDED' && (
                        <button onClick={() => handleApprove(user)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-all">Reativar</button>
                      )}
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
                        title="Resetar para senha padrão"
                      >
                        Resetar Senha
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsView = () => {
  const { user, login } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (currentPassword !== user.password) {
      alert('A senha atual está incorreta.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = { ...user, password: newPassword };
      await db.saveUser(updatedUser);

      // Update local storage and state via login (simulated refresh)
      localStorage.setItem('lp_session', JSON.stringify(updatedUser));
      alert('Senha atualizada com sucesso!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      alert('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Configurações</h2>
        <p className="text-gray-500 font-medium">Gerencie suas informações e segurança da conta.</p>
      </header>

      <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Informações do Perfil
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nome</label>
              <p className="font-bold text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">E-mail</label>
              <p className="font-bold text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" />
            Alterar Senha
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha Atual</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium pr-14"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  title={showCurrent ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium pr-14"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    title={showNew ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium pr-14"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    title={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InstructionsView = () => {
  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Manual de Uso</h2>
        <p className="text-gray-500 font-medium">Aprenda a dominar o Lead Form e escalar suas capturas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <Layers size={24} />
          </div>
          <h3 className="text-xl font-bold">1. Criando seu Primeiro Fluxo</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vá em <b>Formulários {">"} Novo Fluxo</b>. No editor, você pode adicionar blocos de texto, perguntas e imagens.
            Use o ícone de <b>+</b> para adicionar blocos e arraste pela alça lateral para reordenar.
          </p>
          <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 font-medium italic">
            Dica: Use <b>múltiplas etapas</b> para não cansar o lead e aumentar a conversão.
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-xl font-bold">2. Integrando com o Canva</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Para deixar seu form lindo, crie um design no Canva e use a opção <b>Compartilhar {">"} Incorporar (Embed)</b>.
            Copie o código HTML e cole no campo de URL do bloco de Imagem.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <Webhook size={24} />
          </div>
          <h3 className="text-xl font-bold">3. Webhooks & Automação</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Cadastre sua URL de Webhook em <b>Integrações</b>. Depois, dentro das configurações do seu formulário,
            selecione quais webhooks devem receber os novos leads.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold">4. Rastreamento (Pixel/GTM)</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Nas configurações do fluxo, você pode inserir o seu <b>ID do Pixel do Facebook</b> ou <b>GTM ID</b>.
            O sistema enviará eventos de `PageView` e `Lead` automaticamente.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-xl font-bold">5. Hospedar Fotos de Imóveis</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Recomendamos o <b>Postimages</b> para hospedar as fotos dos seus imóveis gratuitamente e sem necessidade de cadastro. Obtenha o Link Direto para colocar na foto de capa e galeria do Page Lead.
          </p>
          <div className="flex gap-2 pt-1">
            <a href="https://postimages.org" target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all">
              Abrir Postimages <ExternalLink size={13} />
            </a>
            <Link to="/dashboard/images-guide" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border transition-all">
              Ver Guia Passo a Passo
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 p-10 rounded-[40px] text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold">Dúvidas ou suporte técnico?</h3>
          <p className="text-blue-100 font-medium">Estamos aqui para ajudar você a vender mais imóveis.</p>
        </div>
        <a href="https://wa.me/5554996895454" target="_blank" className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
          <Smartphone size={20} /> Falar com Suporte
        </a>
      </div>
    </div>
  );
};

const ImagesGuideView = () => {
  const [testUrl, setTestUrl] = useState('');
  const [imgStatus, setImgStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'warning_page_link'>('idle');

  const handleTestImage = (url: string) => {
    setTestUrl(url);
    const trimmed = url.trim();
    if (!trimmed) {
      setImgStatus('idle');
      return;
    }

    // Check if user accidentally pasted the viewer page link
    if (trimmed.includes('postimg.cc/') && !trimmed.includes('i.postimg.cc/')) {
      setImgStatus('warning_page_link');
      return;
    }

    if (trimmed.includes('ibb.co/') && !trimmed.includes('i.ibb.co/')) {
      setImgStatus('warning_page_link');
      return;
    }

    setImgStatus('loading');
    const img = new Image();
    img.onload = () => setImgStatus('success');
    img.onerror = () => setImgStatus('error');
    img.src = trimmed;
  };

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2">
            <ImageIcon size={12} /> Hospedagem & Envio de Fotos
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Fotos dos Seus Imóveis</h2>
          <p className="text-gray-500 font-medium">
            Você pode <b>enviar direto do seu celular/computador</b> no editor do Page Lead, ou utilizar o <b>Postimages</b> para hospedar e gerar links diretos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/dashboard/pages"
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            Ir para o Page Lead
          </Link>
          <a
            href="https://postimages.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            Abrir Postimages <ExternalLink size={18} />
          </a>
        </div>
      </header>

      {/* Direct Upload Highlight Card */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-200 rounded-[36px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
            ⭐ Mais Fácil & Rápido
          </span>
          <h3 className="text-xl md:text-2xl font-black text-gray-900">Envio Direto do Aparelho no Page Lead</h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            Agora você não precisa nem sair da plataforma: ao criar ou editar uma landing page, basta clicar no botão azul <b>"📁 Escolher Foto do Celular ou Computador"</b>. A imagem é comprimida e carregada instantaneamente em alta resolução.
          </p>
        </div>
        <Link
          to="/dashboard/pages"
          className="px-6 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-2xl font-bold text-xs shadow-sm shrink-0 transition-all"
        >
          Testar no Editor
        </Link>
      </div>

      {/* Step by Step */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[36px] border shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            1
          </div>
          <h3 className="text-xl font-bold text-gray-900">Acesse o Postimages</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Clique no botão azul <b>"Abrir Postimages"</b> acima ou acesse <a href="https://postimages.org" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">postimages.org</a>. O serviço é 100% gratuito e não exige nenhum cadastro ou login.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[36px] border shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            2
          </div>
          <h3 className="text-xl font-bold text-gray-900">Clique em "Escolher imagens"</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Clique no botão <b>"Escolher imagens"</b> e selecione do seu computador ou celular as fotos do imóvel (foto de capa, fachada, salas, quartos, cozinha e lazer). O upload inicia na mesma hora!
          </p>
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
            💡 Dica: Para a <b>Foto de Capa</b>, escolha uma foto na horizontal (paisagem) com excelente iluminação.
          </div>
        </div>

        <div className="bg-white p-8 rounded-[36px] border shadow-sm space-y-4 border-emerald-200 ring-2 ring-emerald-500/10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            3
          </div>
          <h3 className="text-xl font-bold text-gray-900">Copie a linha "Link direto"</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Assim que a foto terminar de subir, o Postimages exibirá várias caixas de links. Localize a 2ª linha chamada <b>"Link direto"</b> e clique no botão azul com ícone de copiar ao lado!
          </p>
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
            <p className="font-bold">✅ Formato Correto do Link Direto:</p>
            <p className="font-mono text-[11px] truncate">https://i.postimg.cc/abc1234/foto-imovel.jpg</p>
            <p className="text-[10px] text-emerald-700 mt-1">Sempre começa com <b>i.postimg.cc</b> e termina com a extensão da foto (<b>.jpg</b> ou <b>.png</b>).</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[36px] border shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
            4
          </div>
          <h3 className="text-xl font-bold text-gray-900">Cole no Page Lead</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Volte para o seu imóvel no <b>Page Lead</b>, vá na aba <b>Fotos & Lazer</b> e cole no campo <b>Foto de Capa</b> ou clique em <b>+ Foto</b> na Galeria. A foto aparecerá imediatamente no preview!
          </p>
        </div>
      </div>

      {/* Interactive Image Tester */}
      <div className="bg-white p-8 md:p-10 rounded-[40px] border shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Testador de Links</span>
          <h3 className="text-2xl font-black text-gray-900">Testar se a sua Foto Carrega</h3>
          <p className="text-sm text-gray-500">Cole o link que você copiou do Postimages no campo abaixo para validar se ele é um link direto funcional.</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={testUrl}
            onChange={e => handleTestImage(e.target.value)}
            placeholder="Cole o link aqui (ex: https://i.postimg.cc/.../foto.jpg)"
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-600 text-sm font-mono"
          />

          {imgStatus === 'loading' && (
            <p className="text-xs text-blue-600 font-bold animate-pulse">Testando carregamento da imagem...</p>
          )}

          {imgStatus === 'warning_page_link' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 animate-in fade-in">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle size={16} /> Você copiou o link da página em vez do "Link direto"!
              </p>
              <p className="leading-relaxed">
                Esse link (ex: <code>postimg.cc/...</code>) abre a página web com botões, não a imagem pura. No Postimages, procure a 2ª linha chamada <b>"Link direto"</b> (que começa com <code>https://i.postimg.cc/</code> e termina com <code>.jpg</code>) e clique no botão de cópia ao lado dela.
              </p>
            </div>
          )}

          {imgStatus === 'success' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Perfeito! Link direto válido e pronto para colar no Page Lead.
              </div>
              <div className="w-full max-w-sm aspect-video rounded-xl overflow-hidden border shadow-sm bg-black">
                <img src={testUrl} alt="Preview do Teste" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {imgStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle size={15} /> Não conseguimos carregar a imagem com esse endereço.
              </p>
              <p className="text-red-700">
                Certifique-se de que no Postimages você selecionou a opção <b>"Link direto"</b> (o link deve começar com <code>i.postimg.cc</code> e terminar com <code>.jpg</code> ou <code>.png</code>).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alternative Options */}
      <div className="bg-gray-100 p-8 rounded-[36px] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="font-bold text-gray-900 text-lg">Outras opções gratuitas de hospedagem</h4>
          <p className="text-sm text-gray-500">
            Você também pode usar o <a href="https://imgchest.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">ImgChest</a> ou o <a href="https://canva.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Canva</a> para incorporar artes prontas.
          </p>
        </div>
        <a
          href="https://postimages.org"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 bg-white text-gray-700 hover:text-blue-600 rounded-2xl font-bold text-xs border shadow-sm shrink-0 flex items-center gap-2"
        >
          Abrir Postimages <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

const PendingApprovalView = () => {
  const { user, logout, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);

  // Auto-polling a cada 5 segundos enquanto estiver nesta tela
  useEffect(() => {
    // Tenta sincronizar imediatamente ao montar
    refreshUser();

    const interval = setInterval(() => {
      refreshUser();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const fresh = await refreshUser();
      if (fresh && fresh.status === 'APPROVED') {
        // Status aprovado! O ProtectedRoute re-renderiza e libera a tela do Dashboard.
        return;
      }
      alert('Sua conta ainda consta como em análise. Se o administrador acabou de aprovar, aguarde alguns instantes ou clique novamente.');
    } catch (e) {
      alert('Erro ao verificar status. Tente novamente.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-24 h-24 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center animate-pulse">
        <Clock size={48} />
      </div>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Conta em Análise</h1>
      <p className="text-gray-500 max-w-sm font-medium">
        {user?.name ? `Olá, ${user.name}! ` : ''}Sua conta foi criada com sucesso! Por questões de segurança, nossa equipe está revisando seus dados. Você receberá um e-mail assim que for liberado.
      </p>
      <div className="pt-4 flex flex-col gap-4">
        <button
          onClick={handleCheckStatus}
          disabled={checking}
          className="bg-blue-600 text-white shadow-lg shadow-blue-200 px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={18} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Verificando...' : 'Verificar Status'}
        </button>
        <button onClick={logout} className="text-red-600 font-bold hover:underline cursor-pointer">
          Sair da conta
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.status === 'PENDING' && user.role !== Role.SUPER_ADMIN) {
    return <PendingApprovalView />;
  }

  if (user.status === 'SUSPENDED') {
    return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Sua conta foi suspensa. Entre em contato com o suporte.</div>;
  }

  return <>{children}</>;
};

const PageLeadListRoute = () => {
  const { user, isGlobalView } = useAuth();
  return <PageLeadListView user={user} isGlobalView={isGlobalView} />;
};

const PageLeadDetailRoute = () => {
  const { user, isGlobalView } = useAuth();
  return <PageLeadDetailView user={user} isGlobalView={isGlobalView} />;
};

const App: React.FC = () => (
  <AuthProvider>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPageView />} />
        <Route path="/vendas" element={<LandingPageView />} />
        <Route path="/planos" element={<LandingPageView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/forms" element={<ProtectedRoute><Layout><FormListView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/forms/:formId" element={<ProtectedRoute><Layout><FormDetailView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/pages" element={<ProtectedRoute><Layout><PageLeadListRoute /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/pages/:pageId" element={<ProtectedRoute><Layout><PageLeadDetailRoute /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/images-guide" element={<ProtectedRoute><Layout><ImagesGuideView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/leads" element={<ProtectedRoute><Layout><LeadListView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/integrations" element={<ProtectedRoute><Layout><IntegrationListView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/admin/users" element={<ProtectedRoute><Layout><AdminUsersView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Layout><SettingsView /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/help" element={<ProtectedRoute><Layout><InstructionsView /></Layout></ProtectedRoute>} />
        <Route path="/f/:orgSlug/:formSlug" element={<PublicFormView />} />
        <Route path="/p/:orgSlug/:pageSlug" element={<PublicPageLeadView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </AuthProvider>
);

export default App;

