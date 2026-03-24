import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, Clock, User, 
  FileText, DollarSign, Download,
  AlertCircle, CheckCircle2, History, Lock, Plus
} from 'lucide-react';
import { 
  mattersDAO, clientsDAO, actionsDAO, internalNotesDAO,
  documentsDAO, eventsDAO, invoicesDAO, paymentsDAO 
} from '../services/db';
import { useAuth } from '../context/AuthContext';

const MatterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [matter, setMatter] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [internalNotes, setInternalNotes] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'notes' | 'docs' | 'agenda' | 'billing'>('history');

  useEffect(() => {
    if (!id) return;
    const loadAll = async () => {
      const m: any = await mattersDAO.getById(id);
      if (m) {
        const [c, act, notes, d, e, i, p] = await Promise.all([
          clientsDAO.getById(m.clientId),
          actionsDAO.getAll(user),
          internalNotesDAO.getAll(user),
          documentsDAO.getAll(user),
          eventsDAO.getAll(user),
          invoicesDAO.getAll(user),
          paymentsDAO.getAll(user)
        ]);
        setMatter(m);
        setClient(c);
        setActions(act.filter((a: any) => a.matterId === id));
        setInternalNotes(notes.filter((n: any) => n.matterId === id));
        setDocs(d.filter((doc: any) => doc.referenceId === id));
        setEvents(e.filter((ev: any) => ev.matterId === id));
        setInvoices(i.filter((inv: any) => inv.matterId === id));
        
        const matterInvoiceIds = i.filter((inv: any) => inv.matterId === id).map(inv => inv.id);
        setPayments(p.filter((pay: any) => matterInvoiceIds.includes(pay.invoiceId)));
      }
      setLoading(false);
    };
    loadAll();
  }, [id, user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Abriendo expediente...</div>;
  if (!matter) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--status-danger)' }}>Asunto no encontrado.</div>;

  const tabs = [
    { id: 'history', label: 'Actuaciones', icon: History },
    { id: 'notes', label: 'Notas Internas', icon: Lock },
    { id: 'docs', label: 'Documentos', icon: FileText },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'billing', label: 'Finanzas', icon: DollarSign },
  ];

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RADICADO: {matter.internalId}</div>
            <h1 className="page-title" style={{ margin: 0 }}>EXPEDIENTE: {matter.description}</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span style={{ 
            background: matter.status === 'Abierto' ? '#dcfce7' : '#fef3c7', 
            color: matter.status === 'Abierto' ? '#166534' : '#b45309', 
            padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' 
          }}>
            {matter.status === 'Abierto' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
            {matter.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 3fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sidebar Detalles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Información del Cliente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div onClick={() => navigate(`/clients/${client?.id}`)} style={{ cursor: 'pointer', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{client?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{client?.document}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>Contácto</label>
                <div style={{ fontSize: '0.85rem' }}>{client?.phone || 'Sin teléfono'}</div>
                <div style={{ fontSize: '0.85rem' }}>{client?.email || 'Sin correo'}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Detalles del Asunto</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tipo de Servicio</label>
                <div style={{ fontWeight: 500 }}>{matter.type}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Responsable</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} /> {matter.responsible}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Etapa Actual</label>
                <div style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{matter.stage || 'Etapa Inicial'}</div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha de Inicio</label>
                <div style={{ fontWeight: 500 }}>{matter.createdAt ? new Date(matter.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--primary-color)', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Resumen Financiero</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              ${invoices.reduce((acc, inv) => acc + (inv.value || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total Facturado en este asunto</div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pagado:</span>
              <span>${payments.reduce((acc, p) => acc + (p.value || 0), 0).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
              <span>Saldo Pendiente:</span>
              <span style={{ fontWeight: 'bold' }}>${(invoices.reduce((acc, inv) => acc + (inv.value || 0), 0) - payments.reduce((acc, p) => acc + (p.value || 0), 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ 
                  flex: 1, padding: '0.75rem', borderRadius: '4px', border: 'none',
                  background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ minHeight: '400px' }}>
            {activeTab === 'history' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Historial de Actuaciones</h3>
                  <button className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Nueva Actuación</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {actions.map(a => (
                    <div key={a.id} style={{ borderLeft: '3px solid var(--primary-color)', paddingLeft: '1rem', position: 'relative' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{new Date(a.createdAt).toLocaleString()} - {a.responsible}</div>
                      <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{a.title}</div>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{a.content}</p>
                    </div>
                  ))}
                  {actions.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay actuaciones registradas.</div>}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Notas Internas (Privadas)</h3>
                  <button className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Nota Interna</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {internalNotes.map(n => (
                    <div key={n.id} style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                      <div style={{ fontSize: '0.8rem', color: '#b45309', marginBottom: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{n.content}</p>
                    </div>
                  ))}
                  {internalNotes.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay notas internas registradas.</div>}
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Gestión Documental</h3>
                  <button className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Subir PDF</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {docs.map(d => (
                    <div key={d.id} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <FileText size={32} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>{d.type}</div>
                      <button style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 auto' }}>
                        <Download size={12} /> Descargar
                      </button>
                    </div>
                  ))}
                  {docs.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay documentos asociados.</div>}
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Próximas Fechas Clave</h3>
                  <button className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Programar</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ textAlign: 'center', minWidth: '60px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{ev.date.split('-')[2]}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ev.date.split('-')[1]}/{ev.date.split('-')[0]}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{ev.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><Clock size={12} /> {ev.time} - Resp: {ev.responsible}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', alignSelf: 'center' }}>{ev.status}</span>
                    </div>
                  ))}
                  {events.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay eventos programados.</div>}
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Historial Financiero</h3>
                  <button className="btn-primary" style={{ fontSize: '0.85rem' }}>+ Nueva Factura</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 0' }}>Factura</th>
                      <th style={{ padding: '0.75rem 0' }}>Concepto</th>
                      <th style={{ padding: '0.75rem 0' }}>Monto</th>
                      <th style={{ padding: '0.75rem 0' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{inv.number || `ID: ${inv.id}`}</td>
                        <td style={{ padding: '0.75rem 0' }}>{inv.concept}</td>
                        <td style={{ padding: '0.75rem 0' }}>${inv.value?.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem 0' }}>
                          <span style={{ 
                            background: inv.status === 'Pagada' ? '#dcfce7' : '#fee2e2', 
                            color: inv.status === 'Pagada' ? '#166534' : '#991b1b',
                            padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem'
                          }}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoices.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay registros financieros.</div>}
              </div>
            )}
          </div>
          </div>
      </div>
    </div>
  );
};

export default MatterDetail;
