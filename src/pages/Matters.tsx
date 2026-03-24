import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mattersDAO, clientsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Matters = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matters, setMatters] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'Asesorías Jurídicas para Personas Naturales', description: '', responsible: '', status: 'Abierto', stage: 'Inicial', priority: 'Media', nextDate: '', clientId: ''
  });

  useEffect(() => {
    const unsubscribeMatters = mattersDAO.subscribe(setMatters, user);
    const unsubscribeClients = clientsDAO.subscribe(setClients, user);
    
    return () => {
      unsubscribeMatters();
      unsubscribeClients();
    };
  }, [user]);

  const handleOpenModal = (matter?: any) => {
    if (matter) {
      setEditingId(matter.id);
      setFormData({
        ...formData,
        ...matter
      });
    } else {
      setEditingId(null);
      setFormData({ type: 'Asesorías Jurídicas para Personas Naturales', description: '', responsible: user?.name || '', status: 'Abierto', stage: 'Inicial', priority: 'Media', nextDate: '', clientId: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este asunto?')) {
      await mattersDAO.delete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await mattersDAO.update(editingId, formData);
    } else {
      await mattersDAO.create(formData, user);
    }
    setIsModalOpen(false);
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || id;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orical 360</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/matters/360')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={16} /> Búsqueda por Referencia
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Nuevo Asunto
          </button>
        </div>
      </div>
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Descripción / Tipo</th>
              <th style={{ padding: '1rem' }}>Responsable</th>
              <th style={{ padding: '1rem' }}>Etapa</th>
              <th style={{ padding: '1rem' }}>Cliente</th>
              <th style={{ padding: '1rem' }}>Próx. Vencimiento</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matters.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{m.description}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.type}</div>
                  <span style={{ background: m.status === 'Abierto' ? '#dcfce7' : m.status === 'En Trámite' ? '#fef3c7' : '#f1f5f9', color: m.status === 'Abierto' ? '#166534' : m.status === 'En Trámite' ? '#b45309' : '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>{m.status}</span>
                </td>
                <td style={{ padding: '1rem' }}>{m.responsible}</td>
                <td style={{ padding: '1rem' }}>{m.stage || 'Inicial'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{getClientName(m.clientId)}</span>
                </td>
                <td style={{ padding: '1rem', color: m.nextDate ? 'var(--status-danger)' : 'var(--text-muted)', fontWeight: m.nextDate ? 500 : 400 }}>{m.nextDate || '—'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => navigate(`/matters/${m.id}`)} title="Abrir Expediente" style={{ background: 'transparent', color: 'var(--text-main)', marginRight: '0.5rem', padding: '0.25rem' }}><Eye size={16}/></button>
                  <button onClick={() => handleOpenModal(m)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem', padding: '0.25rem' }}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'transparent', color: 'var(--status-danger)', padding: '0.25rem' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {matters.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay asuntos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Asunto' : 'Nuevo Asunto'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Cliente Asociado</label>
                <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} style={{ width: '100%' }}>
                  <option value="">Seleccione un cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Línea de Servicio / Tipo</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%' }}>
                    <option value="Asesorías Jurídicas para Personas Naturales">Asesorías Jurídicas para Personas Naturales</option>
                    <option value="Reclamaciones de Indemnizaciones SOAT">Reclamaciones de Indemnizaciones SOAT</option>
                    <option value="Asesorías Jurídicas para Empresas">Asesorías Jurídicas para Empresas</option>
                    <option value="Solicitud de Entrega de Vehículo por Accidente de Tránsito">Solicitud de Entrega de Vehículo por Accidente de Tránsito</option>
                    <option value="Derechos de Petición y Acciones de Tutela">Derechos de Petición y Acciones de Tutela</option>
                    <option value="Conciliaciones en Derecho">Conciliaciones en Derecho</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Abierto">Abierto</option>
                    <option value="En Trámite">En Trámite</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Descripción / Radicado</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Responsable (Abogado)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})} 
                    readOnly={user?.role !== 'superadmin'}
                    style={{ backgroundColor: user?.role !== 'superadmin' ? '#f1f5f9' : 'white', cursor: user?.role !== 'superadmin' ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Próx. Vencimiento</label>
                  <input type="date" value={formData.nextDate} onChange={e => setFormData({...formData, nextDate: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matters;
