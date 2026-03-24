import { useState, useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import { clientsDAO, mattersDAO, usersDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ clients: [] as any[], matters: [] as any[], users: [] as any[] });
  const [reportType, setReportType] = useState('matters_by_status');
  const [filters, setFilters] = useState({ lawyer: '', dateStart: '', dateEnd: '' });

  useEffect(() => {
    Promise.all([clientsDAO.getAll(user), mattersDAO.getAll(user), usersDAO.getAll()]).then(([cls, mats, usrs]) => {
      setData({ clients: cls, matters: mats, users: usrs });
      setLoading(false);
    });
  }, [user]);

  const generateReport = () => {
    alert('Generando PDF del reporte... (Simulación)');
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando datos de informes...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Generación de Informes</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={generateReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} /> Imprimir
          </button>
          <button className="btn-primary" onClick={generateReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <aside className="card">
          <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '1.25rem' }}>Parámetros del Informe</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Tipo de Informe</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="matters_by_status">Asuntos por Estado</option>
                <option value="matters_by_lawyer">Asuntos por Abogado</option>
                <option value="clients_stats">Estadísticas de Clientes</option>
                <option value="performance_summary">Resumen de Productividad</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Abogado Responsable</label>
              <select value={filters.lawyer} onChange={e => setFilters({...filters, lawyer: e.target.value})}>
                <option value="">Todos los abogados</option>
                {data.users.filter(u => ['abogado_a', 'directivo_a', 'asistente'].includes(u.role)).map(u => (
                  <option key={u.id} value={u.name}>{u.name} ({u.role === 'abogado_a' ? 'Abogado' : u.role === 'directivo_a' ? 'Directivo' : 'Asistente'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Desde</label>
              <input type="date" value={filters.dateStart} onChange={e => setFilters({...filters, dateStart: e.target.value})} />
            </div>

            <div>
              <label className="form-label">Hasta</label>
              <input type="date" value={filters.dateEnd} onChange={e => setFilters({...filters, dateEnd: e.target.value})} />
            </div>
          </div>
        </aside>

        <main className="card">
          <h3 style={{ marginTop: 0 }}>Vista Previa</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>A continuación se muestra un resumen de los datos que se incluirán en el informe final.</p>
          
          <div style={{ marginTop: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Referencia</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Descripción</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Estado</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {data.matters.slice(0, 10).map(m => (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>#{m.id}</td>
                    <td style={{ padding: '0.75rem' }}>{m.description}</td>
                    <td style={{ padding: '0.75rem' }}>{m.status}</td>
                    <td style={{ padding: '0.75rem' }}>{m.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total registros encontrados: {data.matters.length}</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
