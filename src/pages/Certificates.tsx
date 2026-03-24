import { useState, useEffect } from 'react';
import { FileBadge, Download, Printer, Search, CheckCircle } from 'lucide-react';
import { clientsDAO, mattersDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Certificates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ clients: [] as any[], matters: [] as any[] });
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [template, setTemplate] = useState('atencion');
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    Promise.all([clientsDAO.getAll(user), mattersDAO.getAll(user)]).then(([cls, mats]) => {
      setData({ clients: cls, matters: mats });
      setLoading(false);
    });
  }, [user]);

  const handleGenerate = () => {
    if (!selectedClient) {
      alert('Por favor selecciona un cliente primero.');
      return;
    }
    setGenerated(true);
  };

  const templates = [
    { id: 'atencion', name: 'Certificación de Atención Jurídica', desc: 'Certifica que el cliente está siendo atendido por la firma.' },
    { id: 'estado', name: 'Estado de Trámite Académico/Procesal', desc: 'Informa el estado actual de un proceso específico.' },
    { id: 'poder', name: 'Confirmación de Otorgamiento de Poder', desc: 'Valida que la firma representa legalmente al interesado.' }
  ];

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Generación de Certificados</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step 1: Select Client */}
          <section className="card">
            <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>1. Seleccionar Beneficiario</h3>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar cliente por nombre o ID..." 
                style={{ width: '100%', paddingLeft: '2.5rem' }} 
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.clients.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedClient(c)}
                  style={{ 
                    padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', 
                    cursor: 'pointer', background: selectedClient?.id === c.id ? '#eff6ff' : 'white',
                    borderColor: selectedClient?.id === c.id ? 'var(--primary-color)' : 'var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.document}</div>
                  </div>
                  {selectedClient?.id === c.id && <CheckCircle size={16} color="var(--primary-color)" />}
                </div>
              ))}
            </div>
          </section>

          {/* Step 2: Select Template */}
          <section className="card">
            <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '1rem' }}>2. Seleccionar Plantilla</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {templates.map(t => (
                <label key={t.id} style={{ 
                  display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', 
                  cursor: 'pointer', background: template === t.id ? '#f8fafc' : 'white'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input type="radio" name="template" checked={template === t.id} onChange={() => setTemplate(t.id)} style={{ marginTop: '0.2rem' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <button 
              className="btn-primary" 
              onClick={handleGenerate} 
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <FileBadge size={18} /> Previsualizar Certificado
            </button>
          </section>
        </div>

        {/* Preview Area */}
        <section className="card" style={{ background: '#f1f5f9', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
          {!generated ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              <FileBadge size={64} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Vista Previa del Documento</h3>
              <p>Selecciona un cliente y una plantilla para generar la previsualización del certificado oficial.</p>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1rem' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
                  <Printer size={16} /> Imprimir
                </button>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} /> Descargar PDF Firmado
                </button>
              </div>
              
              <div style={{ flex: 1, background: 'white', padding: '4rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'serif', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.5rem' }}>CHINGATÉ ABOGADOS</h2>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Certificación Profesional de Servicios Jurídicos</div>
                </div>

                <div style={{ textAlign: 'justify', lineHeight: '1.8', color: '#1e293b' }}>
                  <p>A QUIEN PUEDA INTERESAR,</p>
                  
                  <p style={{ marginTop: '2rem' }}>
                    La suscrita firma de abogados <strong>CHINGATÉ ABOGADOS</strong>, identificada con NIT en el sistema, certifica por medio del presente documento que el señor(a) / empresa:
                  </p>

                  <div style={{ textAlign: 'center', margin: '2rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    {selectedClient?.name.toUpperCase()}
                  </div>

                  <p>
                    Identificado(a) con el documento número <strong>{selectedClient?.document || '___________'}</strong>, se encuentra actualmente {template === 'atencion' ? 'bajo nuestra asesoría jurídica integral' : 'vinculado(a) a un proceso gestionado por nuestra firma'} en cumplimiento de los estándares éticos y legales vigentes.
                  </p>

                  <p>
                    Se expide el presente certificado a solicitud del interesado, en la ciudad de Bogotá D.C., a los {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  </p>
                </div>

                <div style={{ marginTop: '6rem', borderTop: '1px solid #000', width: '250px', paddingTop: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>CHINGATÉ ABOGADOS</div>
                  <div style={{ fontSize: '0.8rem' }}>Representante Legal / Abogado Responsable</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Certificates;
