import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Printer, Mail } from 'lucide-react';
import { invoicesDAO, clientsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    number: '', concept: '', value: 0, emissionDate: '', dueDate: '', status: 'Pendiente', clientId: '', notes: '', responsible: user?.name || ''
  });

  const loadData = async () => {
    const invs = await invoicesDAO.getAll(user);
    const cls = await clientsDAO.getAll(user);
    setInvoices(invs);
    setClients(cls);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenModal = async (inv?: any) => {
    if (inv) {
      setEditingId(inv.id);
      setFormData(inv);
    } else {
      const nextNumber = await invoicesDAO.getNextSerialNumber();
      setEditingId(null);
      setFormData({ 
        number: nextNumber, 
        concept: '', 
        value: 0, 
        emissionDate: new Date().toISOString().split('T')[0], 
        dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0], 
        status: 'Pendiente', 
        clientId: '',
        notes: '',
        responsible: user?.name || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta factura permanentemente?')) {
      await invoicesDAO.delete(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await invoicesDAO.update(editingId, { ...formData, value: Number(formData.value) });
    } else {
      await invoicesDAO.create({ ...formData, value: Number(formData.value) }, user);
    }
    setIsModalOpen(false);
    loadData();
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente no encontrado';

  const handlePrint = () => window.print();
  const handleSendEmail = () => alert('Simulación: Factura enviada al correo del cliente registrado.');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Facturación y Cartera</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Nueva Factura
        </button>
      </div>
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Factura #</th>
              <th style={{ padding: '1rem' }}>Concepto</th>
              <th style={{ padding: '1rem' }}>Cliente</th>
              <th style={{ padding: '1rem' }}>Valor</th>
              <th style={{ padding: '1rem' }}>Estado</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{inv.number}</td>
                <td style={{ padding: '1rem' }}>{inv.concept}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{getClientName(inv.clientId)}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>${inv.value?.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: inv.status === 'Pagada' ? '#dcfce7' : '#fee2e2', 
                    color: inv.status === 'Pagada' ? '#166534' : '#991b1b', 
                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' 
                  }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => { setSelectedInvoice(inv); setIsViewModalOpen(true); }} title="Ver / Imprimir" style={{ background: 'transparent', color: 'var(--text-main)', marginRight: '0.5rem' }}><Printer size={16}/></button>
                  <button onClick={() => handleOpenModal(inv)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem' }}><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(inv.id)} style={{ background: 'transparent', color: 'var(--status-danger)' }}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay facturas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edición/Creación */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Editar Factura' : 'Generar Nueva Factura'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Cliente</label>
                <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} style={{ width: '100%' }}>
                  <option value="">Seleccione un cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Consecutivo</label>
                  <input type="text" required value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Valor ($)</label>
                  <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Concepto del Cobro</label>
                <input type="text" required value={formData.concept} onChange={e => setFormData({...formData, concept: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fecha Emisión</label>
                  <input type="date" required value={formData.emissionDate} onChange={e => setFormData({...formData, emissionDate: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Vencimiento</label>
                  <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Generado Por (Responsable)</label>
                <input 
                  type="text" 
                  value={formData.responsible} 
                  readOnly 
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Factura</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Impresión */}
      {isViewModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem' }}>
          <div className="card print-container" style={{ width: '100%', maxWidth: '800px', background: 'white', color: 'black', padding: '3rem', position: 'relative' }}>
            <button className="no-print" onClick={() => setIsViewModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', color: '#666' }}><X size={24}/></button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div>
                <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '2rem' }}>CHINGATÉ ABOGADOS</h1>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>NIT: 901.XXX.XXX-X | Bogotá, Colombia</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0 }}>FACTURA DE VENTA</h2>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{selectedInvoice.number}</div>
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <strong>PARA:</strong> {getClientName(selectedInvoice.clientId)}<br/>
              <strong>IDENTIFICACIÓN:</strong> {clients.find(c => c.id === selectedInvoice.clientId)?.document || 'N/D'}<br/>
              <strong>FECHA:</strong> {selectedInvoice.emissionDate}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Descripción</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '1rem' }}>{selectedInvoice.concept}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>${selectedInvoice.value?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              TOTAL A PAGAR: ${selectedInvoice.value?.toLocaleString()}
            </div>
            <div className="no-print" style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handlePrint}><Printer size={18}/> Imprimir</button>
              <button className="btn-secondary" onClick={handleSendEmail}><Mail size={18}/> Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
