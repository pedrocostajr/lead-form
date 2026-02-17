
import { Organization, User, Form, Lead, Integration, Role, FormStatus } from './types';

const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'LeadSign Imóveis',
  slug: 'leadsign',
  plan: 'BUSINESS',
  status: 'ACTIVE',
  createdAt: new Date().toISOString()
};

const MOCK_USER: User = {
  id: 'user-1',
  orgId: 'org-1',
  email: 'contato@leadsign.com.br',
  name: 'Admin LeadSign',
  role: Role.SUPER_ADMIN,
  createdAt: new Date().toISOString()
};

const MOCK_FORM: Form = {
  id: 'form-1',
  orgId: 'org-1',
  name: 'Lançamento Solar Residencial',
  slug: 'solar-residencial',
  status: FormStatus.ACTIVE,
  theme: {
    primaryColor: '#2563eb',
    logoUrl: 'https://picsum.photos/200/50'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Apresentação',
      layout: '1-column',
      columns: [
        {
          id: 'col-1',
          blocks: [
            { id: 'b1', type: 'heading', settings: { label: 'Conheça o Solar Residencial', level: 'h1' } },
            { id: 'b2', type: 'image', settings: { src: 'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&w=800&q=80' } },
            { id: 'b3', type: 'text', settings: { label: 'O melhor empreendimento da região com condições exclusivas de lançamento.' } }
          ]
        }
      ]
    },
    {
      id: 'step-2',
      title: 'Dados para Contato',
      layout: '1-column',
      columns: [
        {
          id: 'col-2',
          blocks: [
            { id: 'b4', type: 'short_text', settings: { label: 'Seu Nome', required: true, mappingKey: 'name' } },
            { id: 'b5', type: 'email', settings: { label: 'Seu E-mail', required: true, mappingKey: 'email' } },
            { id: 'b6', type: 'standard_contact', settings: { label: 'WhatsApp', required: true, mappingKey: 'phone' } }
          ]
        }
      ]
    }
  ],
  settings: {
    webhookIds: [],
    pixelId: '123456789',
    gtmId: 'GTM-XXXXXX'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

class StorageService {
  private getStorage<T>(key: string): T[] {
    const data = localStorage.getItem(`lp_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private setStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(`lp_${key}`, JSON.stringify(data));
  }

  constructor() {
    if (!localStorage.getItem('lp_initialized')) {
      this.setStorage('orgs', [MOCK_ORG]);
      this.setStorage('users', [MOCK_USER]);
      this.setStorage('forms', [MOCK_FORM]);
      localStorage.setItem('lp_initialized', 'true');
    }
  }

  getOrgs() { return this.getStorage<Organization>('orgs'); }
  getUsers() { return this.getStorage<User>('users'); }
  getForms() { return this.getStorage<Form>('forms'); }
  getFormBySlug(orgSlug: string, formSlug: string) {
    return this.getForms().find(f => f.slug === formSlug);
  }
  getLeads() { return this.getStorage<Lead>('leads'); }
  getLeadsByForm(formId: string) {
    return this.getLeads().filter(l => l.formId === formId);
  }
  getIntegrations() { return this.getStorage<Integration>('integrations'); }

  saveLead(lead: Lead) {
    const leads = this.getLeads();
    leads.unshift(lead); // Novos no topo
    this.setStorage('leads', leads);
  }

  saveForm(form: Form) {
    const forms = this.getForms();
    const index = forms.findIndex(f => f.id === form.id);
    if (index > -1) forms[index] = form;
    else forms.push(form);
    this.setStorage('forms', forms);
  }

  saveIntegration(integration: Integration) {
    const integrations = this.getIntegrations();
    const index = integrations.findIndex(i => i.id === integration.id);
    if (index > -1) integrations[index] = integration;
    else integrations.push(integration);
    this.setStorage('integrations', integrations);
  }

  deleteIntegration(id: string) {
    const integrations = this.getIntegrations().filter(i => i.id !== id);
    this.setStorage('integrations', integrations);
  }
}

export const db = new StorageService();
