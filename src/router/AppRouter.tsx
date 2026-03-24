import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Recovery from '../pages/Recovery';
import Dashboard from '../pages/Dashboard';
import Layout from '../components/Layout/Layout';

// Core Business Modules
import Clients from '../pages/Clients';
import ClientDetail from '../pages/ClientDetail';
import NewClient from '../pages/NewClient';
import Matters from '../pages/Matters';
import MatterDetail from '../pages/MatterDetail';
import Requests from '../pages/Requests';

// Operational & Admin Modules
import Agenda from '../pages/Agenda';
import Invoices from '../pages/Invoices';
import Payments from '../pages/Payments';
import Documents from '../pages/Documents';
import Notes from '../pages/Notes';
import Inventory from '../pages/Inventory';
import Settings from '../pages/Settings';
import Orical360Search from '../pages/Orical360Search';
// Reports & Certificates
import Reports from '../pages/Reports';
import Certificates from '../pages/Certificates';
import FinancialReports from '../pages/FinancialReports';
import FinancialCertificates from '../pages/FinancialCertificates';

// Vimana 360 — OCR Module
import Vimana360 from '../pages/Vimana360';
import Profile from '../pages/Profile';

import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recovery" element={<Recovery />} />
      
      {/* Protected Layout Routes */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* 2. Nuevo Cliente */}
        <Route path="clients/new" element={<NewClient />} />
        
        {/* 3. Consulta de Asuntos */}
        <Route path="matters" element={<Matters />} />
        
        {/* 4. Consulta de Clientes */}
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        
        {/* 5. Generación de Informes */}
        <Route path="reports" element={<Reports />} />
        
        {/* 6. Generación de Certificados */}
        <Route path="certificates" element={<Certificates />} />
        
        {/* 7. Informe Financiero */}
        <Route path="financial-reports" element={<FinancialReports />} />
        
        {/* 8. Certificados Financieros */}
        <Route path="financial-certificates" element={<FinancialCertificates />} />
        
        {/* 9. Gestión Documental */}
        <Route path="documents" element={<Documents />} />
        
        {/* 10. Inventario Asignado */}
        <Route path="inventory" element={<Inventory />} />
        
        {/* 11. Orical 360 */}
        <Route path="matters/:id" element={<MatterDetail />} />
        <Route path="matters/360" element={<Orical360Search />} />
        
        {/* 12. Configuración / Administración */}
        <Route path="settings" element={<Settings />} />
        
        {/* Other routes */}
        <Route path="payments" element={<Payments />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="notes" element={<Notes />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="requests" element={<Requests />} />

        {/* Redirect unknown routes to dashboard */}
        <Route path="vimana360" element={<Vimana360 />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
