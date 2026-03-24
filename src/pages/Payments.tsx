import { useEffect, useState } from 'react';
import { DollarSign, Plus, Edit2, Trash2, X } from 'lucide-react';
import { paymentsDAO, invoicesDAO, clientsDAO, mattersDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '', 
    matterId: '', 
    invoiceId: '', 
    value: '', 
    date: new Date().toISOString().split('T')[0], 
    method: 'Transferencia', 
    reference: '', 
    responsible: user?.name || '',
    observations: ''
  });

  const loadData = async () => {
    const [p, i, c, m] = await Promise.all([
      paymentsDAO.getAll(user),
      invoicesDAO.getAll(user),
      clientsDAO.getAll(user),
      mattersDAO.getAll(user)
    ]);
    setPayments(p || []);
    setInvoices(i || []);
    setClients(c || []);
    setMatters(m || []);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenModal = (pay?: any) => {
    if (pay) {
      setEditingId(pay.id);
      setFormData(pay);
    } else {
      setEditingId(null);
      setFormData({ 
        clientId: '', 
        matterId: '', 
        invoiceId: '', 
        value: '', 
        date: new Date().toISOString().split('T')[0], 
        method: 'Transferencia', 
        reference: '', 
        responsible: user?.name || '',
        observations: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, value: Number(formData.value) };
    if (editingId) {
      await paymentsDAO.update(editingId, payload);
    } else {
      await paymentsDAO.create(payload, user);
    }
    setIsModalOpen(false);
    loadData();
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';
  const getMatterDesc = (id: string) => matters.find(m => m.id === id)?.description || 'N/A';

  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.value) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pagos y Cartera</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Registrar Pago
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Recaudado</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
            ${totalCollected.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Facturación Pendiente</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#991b1b' }}>
            ${Math.max(0, totalInvoiced - totalCollected).toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pagos del Mes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {payments.filter(p => p.date && p.date.startsWith(new Date().toISOString().slice(0,7))).length}
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Fecha</th>
              <th style={{ padding: '1rem' }}>Cliente</th>
              <th style={{ padding: '1rem' }}>Asunto</th>
              <th style={{ padding: '1rem' }}>Monto</th>
              <th style={{ padding: '1rem' }}>Medio</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.sort((a,b) => b.date.localeCompare(a.date)).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{p.date}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{getClientName(p.clientId)}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{getMatterDesc(p.matterId)}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#166534' }}>${p.value?.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>{p.method}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleOpenModal(p)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem' }}><Edit2 size={16}/></button>
                  <button onClick={async () => { if(confirm('¿Eliminar?')) { await paymentsDAO.delete(p.id); loadData(); } }} style={{ background: 'transparent', color: 'var(--status-danger)' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay pagos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editingId ? 'Editar Pago' : 'Registrar Nuevo Pago'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Cliente</label>
                <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} style={{ width: '100%' }}>
                  <option value="">Seleccione Cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Asunto / Expediente</label>
                <select value={formData.matterId} onChange={e => setFormData({...formData, matterId: e.target.value})} style={{ width: '100%' }}>
                  <option value="">Seleccione Asunto (Opcional)</option>
                  {matters.filter(m => !formData.clientId || m.clientId === formData.clientId).map(m => <option key={m.id} value={m.id}>{m.description}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Valor Pagado ($)</label>
                  <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fecha</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Registrado Por (Responsable)</label>
                <input 
                  type="text" 
                  value={formData.responsible} 
                  readOnly 
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
