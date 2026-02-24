
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
    const q = query(
      collection(firestore, this.FORMS),
      where("slug", "==", formSlug)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Form;
    }
    return null;
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
    const q = query(
      collection(firestore, this.LEADS),
      where("formId", "==", formId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Lead);
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

  async saveLead(lead: Lead) {
    await setDoc(doc(firestore, this.LEADS, lead.id), lead);
  }

  async saveForm(form: Form) {
    await setDoc(doc(firestore, this.FORMS, form.id), form);
  }

  async saveIntegration(integration: Integration) {
    await setDoc(doc(firestore, this.INTEGRATIONS, integration.id), integration);
  }

  async deleteIntegration(id: string) {
    await deleteDoc(doc(firestore, this.INTEGRATIONS, id));
  }
}

export const db = new FirebaseStorageService();
