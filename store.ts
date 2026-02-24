
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
      console.error("Error fetching orgs:", e);
      return [];
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

  async getForms() {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.FORMS));
      return querySnapshot.docs.map(doc => doc.data() as Form);
    } catch (e) {
      console.error("Error fetching forms:", e);
      return [];
    }
  }

  async getFormBySlug(orgSlug: string, formSlug: string) {
    console.log(`Buscando formulário: ${formSlug}`);
    try {
      const q = query(
        collection(firestore, this.FORMS),
        where("slug", "==", formSlug)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Form;
      }
      return null;
    } catch (e) {
      console.error(`Erro ao buscar formulário ${formSlug}:`, e);
      return null;
    }
  }

  async getLeads() {
    try {
      const q = query(
        collection(firestore, this.LEADS),
        orderBy("createdAt", "desc")
      );
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

  async getIntegrations() {
    try {
      const querySnapshot = await getDocs(collection(firestore, this.INTEGRATIONS));
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
}

export const db = new FirebaseStorageService();
