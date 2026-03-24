import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Clients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', 
    document: '', 
    type: 'Persona Natural', 
    phone: '', 
    email: '', 
    address: '', 
    city: '', 
    status: 'Activo',
    legalRepresentative: '',
    registrationNumber: '', // Matrícula Mercantil
    ownerName: '', // Propietario for Establishment
  });

  useEffect(() => {
    const unsubscribe = clientsDAO.subscribe(setClients, user);
    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (client?: any) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        ...formData,
        ...client
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', document: '', type: 'Persona Natural', phone: '', email: '', 
        address: '', city: '', status: 'Activo',
        legalRepresentative: '', registrationNumber: '', ownerName: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      await clientsDAO.delete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await clientsDAO.update(editingId, formData);
    } else {
      await clientsDAO.create(formData, user);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Directorio de Clientes</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nuevo Cliente
        </button>
      </div>
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Radicado</th>
              <th style={{ padding: '1rem' }}>Nombre / Razón Social</th>
              <th style={{ padding: '1rem' }}>Documento / NIT</th>
              <th style={{ padding: '1rem' }}>Tipo</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary-color)' }}>{c.internalId || '—'}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email || c.phone}</div>
                </td>
                <td style={{ padding: '1rem' }}>{c.document}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.type}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: c.status === 'Activo' ? '#dcfce7' : '#f1f5f9', color: c.status === 'Activo' ? '#166534' : 'var(--text-muted)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{c.status}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => navigate(`/clients/${c.id}`)} className="btn-secondary" style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Eye size={16}/> Ver Cliente
                  </button>
                  <button onClick={() => handleOpenModal(c)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem', padding: '0.25rem' }}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'transparent', color: 'var(--status-danger)', padding: '0.25rem' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay clientes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Tipo de Persona / Entidad</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  <option value="Persona Natural">Persona Natural</option>
                  <option value="Persona Jurídica">Persona Jurídica / Empresa</option>
                  <option value="Establecimiento de Comercio">Establecimiento de Comercio</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {formData.type === 'Persona Jurídica' ? 'Razon Social' : formData.type === 'Establecimiento de Comercio' ? 'Nombre Comercial' : 'Nombre Completo'}
                  </label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {formData.type === 'Persona Jurídica' ? 'NIT' : 'Número de Cédula'}
                  </label>
                  <input type="text" required value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                </div>
              </div>

              {formData.type === 'Persona Jurídica' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Representante Legal</label>
                  <input type="text" value={formData.legalRepresentative} onChange={e => setFormData({...formData, legalRepresentative: e.target.value})} />
                </div>
              )}

              {formData.type === 'Establecimiento de Comercio' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Matrícula Mercantil</label>
                    <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Propietario / Responsable</label>
                    <input type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Teléfono de Contacto</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Correo Electrónico</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Dirección</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Ciudad</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
