
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_USER = 'ORG_USER'
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED'
}

export type BlockType =
  | 'heading' | 'text' | 'image' | 'video' | 'button' | 'spacer'
  | 'short_text' | 'long_text' | 'single_choice' | 'multi_choice'
  | 'yes_no' | 'number' | 'date' | 'file' | 'standard_contact' | 'email';

export interface BlockSettings {
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  autoAdvance?: boolean;
  src?: string;
  level?: 'h1' | 'h2' | 'h3';
  ctaUrl?: string;
  mappingKey?: string;
  mask?: string;
}

export interface FormBlock {
  id: string;
  type: BlockType;
  settings: BlockSettings;
}

export interface Column {
  id: string;
  blocks: FormBlock[];
}

export type StepLayout = '1-column' | '2-columns' | '3-columns';

export interface FormStep {
  id: string;
  title: string;
  layout: StepLayout;
  columns: Column[];
  type?: 'intro' | 'questions' | 'privacy' | 'thank_you';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  password?: string; // Simples para MVP, idealmente via Firebase Auth
  name: string;
  role: Role;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  createdAt: string;
}

export interface Form {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  status: FormStatus;
  theme: {
    primaryColor: string;
    logoUrl?: string;
  };
  steps: FormStep[];
  settings: {
    redirectUrl?: string;
    webhookIds: string[];
    pixelId?: string;
    gtmId?: string;
  };
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  orgId: string;
  formId: string;
  data: Record<string, any>;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'DISCARDED';
  createdAt: string;
}

export interface Integration {
  id: string;
  orgId: string;
  name: string;
  type: 'WEBHOOK';
  url: string;
  isActive: boolean;
  createdAt: string;
}

export type PageTemplateId = 'luxury' | 'launch' | 'ready';

export interface PageLead {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  status: FormStatus;
  templateId: PageTemplateId;
  primaryColor?: string;
  property: {
    badge: string;
    title: string;
    subtitle: string;
    price: string;
    priceNote: string;
    location: string;
    heroImage: string;
    videoUrl?: string;
    description: string;
    bedrooms: string;
    suites: string;
    parking: string;
    area: string;
    features: string[];
    gallery: string[];
  };
  broker: {
    name: string;
    creci: string;
    phone: string;
    email?: string;
    photoUrl?: string;
    bio?: string;
  };
  conversion: {
    mode: 'native_form' | 'linked_form';
    linkedFormId?: string;
    ctaText: string;
    formTitle: string;
    formSubtitle: string;
    showWhatsappFloating: boolean;
    whatsappMessage?: string;
  };
  settings: {
    redirectUrl?: string;
    webhookIds: string[];
    pixelId?: string;
    gtmId?: string;
  };
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

