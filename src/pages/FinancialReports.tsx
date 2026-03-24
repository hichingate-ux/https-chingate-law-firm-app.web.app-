import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Download, Calendar } from 'lucide-react';
import { invoicesDAO, paymentsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const FinancialReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([invoicesDAO.getAll(user), paymentsDAO.getAll(user)]).then(([invs, pays]) => {
      setInvoices(invs);
      setPayments(pays);
      setLoading(false);
    });
  }, [user]);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.value || 0), 0);
  const totalPaid = payments.reduce((acc, pay) => acc + (pay.value || 0), 0);
  const pendingCollection = totalInvoiced - totalPaid;
  const overdueDebt = invoices.filter(i => i.status === 'Vencida').reduce((acc, inv) => acc + (inv.value || 0), 0);

  const stats = [
    { label: 'Ingresos Totales', value: totalPaid, icon: <TrendingUp size={24} />, color: '#10b981' },
    { label: 'Cartera Pendiente', value: pendingCollection, icon: <DollarSign size={24} />, color: '#3b82f6' },
    { label: 'Cartera Vencida', value: overdueDebt, icon: <AlertCircle size={24} />, color: '#ef4444' },
    { label: 'Recaudo Mensual', value: totalPaid * 0.4, icon: <Calendar size={24} />, color: '#f59e0b' } // Mocked 40% as monthly
  ];

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos financieros...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Informe Financiero y Cartera</h1>
        <button className="btn-primary" onClick={() => alert('Generando Informe Consolidado...')}>
          <Download size={18} /> Descargar Reporte Consolidado
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ background: `${s.color}15`, color: s.color, padding: '1rem', borderRadius: '12px' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${s.value.toLocaleString()}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <section className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Últimos Pagos Recibidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {payments.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.clientName || 'Cliente Genérico'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.date} • {p.method}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>+ ${p.value?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Factura #{p.invoiceId}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Facturación por Estado</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {['Pagada', 'Pendiente', 'Vencida'].map(status => {
              const count = invoices.filter(i => i.status === status).length;
              const val = invoices.filter(i => i.status === status).reduce((acc, i) => acc + (i.value || 0), 0);
              const percentage = (val / totalInvoiced) * 100;
              
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{status} ({count})</span>
                    <span>${val.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: status === 'Pagada' ? '#10b981' : status === 'Vencida' ? '#ef4444' : '#3b82f6' 
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinancialReports;
