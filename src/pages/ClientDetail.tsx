import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Briefcase, Plus, 
  ChevronLeft, Calendar, X, History, Lock,
  Shield
} from 'lucide-react';
import { clientsDAO, mattersDAO, actionsDAO, internalNotesDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [client, setClient] = useState<any>(null);
  const [matters, setMatters] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matters' | 'actions' | 'notes'>('matters');
  const [isMatterModalOpen, setIsMatterModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Asesorías Jurídicas para Personas Naturales', 
    description: '', 
    responsible: user?.name || '', 
    status: 'Abierto', 
    stage: 'Inicial', 
    priority: 'Media', 
    nextDate: '', 
    clientId: id || ''
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    
    const unsubClient = clientsDAO.subscribeToId(id, (data) => {
      setClient(data);
      setLoading(false);
    });

    const unsubMatters = mattersDAO.subscribe((allMatters) => {
      setMatters(allMatters.filter(m => m.clientId === id));
    }, user);

    const unsubActions = actionsDAO.subscribe((allActions: any[]) => {
      setActions(allActions.filter(a => a.clientId === id));
    }, user);

    const unsubNotes = internalNotesDAO.subscribe((allNotes: any[]) => {
      setInternalNotes(allNotes.filter(n => n.clientId === id));
    }, user);

    return () => {
      unsubClient();
      unsubMatters();
      unsubActions();
      unsubNotes();
    };
  }, [id, user]);

  const handleOpenMatterModal = () => {
    setFormData({ 
      type: 'Asesorías Jurídicas para Personas Naturales', 
      description: '', 
      responsible: user?.name || '', 
      status: 'Abierto', 
      stage: 'Inicial', 
      priority: 'Media', 
      nextDate: '', 
      clientId: id || '' 
    });
    setIsMatterModalOpen(true);
  };

  const handleMatterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mattersDAO.create(formData, user);
    setIsMatterModalOpen(false);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando expediente del cliente...</div>;
  if (!client) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-danger)' }}>Cliente no encontrado.</div>;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RADICADO: {client.internalId}</div>
            <h1 className="page-title" style={{ margin: 0 }}>{client.name}</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handleOpenMatterModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Abrir Asunto
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Lado Izquierdo: Info Detallada */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <Shield size={20} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Información Legal</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>TIPO DE CLIENTE</label>
                <div style={{ fontWeight: 500 }}>{client.type}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>DOCUMENTO / NIT</label>
                <div style={{ fontWeight: 500 }}>{client.document}</div>
              </div>
              {client.type === 'Persona Jurídica' && (
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>REPRESENTANTE LEGAL</label>
                  <div style={{ fontWeight: 500 }}>{client.legalRepresentative}</div>
                </div>
              )}
              {client.type === 'Establecimiento de Comercio' && (
                <>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>MATRÍCULA MERCANTIL</label>
                    <div style={{ fontWeight: 500 }}>{client.registrationNumber}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>PROPIETARIO</label>
                    <div style={{ fontWeight: 500 }}>{client.ownerName}</div>
                  </div>
                </>
              )}
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} color="var(--text-muted)"/> {client.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} color="var(--text-muted)"/> {client.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} color="var(--text-muted)"/> {client.address}, {client.city}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
             <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Observaciones del Cliente</h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{client.notes || 'Sin anotaciones generales.'}</p>
          </div>
        </div>

        {/* Lado Derecho: Tabs de Gestión */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.4rem', display: 'flex', gap: '0.4rem' }}>
            <button 
              onClick={() => setActiveTab('matters')} 
              className={activeTab === 'matters' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Briefcase size={16} /> Asuntos ({matters.length})
            </button>
            <button 
              onClick={() => setActiveTab('actions')} 
              className={activeTab === 'actions' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <History size={16} /> Actuaciones ({actions.length})
            </button>
            <button 
              onClick={() => setActiveTab('notes')} 
              className={activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Lock size={16} /> Notas Internas ({internalNotes.length})
            </button>
          </div>

          <div className="card" style={{ minHeight: '300px' }}>
            {activeTab === 'matters' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {matters.map(m => (
                  <div key={m.id} className="item-row" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => navigate(`/matters/${m.id}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                       <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{m.internalId}</span>
                       <span style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{m.status}</span>
                    </div>
                    <div style={{ fontWeight: 500 }}>{m.description}</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span><Calendar size={12}/> {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span>Resp: {m.responsible}</span>
                    </div>
                  </div>
                ))}
                {matters.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay asuntos vinculados.</div>}
              </div>
            )}

            {activeTab === 'actions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ Nueva Actuación</button>
                </div>
                {actions.map(a => (
                  <div key={a.id} style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleString()} - {a.responsible}</div>
                    <div style={{ fontWeight: 600 }}>{a.title}</div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>{a.content}</p>
                  </div>
                ))}
                {actions.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No se han registrado actuaciones.</div>}
              </div>
            )}

            {activeTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>+ Nota Privada</button>
                </div>
                {internalNotes.map(n => (
                  <div key={n.id} style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                    <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '0.25rem' }}>Nota Interna - {new Date(n.createdAt).toLocaleDateString()}</div>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{n.content}</p>
                  </div>
                ))}
                {internalNotes.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No hay notas internas registradas.</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {isMatterModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Abrir Nuevo Asunto</h2>
              <button onClick={() => setIsMatterModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleMatterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Línea de Servicio</label>
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
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Descripción / Asunto</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ej: Demanda de laboral..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsMatterModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear Asunto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
