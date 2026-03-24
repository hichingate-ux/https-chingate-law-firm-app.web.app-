import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Download } from 'lucide-react';
import { documentsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Documento Legal', referenceId: '', uploadedBy: user?.name || 'Sistema'
  });

  const loadData = () => documentsDAO.getAll(user).then(setDocuments);

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenModal = (doc?: any) => {
    if (doc) {
      setEditingId(doc.id);
      setFormData(doc);
    } else {
      setEditingId(null);
      setFormData({ name: '', type: 'Documento Legal', referenceId: '', uploadedBy: user?.name || 'Sistema' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este documento del sistema?')) {
      await documentsDAO.delete(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await documentsDAO.update(editingId, formData);
    } else {
      await documentsDAO.create({ ...formData, uploadedAt: new Date().toISOString() }, user);
    }
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestión Documental</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Subir Documento
        </button>
      </div>
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Nombre del Archivo</th>
              <th style={{ padding: '1rem' }}>Tipo</th>
              <th style={{ padding: '1rem' }}>Vinculado a Asunto/Cliente (ID)</th>
              <th style={{ padding: '1rem' }}>Subido Por</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary-color)' }}>{doc.name}</td>
                <td style={{ padding: '1rem' }}>{doc.type}</td>
                <td style={{ padding: '1rem' }}>Ref: #{doc.referenceId}</td>
                <td style={{ padding: '1rem' }}>{doc.uploadedBy}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => alert('Simulación: Descargando ' + doc.name)} style={{ background: 'transparent', color: 'var(--text-main)', marginRight: '0.5rem', padding: '0.25rem' }}><Download size={16}/></button>
                  <button onClick={() => handleOpenModal(doc)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem', padding: '0.25rem' }}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(doc.id)} style={{ background: 'transparent', color: 'var(--status-danger)', padding: '0.25rem' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay documentos subidos.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Info Documento' : 'Subir Documento'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!editingId && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Seleccionar Archivo (Simulado)</label>
                  <input type="file" onChange={e => e.target.files && setFormData({...formData, name: e.target.files[0].name})} style={{ width: '100%', padding: '0.5rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Nombre del Archivo / Título</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Tipo de Documento</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%' }}>
                    <option value="Documento Legal">Documento Legal</option>
                    <option value="Evidencia">Evidencia</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Plantilla">Plantilla</option>
                    <option value="Identificación">Identificación</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Referencia (Cliente/Asunto ID)</label>
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

export default Documents;
