// src/services/seed.ts
import { clientsDAO, mattersDAO, invoicesDAO, eventsDAO } from './db';

const MOCK_CLIENTS = [
  { type: 'Jurídica', name: 'Tech Solutions Inc', document: 'NIT-9008182', phone: '310-555-0192', email: 'contacto@techsolutions.com', address: 'Av Principal #123', city: 'Bogotá', status: 'Activo' },
  { type: 'Natural', name: 'Carlos Mendoza', document: 'CC-10293847', phone: '300-444-1234', email: 'cmendoza@email.com', address: 'Calle 45 #8-12', city: 'Medellín', status: 'Activo' }
];

const MOCK_MATTERS = [
  { type: 'Laboral', description: 'Demanda por despido injustificado', responsible: 'Admin Total', status: 'Abierto', stage: 'Contestación', priority: 'Alta', nextDate: '2024-06-15' },
  { type: 'Corporativo', description: 'Fusión de sociedades comerciales', responsible: 'Admin Total', status: 'En Trámite', stage: 'Revisión Contratos', priority: 'Media', nextDate: '2024-07-01' }
];

export const injectSeedData = async () => {
  try {
    console.log('Inyectando datos semilla...');
    
    // Clients
    for (const client of MOCK_CLIENTS) {
      await clientsDAO.create(client);
    }

    // Matters (we usually would link 'clientId' here after creation)
    for (const matter of MOCK_MATTERS) {
      await mattersDAO.create({ ...matter, clientId: 'MOCK_ID' });
    }

    // Mock Invoices
    await invoicesDAO.create({ number: 'FAC-001', concept: 'Honorarios primera instancia', value: 2500000, emissionDate: '2024-05-01', dueDate: '2024-05-30', status: 'Vencida', clientId: 'MOCK_ID' });
    
    // Mock Events
    await eventsDAO.create({ title: 'Audiencia de Conciliación', date: '2024-06-15', time: '10:00 AM', responsible: 'Admin Total', status: 'Pendiente' });

    console.log('Datos inyectados exitosamente.');
    return true;
  } catch (error) {
    console.error('Error inyectando datos:', error);
    return false;
  }
};
