import { useEffect, useState } from 'react';
import { 
  Search, FolderOpen, Calendar, User, AlertTriangle, 
  Plus, FileText, ClipboardList, UserPlus, 
  Briefcase, Activity, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clientsDAO, mattersDAO, eventsDAO, invoicesDAO, notesDAO } from '../services/db';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [data, setData] = useState({
    clients: [] as any[],
    matters: [] as any[],
    events: [] as any[],
    invoices: [] as any[],
    notes: [] as any[]
  });

  useEffect(() => {
    const unsubClients = clientsDAO.subscribe((cls) => setData(prev => ({ ...prev, clients: cls })), user);
    const unsubMatters = mattersDAO.subscribe((mats) => setData(prev => ({ ...prev, matters: mats })), user);
    const unsubEvents = eventsDAO.subscribe((evs) => setData(prev => ({ ...prev, events: evs })), user);
    const unsubInvoices = invoicesDAO.subscribe((invs) => setData(prev => ({ ...prev, invoices: invs })), user);
    const unsubNotes = notesDAO.subscribe((nts) => setData(prev => ({ ...prev, notes: nts })), user);

    return () => {
      unsubClients();
      unsubMatters();
      unsubEvents();
      unsubInvoices();
      unsubNotes();
    };
  }, [user]);

  const stats = [
    { label: 'Clientes Activos', value: data.clients.length, icon: <User size={20} />, color: '#3b82f6' },
    { label: 'Asuntos Abiertos', value: data.matters.filter(m => m.status !== 'Cerrado').length, icon: <Briefcase size={20} />, color: '#10b981' },
    { label: 'Tareas Pendientes', value: data.events.filter(e => e.status === 'Pendiente').length, icon: <Calendar size={20} />, color: '#f59e0b' },
    { label: 'Facturas Vencidas', value: data.invoices.filter(i => i.status === 'Vencida').length, icon: <AlertTriangle size={20} />, color: '#ef4444' }
  ];

  const recentClients = [...data.clients].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
  const upcomingEvents = [...data.events].filter(e => e.status === 'Pendiente').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  const recentNotes = [...data.notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Logic to decide where to navigate based on search term prefix or common patterns
      // For now, let's just go to matters with the query
      navigate(`/matters?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Bienvenido, {user?.name || 'Usuario'}</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Panel Principal de Control - Chingaté Abogados</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' } as any}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.role}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* Global Search Box */}
      <div style={{ marginBottom: '2.5rem' }}>
        <form onSubmit={handleGlobalSearch} style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <Search size={22} style={{ position: 'absolute', left: '20px', top: '18px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscador Global: clientes, asuntos, documentos, radicado..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '1.1rem 1.1rem 1.1rem 3.5rem', 
              fontSize: '1.1rem', 
              borderRadius: '12px', 
              border: '2px solid var(--border-color)', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button type="submit" className="btn-primary" style={{ position: 'absolute', right: '10px', top: '8px', padding: '0.6rem 1.5rem' }}>
            Buscar
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ background: `${stat.color}15`, color: stat.color, padding: '1rem', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Quick Actions & Recent Clients */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quick Access */}
          <section className="card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--primary-color)" /> Accesos Rápidos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button onClick={() => navigate('/clients/new')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '1rem' }}>
                <UserPlus size={18} /> Nuevo Cliente
              </button>
              <button onClick={() => navigate('/matters')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '1rem' }}>
                <Briefcase size={18} /> Nuevo Asunto
              </button>
              <button onClick={() => navigate('/reports')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '1rem' }}>
                <ClipboardList size={18} /> Generar Informe
              </button>
              <button onClick={() => navigate('/certificates')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '1rem' }}>
                <FileText size={18} /> Generar Certificado
              </button>
              <button onClick={() => navigate('/documents')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '1rem', gridColumn: 'span 2' }}>
                <FolderOpen size={18} /> Cargar Documento PDF
              </button>
            </div>
          </section>

          {/* Recent Clients */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Clientes Recientes</h3>
              <button onClick={() => navigate('/clients')} style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600, background: 'none' }}>Ver todos</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentClients.map(c => (
                <div key={c.id} onClick={() => navigate(`/clients/${c.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }} className="hover-card">
                  <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', fontWeight: 600 }}>{c.name.charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {c.document} • {c.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Key Dates & Recent Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Upcoming Dates */}
          <section className="card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#f59e0b" /> Próximas Fechas Clave
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingEvents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No hay audiencias o vencimientos próximos.</p>
              ) : (
                upcomingEvents.map(e => (
                  <div key={e.id} style={{ padding: '0.75rem', borderLeft: '3px solid #f59e0b', background: '#fffbeb', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                      <span>{e.title}</span>
                      <span style={{ color: '#b45309' }}>{e.date}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>Asunto: {data.matters.find(m => m.id === e.matterId)?.description || 'Asunto no encontrado'}</div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => navigate('/agenda')} className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }}>Gestionar Agenda Completa</button>
          </section>

          {/* Recent Notes/Actions */}
          <section className="card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Actuaciones Recientes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recentNotes.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No hay actuaciones registradas recientemente.</p>
              ) : (
                recentNotes.map((note, i) => (
                  <div key={note.id} style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                    {/* Timeline dot and line */}
                    <div style={{ position: 'absolute', left: 0, top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></div>
                    {i < recentNotes.length - 1 && <div style={{ position: 'absolute', left: '3px', top: '14px', bottom: '-20px', width: '2px', background: 'var(--border-color)' }}></div>}
                    
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{note.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{note.date} • {note.author}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.content}</div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => navigate('/notes')} className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.85rem' }}>Ver Historial de Actuaciones</button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
