import { NavLink } from 'react-router-dom';
import { 
  Building2, Users, 
  FileText, Home, FolderOpen, Receipt, ClipboardList, Plus, Eye, ScanText, Briefcase, FileSpreadsheet, Box
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Sidebar = () => {
  const { branding } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={branding?.logo || "/src/assets/logo_chingate.png"} alt="Chingaté Abogados" style={{ width: '100%', height: 'auto', maxHeight: '60px', objectFit: 'contain' }} />
      </div>
      <nav className="sidebar-nav">
      
        <div className="nav-title" style={{ marginTop: '0.5rem' }}>Inicio</div>
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Home size={20} /> Panel Principal
        </NavLink>
        
        <div className="nav-title" style={{ marginTop: '1.5rem' }}>Casos y Clientes</div>
        <NavLink to="/clients/new" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Plus size={20} /> Nuevo Cliente
        </NavLink>
        <NavLink to="/clients" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={20} /> Directorio de Clientes
        </NavLink>
        <NavLink to="/matters" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Briefcase size={20} /> Consulta de Asuntos
        </NavLink>

        <div className="nav-title" style={{ marginTop: '1.5rem', color: 'rgba(200,168,75,0.9)' }}>Herramientas 360</div>
        <NavLink to="/matters/360" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Eye size={20} /> Orical 360
        </NavLink>
        <NavLink to="/vimana360" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <ScanText size={20} /> Vimana 360
        </NavLink>

        <div className="nav-title" style={{ marginTop: '1.5rem' }}>Finanzas y Facturación</div>
        <NavLink to="/invoices" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Receipt size={20} /> Facturación
        </NavLink>
        <NavLink to="/financial-reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FileSpreadsheet size={20} /> Informe Financiero
        </NavLink>
        <NavLink to="/financial-certificates" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FileText size={20} /> Certificados Financieros
        </NavLink>

        <div className="nav-title" style={{ marginTop: '1.5rem' }}>Documentos y Reportes</div>
        <NavLink to="/documents" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FolderOpen size={20} /> Gestión Documental
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <ClipboardList size={20} /> Generación de Informes
        </NavLink>
        <NavLink to="/certificates" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FileText size={20} /> Generación de Certificados
        </NavLink>

        <div className="nav-title" style={{ marginTop: '1.5rem' }}>Administración</div>
        <NavLink to="/inventory" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Box size={20} /> Inventario Asignado
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Building2 size={20} /> Configuración / Admin
        </NavLink>

      </nav>
    </aside>
  );
};

export default Sidebar;
