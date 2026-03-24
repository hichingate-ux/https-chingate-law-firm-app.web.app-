import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { notesDAO, mattersDAO, clientsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', content: '', author: user?.name || '', status: 'Activa', referenceId: '', date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    const n = await notesDAO.getAll(user);
    // const m = await mattersDAO.getAll(user); // Assuming these are not directly used in this component yet
    // const c = await clientsDAO.getAll(user); // Assuming these are not directly used in this component yet
    setNotes(n);
  };

  useEffect(() => {
    loadData();
  }, [user]); // Added user to dependency array

  const handleOpenModal = (note?: any) => {
    if (note) {
      setEditingId(note.id);
      setFormData(note);
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', author: user?.name || '', status: 'Activa', referenceId: '', date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta nota?')) {
      await notesDAO.delete(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await notesDAO.update(editingId, formData);
    } else {
      await notesDAO.create(formData, user);
    }
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notas Internas</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nueva Nota
        </button>
      </div>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notes.map(n => (
          <div key={n.id} style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{n.title}</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.date} - Por: {n.author}</span>
                <button onClick={() => handleOpenModal(n)} style={{ background: 'none', color: 'var(--primary-color)' }}><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(n.id)} style={{ background: 'none', color: 'var(--status-danger)' }}><Trash2 size={16}/></button>
              </div>
            </div>
            <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{n.content}</p>
            <span style={{ background: n.status === 'Revisada' ? '#dcfce7' : '#fef3c7', color: n.status === 'Revisada' ? '#166534' : '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{n.status}</span>
            {n.referenceId && <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ref: Asunto/Cliente #{n.referenceId}</span>}
          </div>
        ))}
        {notes.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No hay notas registradas.</div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Nota' : 'Nueva Nota'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Título de la Nota</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Contenido</label>
                <textarea required rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Autor</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.author} 
                    onChange={e => setFormData({...formData, author: e.target.value})} 
                    readOnly={user?.role !== 'superadmin'}
                    style={{ backgroundColor: user?.role !== 'superadmin' ? '#f1f5f9' : 'white', cursor: user?.role !== 'superadmin' ? 'not-allowed' : 'text' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fecha</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Activa">Activa</option>
                    <option value="Revisada">Revisada</option>
                    <option value="Archivada">Archivada</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Referencia (ID Caso/Cliente)</label>
                  <input type="text" value={formData.referenceId} onChange={e => setFormData({...formData, referenceId: e.target.value})} placeholder="Ej. 1" />
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

export default Notes;
