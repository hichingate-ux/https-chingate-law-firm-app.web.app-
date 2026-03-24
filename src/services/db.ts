import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const USE_MOCKS = false; // Desactivado para usar base de datos real en la nube

// Generadores de mocks básicos por colección
const mockStore: Record<string, any[]> = {
  clients: [
    { id: '1', type: 'Jurídica', name: 'Tech Solutions Inc', document: 'NIT-9008182', phone: '310-555-0192', email: 'contacto@techsolutions.com', address: 'Av Principal #123', city: 'Bogotá', status: 'Activo', createdAt: new Date(), ownerUserId: 'admin-123' },
    { id: '2', type: 'Natural', name: 'Carlos Mendoza', document: 'CC-10293847', phone: '300-444-1234', email: 'cmendoza@email.com', address: 'Calle 45 #8-12', city: 'Medellín', status: 'Activo', createdAt: new Date(), ownerUserId: 'user-456', assignedUserIds: ['user-456'] }
  ],
  matters: [
    { id: '1', type: 'Laboral', description: 'Demanda por despido injustificado', responsible: 'Admin Total', status: 'Abierto', stage: 'Contestación', priority: 'Alta', nextDate: '2024-06-15', clientId: '1', ownerUserId: 'admin-123' },
    { id: '2', type: 'Corporativo', description: 'Fusión de sociedades comerciales', responsible: 'Abogado 1', status: 'En Trámite', stage: 'Revisión Contratos', priority: 'Media', nextDate: '2024-07-01', clientId: '1', ownerUserId: 'user-456', assignedUserIds: ['user-456'] }
  ],
  notes: [
    { id: '1', date: '2024-05-15', author: 'Admin Total', title: 'Reunión inicial', content: 'El cliente adjuntó los contratos', status: 'Revisada', referenceId: '1' }
  ],
  documents: [
    { id: '1', name: 'Contrato_Laboral.pdf', type: 'application/pdf', uploadedAt: new Date(), uploadedBy: 'Admin Total', referenceId: '1' }
  ],
  events: [
    { id: '1', title: 'Audiencia de Conciliación', date: '2024-06-15', time: '10:00 AM', responsible: 'Admin Total', status: 'Pendiente', matterId: '1' }
  ],
  invoices: [
    { id: '1', number: 'FAC-001', concept: 'Honorarios primera instancia', value: 2500000, emissionDate: '2024-05-01', dueDate: '2024-05-30', status: 'Vencida', clientId: '1' }
  ],
  payments: [
    { id: '1', invoiceId: '1', value: 500000, date: '2024-05-15', method: 'Transferencia' }
  ],
  inventory: [
    { id: '1', asset: 'MacBook Pro M2', category: 'Equipos', serial: 'C02XV123', location: 'Oficina 1', responsible: 'Admin Total', status: 'Asignado', purchaseDate: '2023-01-10' }
  ],
  users: [
    { id: 'super-admin', name: 'Isaac Chingaté', email: 'hichingate@gmail.com', password: 'Ges.interna.admin.', role: 'superadmin', status: 'Activo' },
    { id: 'admin-123', name: 'Admin Total', email: 'admin@firma.com', password: 'admin123', role: 'superadmin', status: 'Activo' },
    { id: 'user-456', name: 'Abogado 1', email: 'abogado@firma.com', password: 'user123', role: 'abogado_a', status: 'Activo' }
  ],
  configurations: [
    { id: 'main', firmName: 'Firma Legal & Asociados', primaryColor: '#1e3a8a', accentColor: '#f59e0b', address: 'Edificio Central, Of 401', phone: '555-0100' }
  ],
  actions: [],
  internalNotes: []
};

// General DAO generic class
export class BaseDAO<T> {
  collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    // Iniciar localStorage si está vacío para esta colección con los mocks iniciales
    if (USE_MOCKS && mockStore[this.collectionName]) {
      const stored = localStorage.getItem(this.collectionName);
      if (!stored) {
        localStorage.setItem(this.collectionName, JSON.stringify(mockStore[this.collectionName]));
      } else if (this.collectionName === 'users') {
        // Force sync superadmin for development/demo purposes
        const currentUsers = JSON.parse(stored);
        const superAdminFromMock = mockStore.users.find(u => u.role === 'superadmin');
        if (superAdminFromMock) {
          const existingIdx = currentUsers.findIndex((u: any) => u.role === 'superadmin' || u.id === superAdminFromMock.id);
          if (existingIdx !== -1) {
            currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...superAdminFromMock };
          } else {
            currentUsers.push(superAdminFromMock);
          }
          localStorage.setItem('users', JSON.stringify(currentUsers));
        }
      }
    }
  }

  async getAll(user?: any): Promise<T[]> {
    let data: T[] = [];
    if (USE_MOCKS) {
      data = (JSON.parse(localStorage.getItem(this.collectionName) || '[]')) as T[];
    } else {
      const colRef = collection(db, this.collectionName);
      const snapshot = await getDocs(colRef);
      data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as unknown as T));
    }

    // Role-based filtering
    const adminRoles = ['superadmin', 'Administrador', 'admin'];
    const isExcludedCollection = ['users', 'configurations'].includes(this.collectionName);

    if (user && !adminRoles.includes(user.role) && !isExcludedCollection) {
      data = data.filter((item: any) => 
        item.ownerUserId === user.id || 
        (item.assignedUserIds && item.assignedUserIds.includes(user.id))
      );
    }
    return data;
  }

  async getById(id: string): Promise<T | null> {
    if (USE_MOCKS) {
      const currentData = JSON.parse(localStorage.getItem(this.collectionName) || '[]');
      const match = currentData.find((i: any) => i.id === id);
      return match ? (match as unknown as T) : null;
    }
    const docRef = doc(db, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as unknown as T;
    }
    return null;
  }

  // Real-time listener for the entire collection (or filtered by user)
  subscribe(callback: (data: T[]) => void, user?: any): () => void {
    if (USE_MOCKS) {
      // Simple interval for mocks simulation
      const interval = setInterval(() => {
        this.getAll(user).then(callback);
      }, 2000);
      return () => clearInterval(interval);
    }

    const colRef = collection(db, this.collectionName);
    
    const unsubscribe = onSnapshot(colRef, (snapshot: any) => {
      let data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as unknown as T));
      
      // Role-based filtering (same logic as getAll)
      const adminRoles = ['superadmin', 'Administrador', 'admin'];
      const isExcludedCollection = ['users', 'configurations'].includes(this.collectionName);

      if (user && !adminRoles.includes(user.role) && !isExcludedCollection) {
        data = data.filter((item: any) => 
          item.ownerUserId === user.id || 
          (item.assignedUserIds && item.assignedUserIds.includes(user.id))
        );
      }
      callback(data);
    });

    return unsubscribe;
  }

  // Real-time listener for a single document by ID
  subscribeToId(id: string, callback: (data: T | null) => void): () => void {
    if (USE_MOCKS) {
      const interval = setInterval(() => {
        this.getById(id).then(callback);
      }, 2000);
      return () => clearInterval(interval);
    }

    const docRef = doc(db, this.collectionName, id);
    const unsubscribe = onSnapshot(docRef, (snapshot: any) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as unknown as T);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  async create(data: Omit<T, 'id'>, user?: any): Promise<string> {
    const enrichedData = {
      ...data,
      createdBy: user?.id || 'system',
      ownerUserId: user?.id || 'system',
      assignedUserIds: [user?.id].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (USE_MOCKS) {
      const currentData = JSON.parse(localStorage.getItem(this.collectionName) || '[]');
      const newId = Date.now().toString();
      const newItem = { id: newId, ...enrichedData };
      currentData.push(newItem);
      localStorage.setItem(this.collectionName, JSON.stringify(currentData));
      return newId;
    }
    const colRef = collection(db, this.collectionName);
    const docRef = await addDoc(colRef, enrichedData);
    return docRef.id;
  }

  protected async getNextInternalId(prefix: string): Promise<string> {
    const all = await this.getAll();
    const numbers = all
      .map((item: any) => item.internalId)
      .filter((id: string) => id && id.startsWith(`${prefix}-`))
      .map((id: string) => {
        const parts = id.split('-');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
      })
      .filter((n: number) => !isNaN(n))
      .sort((a, b) => b - a);
    
    const nextNum = (numbers[0] || 0) + 1;
    return `${prefix}-${nextNum.toString().padStart(6, '0')}`;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const enrichedData = { ...data, updatedAt: new Date().toISOString() };
    if (USE_MOCKS) {
      const currentData = JSON.parse(localStorage.getItem(this.collectionName) || '[]');
      const idx = currentData.findIndex((i: any) => i.id === id);
      if (idx !== -1) {
        currentData[idx] = { ...currentData[idx], ...enrichedData };
        localStorage.setItem(this.collectionName, JSON.stringify(currentData));
      }
      return;
    }
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, enrichedData as any);
  }

  async delete(id: string): Promise<void> {
    if (USE_MOCKS) {
      let currentData = JSON.parse(localStorage.getItem(this.collectionName) || '[]');
      currentData = currentData.filter((i: any) => i.id !== id);
      localStorage.setItem(this.collectionName, JSON.stringify(currentData));
      return;
    }
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}

// DAOs específicos con lógica de negocio
class InvoicesDAO extends BaseDAO<any> {
  async getNextSerialNumber(): Promise<string> {
    const all = await this.getAll();
    const serials = all
      .map((i: any) => i.number)
      .filter((n: string) => n && n.startsWith('CHA-'))
      .map((n: string) => parseInt(n.split('-')[1]))
      .sort((a, b) => b - a);
    
    const nextNum = (serials[0] || 0) + 1;
    return `CHA-${nextNum.toString().padStart(6, '0')}`;
  }
}

class RequestsDAO extends BaseDAO<any> {
  async convertToClient(requestId: string, user?: any): Promise<string> {
    const request = await this.getById(requestId);
    if (!request) throw new Error('Solicitud no encontrada');
    
    // Crear el cliente
    const clientId = await clientsDAO.create({
      type: 'Natural', // Por defecto, se puede ajustar luego
      name: `${request.firstName} ${request.lastName}`,
      document: request.document || '',
      phone: request.whatsapp || request.phone || '',
      email: request.email || '',
      address: request.address || '',
      city: request.city || '',
      status: 'Activo',
      observaciones: `Convertido desde solicitud #${requestId}. Caso original: ${request.description}`,
      responsible: request.responsible || user?.name || 'Por asignar'
    }, user);

    // Actualizar estado de la solicitud
    await this.update(requestId, { status: 'Contratado' });
    
    return clientId;
  }
}

class ClientsDAO extends BaseDAO<any> {
  async create(data: any, user?: any): Promise<string> {
    const internalId = await this.getNextInternalId('CLI');
    return super.create({ ...data, internalId }, user);
  }
}

class MattersDAO extends BaseDAO<any> {
  async create(data: any, user?: any): Promise<string> {
    const internalId = await this.getNextInternalId('MAT');
    return super.create({ ...data, internalId }, user);
  }
}

// Instantiate Collections DAOs
export const clientsDAO = new ClientsDAO('clients');
export const mattersDAO = new MattersDAO('matters');
export const notesDAO = new BaseDAO('notes'); // Shared legacy / catch-all notes
export const actionsDAO = new BaseDAO('actions'); // "Actuaciones"
export const internalNotesDAO = new BaseDAO('internalNotes'); // "Notas Internas"
export const documentsDAO = new BaseDAO('documents');
export const eventsDAO = new BaseDAO('events');
export const invoicesDAO = new InvoicesDAO('invoices');
export const paymentsDAO = new BaseDAO('payments');
export const inventoryDAO = new BaseDAO('inventory');
export const usersDAO = new BaseDAO('users');
export const configurationsDAO = new BaseDAO('configurations');
export const requestsDAO = new RequestsDAO('requests');

