
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  query,
  where,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db as firestore } from './firebase';
import { Organization, User, Form, Lead, Integration, Role, FormStatus, PageLead } from './types';

class FirebaseStorageService {
  // Collections
  private readonly ORGS = 'organizations';
  private readonly USERS = 'users';
  private readonly FORMS = 'forms';
  private readonly PAGES = 'pages';
  private readonly LEADS = 'leads';
  private readonly INTEGRATIONS = 'integrations';

  async getOrgs() {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.ORGS));
      return querySnapshot.docs.map(doc => doc.data() as Organization);
    } catch (e) {
      console.error("Error fetching organizations:", e);
      return [];
    }
  }

  async getUserById(id: string) {
    try {
      const snap = await getDoc(doc(firestore, this.USERS, id));
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    } catch (e) {
      console.error("Error fetching user by id:", e);
      return null;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const trimmed = email.trim();
      const q = query(collection(firestore, this.USERS), where("email", "==", trimmed));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }
      const lower = trimmed.toLowerCase();
      if (lower !== trimmed) {
        const q2 = query(collection(firestore, this.USERS), where("email", "==", lower));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          return snap2.docs[0].data() as User;
        }
      }
      return null;
    } catch (e) {
      console.error("Error fetching user by email:", e);
      return null;
    }
  }

  async getUsers() {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.USERS));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (e) {
      console.error("Error fetching users:", e);
      return [];
    }
  }

  async getForms(orgId?: string, userEmail?: string, isGlobal: boolean = false) {
    try {
      const formsRef = collection(firestore, this.FORMS);
      let forms: Form[] = [];

      // Fetch forms by orgId
      if (isGlobal) {
        const querySnapshot = await getDocs(formsRef);
        forms = querySnapshot.docs.map(doc => doc.data() as Form);
      } else if (orgId) {
        const qOrg = query(formsRef, where("orgId", "==", orgId));
        const orgSnapshot = await getDocs(qOrg);
        forms = orgSnapshot.docs.map(doc => doc.data() as Form);
      }

      // If userEmail is provided, also fetch forms shared with this email
      if (userEmail) {
        const qShared = query(formsRef, where("sharedWith", "array-contains", userEmail));
        const sharedSnapshot = await getDocs(qShared);
        const sharedForms = sharedSnapshot.docs.map(doc => doc.data() as Form);

        // Combine and remove duplicates (by ID)
        const combined = [...forms, ...sharedForms];
        const unique = Array.from(new Map(combined.map(f => [f.id, f])).values());
        return unique;
      }

      return forms;
    } catch (e) {
      console.error("Error fetching forms:", e);
      return [];
    }
  }

  async shareForm(formId: string, email: string) {
    try {
      const formRef = doc(firestore, this.FORMS, formId);
      const formDoc = await getDoc(formRef);
      if (formDoc.exists()) {
        const formData = formDoc.data() as Form;
        const sharedWith = formData.sharedWith || [];
        if (!sharedWith.includes(email)) {
          await setDoc(formRef, { ...formData, sharedWith: [...sharedWith, email] }, { merge: true });
        }
      }
    } catch (e) {
      console.error("Error sharing form:", e);
      throw e;
    }
  }

  async getFormBySlug(orgSlug: string, formSlug: string) {
    console.log(`Buscando formulário: ${formSlug} na org: ${orgSlug}`);
    try {
      const q = query(
        collection(firestore, this.FORMS),
        where("slug", "==", formSlug)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const form = querySnapshot.docs[0].data() as Form;
        // Opcional: validar orgSlug se necessário
        return form;
      }
      return null;
    } catch (e) {
      console.error(`Erro ao buscar formulário ${formSlug}:`, e);
      return null;
    }
  }

  async getLeads(orgId?: string, userEmail?: string, isGlobal: boolean = false) {
    try {
      let leads: Lead[] = [];
      const leadsRef = collection(firestore, this.LEADS);

      // Fetch leads by orgId
      if (isGlobal) {
        const querySnapshot = await getDocs(collection(firestore, this.LEADS));
        leads = querySnapshot.docs.map(doc => doc.data() as Lead);
      } else if (orgId) {
        const qOrg = query(leadsRef, where("orgId", "==", orgId));
        const orgSnapshot = await getDocs(qOrg);
        leads = orgSnapshot.docs.map(doc => doc.data() as Lead);
      }

      // Sort in memory to avoid Firestore index requirements
      leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // If userEmail is provided, also fetch leads for shared forms
      if (userEmail) {
        // First get shared forms
        const sharedForms = await this.getForms(undefined, userEmail, isGlobal);
        const sharedOnly = sharedForms.filter(f => f.orgId !== orgId);

        if (sharedOnly.length > 0) {
          // Fetch leads for each shared form (handling Firestore's limitations)
          for (const form of sharedOnly) {
            const formLeads = await this.getLeadsByForm(form.id);
            leads = [...leads, ...formLeads];
          }

          // Re-sort and remove potential duplicates
          leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const unique = Array.from(new Map(leads.map(l => [l.id, l])).values());
          return unique;
        }
      }

      return leads;
    } catch (e) {
      console.error("Error fetching leads:", e);
      return [];
    }
  }

  async getLeadsByForm(formId: string) {
    console.log(`Buscando leads do formulário: ${formId}`);
    try {
      const q = query(
        collection(firestore, this.LEADS),
        where("formId", "==", formId)
      );
      const querySnapshot = await getDocs(q);
      const leads = querySnapshot.docs.map(doc => doc.data() as Lead);
      return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error(`Erro ao buscar leads do form ${formId}:`, e);
      return [];
    }
  }

  async getIntegrations(orgId?: string, isGlobal: boolean = false) {
    try {
      console.log(`[Store] Buscando integrações para orgId: ${orgId}${isGlobal ? ' (Global)' : ''}`);
      let q = query(collection(firestore, this.INTEGRATIONS));
      if (isGlobal) {
        // Fetch all
      } else if (orgId) {
        q = query(q, where("orgId", "==", orgId));
      } else {
        console.warn('[Store] getIntegrations chamado sem orgId e sem flag isGlobal');
        return []; // Security return
      }
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => doc.data() as Integration);
      console.log(`[Store] Encontradas ${results.length} integrações`);
      return results;
    } catch (e) {
      console.error("Error fetching integrations:", e);
      return [];
    }
  }


  private sanitize(data: any): any {
    const clean: any = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value === undefined) return;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = this.sanitize(value);
      } else if (Array.isArray(value)) {
        clean[key] = value.map(item => (typeof item === 'object' && item !== null) ? this.sanitize(item) : item);
      } else {
        clean[key] = value;
      }
    });
    return clean;
  }

  async saveUser(user: User) {
    try {
      await setDoc(doc(firestore, this.USERS, user.id), this.sanitize(user));
    } catch (e) {
      console.error("Error saving user:", e);
      throw e;
    }
  }

  async saveOrg(org: Organization) {
    try {
      await setDoc(doc(firestore, this.ORGS, org.id), this.sanitize(org));
    } catch (e) {
      console.error("Error saving org:", e);
      throw e;
    }
  }

  async saveLead(lead: Lead) {
    try {
      await setDoc(doc(firestore, this.LEADS, lead.id), this.sanitize(lead));
    } catch (e) {
      console.error("Error saving lead:", e);
      throw e;
    }
  }

  async saveForm(form: Form) {
    try {
      await setDoc(doc(firestore, this.FORMS, form.id), this.sanitize(form));
    } catch (e) {
      console.error("Error saving form:", e);
      throw e;
    }
  }

  async saveIntegration(integration: Integration) {
    try {
      await setDoc(doc(firestore, this.INTEGRATIONS, integration.id), this.sanitize(integration));
    } catch (e) {
      console.error("Error saving integration:", e);
      throw e;
    }
  }

  async deleteIntegration(id: string) {
    try {
      await deleteDoc(doc(firestore, this.INTEGRATIONS, id));
    } catch (e) {
      console.error("Error deleting integration:", e);
      throw e;
    }
  }

  async deleteForm(id: string) {
    try {
      await deleteDoc(doc(firestore, this.FORMS, id));
    } catch (e) {
      console.error("Error deleting form:", e);
      throw e;
    }
  }

  async deleteLead(id: string) {
    try {
      await deleteDoc(doc(firestore, this.LEADS, id));
    } catch (e) {
      console.error("Error deleting lead:", e);
      throw e;
    }
  }

  async getPages(orgId?: string, userEmail?: string, isGlobal: boolean = false) {
    try {
      const pagesRef = collection(firestore, this.PAGES);
      let pages: PageLead[] = [];

      if (isGlobal) {
        const querySnapshot = await getDocs(pagesRef);
        pages = querySnapshot.docs.map(doc => doc.data() as PageLead);
      } else if (orgId) {
        const qOrg = query(pagesRef, where("orgId", "==", orgId));
        const orgSnapshot = await getDocs(qOrg);
        pages = orgSnapshot.docs.map(doc => doc.data() as PageLead);
      }

      if (userEmail) {
        const qShared = query(pagesRef, where("sharedWith", "array-contains", userEmail));
        const sharedSnapshot = await getDocs(qShared);
        const sharedPages = sharedSnapshot.docs.map(doc => doc.data() as PageLead);

        const combined = [...pages, ...sharedPages];
        const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
        return unique;
      }

      return pages;
    } catch (e) {
      console.error("Error fetching pages:", e);
      return [];
    }
  }

  async sharePage(pageId: string, email: string) {
    try {
      const pageRef = doc(firestore, this.PAGES, pageId);
      const pageDoc = await getDoc(pageRef);
      if (pageDoc.exists()) {
        const pageData = pageDoc.data() as PageLead;
        const sharedWith = pageData.sharedWith || [];
        if (!sharedWith.includes(email)) {
          await setDoc(pageRef, { ...pageData, sharedWith: [...sharedWith, email] }, { merge: true });
        }
      }
    } catch (e) {
      console.error("Error sharing page:", e);
      throw e;
    }
  }

  async getPageBySlug(orgSlug: string, pageSlug: string) {
    console.log(`Buscando landing page: ${pageSlug} na org: ${orgSlug}`);
    try {
      const q = query(
        collection(firestore, this.PAGES),
        where("slug", "==", pageSlug)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as PageLead;
      }
      return null;
    } catch (e) {
      console.error(`Erro ao buscar landing page ${pageSlug}:`, e);
      return null;
    }
  }

  async savePage(page: PageLead) {
    try {
      await setDoc(doc(firestore, this.PAGES, page.id), this.sanitize(page));
    } catch (e) {
      console.error("Error saving page:", e);
      throw e;
    }
  }

  async deletePage(id: string) {
    try {
      await deleteDoc(doc(firestore, this.PAGES, id));
    } catch (e) {
      console.error("Error deleting page:", e);
      throw e;
    }
  }
}

export const db = new FirebaseStorageService();

