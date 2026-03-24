import { useState, useEffect } from 'react';
import { ShieldCheck, Printer, Search, CreditCard } from 'lucide-react';
import { clientsDAO, invoicesDAO, paymentsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const FinancialCertificates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ clients: [] as any[], invoices: [] as any[], payments: [] as any[] });
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    Promise.all([clientsDAO.getAll(user), invoicesDAO.getAll(user), paymentsDAO.getAll(user)]).then(([cls, invs, pays]) => {
      setData({ clients: cls, invoices: invs, payments: pays });
      setLoading(false);
    });
  }, [user]);

  const handleGenerate = () => {
    if (!selectedClient) {
      alert('Selecciona un cliente.');
      return;
    }
    // Check if client has pending debt
    const clientInvoices = data.invoices.filter(i => i.clientId === selectedClient.id);
    const clientPayments = data.payments.filter(p => p.clientId === selectedClient.id);
    const totalInv = clientInvoices.reduce((acc, i) => acc + (i.value || 0), 0);
    const totalPay = clientPayments.reduce((acc, p) => acc + (p.value || 0), 0);
    
    if (totalInv > totalPay) {
      alert('El cliente tiene un saldo pendiente de $' + (totalInv - totalPay).toLocaleString() + '. No se puede generar el Paz y Salvo.');
      return;
    }
    setGenerated(true);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Certificados Financieros</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Generar Paz y Salvo</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>El sistema valida automáticamente que el cliente no tenga deudas pendientes antes de permitir la generación.</p>

          <div style={{ position: 'relative', margin: '1.5rem 0' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Buscar cliente..." style={{ width: '100%', paddingLeft: '2.5rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {data.clients.map(c => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedClient(c); setGenerated(false); }}
                style={{ 
                  padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', 
                  cursor: 'pointer', background: selectedClient?.id === c.id ? '#f0fdf4' : 'white',
                  borderColor: selectedClient?.id === c.id ? '#22c55e' : 'var(--border-color)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {c.document}</div>
              </div>
            ))}
          </div>

          <button 
            className="btn-primary" 
            onClick={handleGenerate}
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#22c55e' }}
          >
            <ShieldCheck size={18} /> Validar y Generar PDF
          </button>
        </section>

        <section className="card" style={{ background: '#f8fafc', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          {!generated ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              <CreditCard size={64} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Vista Previa del Paz y Salvo</h3>
              <p>Selecciona un cliente para validar su estado de cuenta y generar el certificado de paz y salvo oficial.</p>
            </div>
          ) : (
            <div style={{ flex: 1, background: 'white', padding: '4rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'serif', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ margin: 0, color: '#166534', fontSize: '1.5rem' }}>PAZ Y SALVO FINANCIERO</h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>CHINGATÉ ABOGADOS - DEPARTAMENTO DE TESORERÍA</div>
              </div>

              <div style={{ textAlign: 'justify', lineHeight: '1.8' }}>
                <p><strong>CHINGATÉ ABOGADOS</strong>, identificada con NIT en el sistema, hace constar que el señor(a):</p>
                
                <div style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {selectedClient?.name.toUpperCase()}
                </div>

                <p>Identificado(a) con <strong>CC/NIT {selectedClient?.document || '___________'}</strong>, se encuentra a la fecha en <strong>COMPLETO PAZ Y SALVO</strong> por todo concepto relacionado con honorarios profesionales, gastos procesales y servicios prestados por nuestra firma hasta la fecha actual.</p>

                <p>No existen obligaciones pendientes de pago, facturas vencidas ni saldos a favor de la firma asociados a la identificación arriba mencionada.</p>

                <p>Se expide en Bogotá D.C., a los {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
              </div>

              <div style={{ marginTop: '5rem', borderTop: '1px solid #000', width: '200px', paddingTop: '0.5rem' }}>
                <div style={{ fontWeight: 'bold' }}>TESORERÍA Y CARTERA</div>
                <div style={{ fontSize: '0.8rem' }}>CHINGATÉ ABOGADOS</div>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button className="btn-secondary" style={{ fontSize: '0.75rem' }}><Printer size={14} /> Imprimir copia</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FinancialCertificates;
