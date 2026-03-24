import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { inventoryDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    asset: '', category: 'Equipos', serial: '', location: '', responsible: '', status: 'Disponible', purchaseDate: ''
  });

  const loadData = () => inventoryDAO.getAll(user).then(setInventory);

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ asset: '', category: 'Equipos', serial: '', location: '', responsible: user?.name || '', status: 'Disponible', purchaseDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este activo del inventario?')) {
      await inventoryDAO.delete(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await inventoryDAO.update(editingId, formData);
    } else {
      await inventoryDAO.create(formData, user);
    }
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventario de la Firma</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Agregar Activo
        </button>
      </div>
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Activo</th>
              <th style={{ padding: '1rem' }}>Categoría / Serial</th>
              <th style={{ padding: '1rem' }}>Ubicación</th>
              <th style={{ padding: '1rem' }}>Responsable</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{item.asset}</td>
                <td style={{ padding: '1rem' }}>{item.category} <br/> <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{item.serial}</span></td>
                <td style={{ padding: '1rem' }}>{item.location}</td>
                <td style={{ padding: '1rem' }}>{item.responsible}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: item.status === 'Asignado' ? '#dbeafe' : item.status === 'Disponible' ? '#dcfce7' : '#fee2e2', color: item.status === 'Asignado' ? '#1e40af' : item.status === 'Disponible' ? '#166534' : '#991b1b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{item.status}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleOpenModal(item)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem', padding: '0.25rem' }}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', color: 'var(--status-danger)', padding: '0.25rem' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay activos en inventario.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Activo' : 'Nuevo Activo'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Nombre del Activo</label>
                <input type="text" required value={formData.asset} onChange={e => setFormData({...formData, asset: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%' }}>
                    <option value="Equipos">Equipos (PCs, Laptops)</option>
                    <option value="Mobiliario">Mobiliario</option>
                    <option value="Vehículos">Vehículos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Número Serial / Placa</label>
                  <input type="text" value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Ubicación</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Responsable / Asignado a</label>
                  <input 
                    type="text" 
                    value={formData.responsible} 
                    onChange={e => setFormData({...formData, responsible: e.target.value})} 
                    readOnly={user?.role !== 'superadmin'}
                    style={{ backgroundColor: user?.role !== 'superadmin' ? '#f1f5f9' : 'white', cursor: user?.role !== 'superadmin' ? 'not-allowed' : 'text' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fecha de Compra</label>
                  <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Estado</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%' }}>
                    <option value="Disponible">Disponible</option>
                    <option value="Asignado">Asignado</option>
                    <option value="En Reparación">En Reparación</option>
                    <option value="Dado de Baja">Dado de Baja</option>
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

export default Inventory;
