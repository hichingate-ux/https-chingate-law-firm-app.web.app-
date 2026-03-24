import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { eventsDAO, mattersDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Agenda = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', date: '', time: '', responsible: '', status: 'Pendiente', matterId: ''
  });

  useEffect(() => {
    const unsubscribeEvents = eventsDAO.subscribe(setEvents);
    const unsubscribeMatters = mattersDAO.subscribe(setMatters);

    return () => {
      unsubscribeEvents();
      unsubscribeMatters();
    };
  }, []);

  const handleOpenModal = (ev?: any) => {
    if (ev) {
      setEditingId(ev.id);
      setFormData(ev);
    } else {
      setEditingId(null);
      setFormData({ title: '', date: '', time: '', responsible: '', status: 'Pendiente', matterId: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este evento de la agenda?')) {
      await eventsDAO.delete(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await eventsDAO.update(editingId, formData);
    } else {
      await eventsDAO.create(formData, user);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agenda Corporativa</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', gap: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', alignItems: 'center' }}>
              <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1.5rem', textAlign: 'center', minWidth: '100px' }}>
                <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{ev.date}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ev.time}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{ev.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Responsable: {ev.responsible} | Ref: Asunto #{ev.matterId}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ background: ev.status === 'Pendiente' ? '#fef3c7' : '#f1f5f9', color: ev.status === 'Pendiente' ? '#b45309' : 'var(--text-muted)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{ev.status}</span>
                <button onClick={() => handleOpenModal(ev)} style={{ background: 'none', color: 'var(--primary-color)' }}><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', color: 'var(--status-danger)' }}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay eventos próximos en la agenda.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Título del Evento / Audiencia</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fecha</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Hora</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Asunto Vinculado</label>
                <select value={formData.matterId} onChange={e => setFormData({...formData, matterId: e.target.value})} style={{ width: '100%' }}>
                  <option value="">Seleccione un asunto (opcional)</option>
                  {matters.map(m => <option key={m.id} value={m.id}>{m.description}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Responsable</label>
                  <input type="text" required value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
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

export default Agenda;
