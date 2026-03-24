import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', whatsapp: '', email: '', description: '', serviceType: 'Asesorías Jurídicas para Personas Naturales', status: 'Nuevo', entryDate: new Date().toISOString().split('T')[0], notes: ''
  });

  const loadData = async () => {
    const reqs = await requestsDAO.getAll(user);
    setRequests(reqs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (req?: any) => {
    if (req) {
      setEditingId(req.id);
      setFormData(req);
    } else {
      setEditingId(null);
      setFormData({ firstName: '', lastName: '', whatsapp: '', email: '', description: '', serviceType: 'Asesorías Jurídicas para Personas Naturales', status: 'Nuevo', entryDate: new Date().toISOString().split('T')[0], notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Desea eliminar esta solicitud del registro comercial?')) {
      await requestsDAO.delete(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await requestsDAO.update(editingId, formData);
    } else {
      await requestsDAO.create(formData, user);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleConvertToClient = async (id: string) => {
    if (confirm('¿Desea convertir esta solicitud en un Cliente oficial de la firma?')) {
      try {
        const clientId = await requestsDAO.convertToClient(id, user);
        navigate(`/clients/${clientId}`);
      } catch (err) {
        alert('Error al convertir: ' + err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes Web y Leads Comerciales</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Registro de requerimientos entrantes por sitio web y canal de WhatsApp.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Registrar Solicitud
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)' }}>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Contacto / WhatsApp</th>
              <th style={{ padding: '1rem' }}>Línea de Servicio</th>
              <th style={{ padding: '1rem' }}>Descripción / Notas</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{req.firstName} {req.lastName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                    <MessageCircle size={12} color="#25D366" /> {req.whatsapp || 'No indica'}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>{req.serviceType}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.description}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ingreso: {req.entryDate}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: req.status === 'Atendido' ? '#dcfce7' : req.status === 'En Gestión' ? '#fef3c7' : '#fee2e2', color: req.status === 'Atendido' ? '#166534' : req.status === 'En Gestión' ? '#b45309' : '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>{req.status}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {req.status !== 'Contratado' && (
                    <button 
                      onClick={() => handleConvertToClient(req.id)} 
                      title="Convertir a Cliente"
                      style={{ background: 'transparent', color: 'var(--status-success)', marginRight: '0.5rem', padding: '0.25rem' }}
                    >
                      <UserPlus size={16}/>
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(req)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem', padding: '0.25rem' }}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(req.id)} style={{ background: 'transparent', color: 'var(--status-danger)', padding: '0.25rem' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay prospectos ni solicitudes web registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Gestionar Prospecto' : 'Registrar Entrante'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Nombres</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Apellidos</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Número WhatsApp / Celular</label>
                  <input type="text" required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fecha Ingreso</label>
                  <input type="date" required value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Tipo de Servicio Planteado</label>
                <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} style={{ width: '100%' }}>
                  <option value="Asesorías Jurídicas para Personas Naturales">Asesorías Jurídicas para Personas Naturales</option>
                  <option value="Reclamaciones de Indemnizaciones SOAT">Reclamaciones de Indemnizaciones SOAT</option>
                  <option value="Asesorías Jurídicas para Empresas">Asesorías Jurídicas para Empresas</option>
                  <option value="Solicitud de Entrega de Vehículo por Accidente de Tránsito">Solicitud de Entrega de Vehículo por Accidente de Tránsito</option>
                  <option value="Derechos de Petición y Acciones de Tutela">Derechos de Petición y Acciones de Tutela</option>
                  <option value="Conciliaciones en Derecho">Conciliaciones en Derecho</option>
                  <option value="Otro">Otro (No especificado / Sin perfilar)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Descripción / Resumen del Caso (Enviado por el prospecto)</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Observaciones Internas del Asesor</label>
                <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Estado de Atención Comercial</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%' }}>
                  <option value="Nuevo">Nuevo / Sin Contactar</option>
                  <option value="En Gestión">En Gestión (Respondió WhatsApp)</option>
                  <option value="Cita Programada">Cita Programada</option>
                  <option value="Convertido a Cliente">Convertido a Cliente (Exitoso)</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Novedad</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
