import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, AlertCircle } from 'lucide-react';
import { mattersDAO } from '../services/db';

const Orical360Search = () => {
  const [ref, setRef] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref) return;
    
    // In a real app, we'd search by a reference field. 
    // Here we'll check if the ID exists in our mock data.
    const matter = await mattersDAO.getById(ref);
    if (matter) {
      navigate(`/matters/${ref}`);
    } else {
      setError('No se encontró ningún expediente con esa referencia. Verifica el número e intenta de nuevo.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
        <div style={{ background: 'var(--primary-color)', color: 'white', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Eye size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Orical 360</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ingresa el número de referencia o ID del proceso para acceder a la vista integral de la actuación.</p>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Ej: matter-123..." 
              value={ref}
              onChange={e => { setRef(e.target.value); setError(''); }}
              style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.8rem', fontSize: '1.1rem' }} 
            />
          </div>
          
          {error && (
            <div style={{ color: 'var(--status-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            Consultar Expediente Integral
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
          ¿No conoces la referencia? <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/matters')}>Ver lista de asuntos</span>
        </div>
      </div>
    </div>
  );
};

export default Orical360Search;
