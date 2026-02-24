
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
import { Organization, User, Form, Lead, Integration, Role, FormStatus } from './types';

class FirebaseStorageService {
  // Collections
  private readonly ORGS = 'organizations';
  private readonly USERS = 'users';
  private readonly FORMS = 'forms';
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

  async getUserByEmail(email: string) {
    try {
      const q = query(collection(firestore, this.USERS), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
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

  async getForms(orgId?: string, userEmail?: string) {
    try {
      const formsRef = collection(firestore, this.FORMS);
      let forms: Form[] = [];

      // Fetch forms by orgId
      if (orgId && orgId !== 'org-admin') {
        const qOrg = query(formsRef, where("orgId", "==", orgId));
        const orgSnapshot = await getDocs(qOrg);
        forms = orgSnapshot.docs.map(doc => doc.data() as Form);
      } else {
        const querySnapshot = await getDocs(formsRef);
        forms = querySnapshot.docs.map(doc => doc.data() as Form);
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

  async getLeads(orgId?: string) {
    try {
      let q = query(collection(firestore, this.LEADS), orderBy("createdAt", "desc"));
      if (orgId && orgId !== 'org-admin') {
        q = query(collection(firestore, this.LEADS), where("orgId", "==", orgId), orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Lead);
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
        where("formId", "==", formId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Lead);
    } catch (e) {
      console.error(`Erro ao buscar leads do form ${formId}:`, e);
      return [];
    }
  }

  async getIntegrations(orgId?: string) {
    try {
      let q = query(collection(firestore, this.INTEGRATIONS));
      if (orgId && orgId !== 'org-admin') {
        q = query(q, where("orgId", "==", orgId));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Integration);
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
}

export const db = new FirebaseStorageService();
