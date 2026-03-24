import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Receipt, UserPlus } from 'lucide-react';
import { clientsDAO } from '../services/db';
import { useAuth } from '../context/AuthContext';

const NewClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'Persona Natural',
    name: '',
    document: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    observations: '',
    responsible: user?.name || '',
    initialService: '',
    status: 'Activo'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const id = await clientsDAO.create({ ...formData, observaciones: formData.observations }, user);
      setClientId(id);
    } catch (error) {
      console.error(error);
      alert('Error al registrar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserPlus size={28} color="var(--primary-color)" /> Registro de Nuevo Cliente
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '2rem' }}>
        <div>
          <label className="form-label">Tipo de Persona</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            required
            className="form-input"
          >
            <option value="Persona Natural">Persona Natural</option>
            <option value="Persona Jurídica">Persona Jurídica</option>
            <option value="Establecimiento de Comercio">Establecimiento de Comercio</option>
          </select>
        </div>

        <div>
          <label className="form-label">Nombre / Razón Social</label>
          <input 
            type="text" 
            required 
            className="form-input"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Nombre completo"
          />
        </div>

        <div>
          <label className="form-label">ID / NIT</label>
          <input 
            type="text" 
            required 
            className="form-input"
            value={formData.document} 
            onChange={e => setFormData({...formData, document: e.target.value})}
            placeholder="Documento de identidad"
          />
        </div>

        {formData.type === 'Persona Jurídica' && (
          <div>
            <label className="form-label">Representante Legal</label>
            <input 
              type="text" 
              className="form-input"
              value={(formData as any).legalRepresentative || ''} 
              onChange={e => setFormData({...formData, legalRepresentative: e.target.value} as any)}
              placeholder="Nombre del representante"
            />
          </div>
        )}

        {formData.type === 'Establecimiento de Comercio' && (
          <>
            <div>
              <label className="form-label">Matrícula Mercantil</label>
              <input 
                type="text" 
                className="form-input"
                value={(formData as any).mercantileRegistry || ''} 
                onChange={e => setFormData({...formData, mercantileRegistry: e.target.value} as any)}
                placeholder="Número de matrícula"
              />
            </div>
            <div>
              <label className="form-label">Propietario</label>
              <input 
                type="text" 
                className="form-input"
                value={(formData as any).ownerName || ''} 
                onChange={e => setFormData({...formData, ownerName: e.target.value} as any)}
                placeholder="Nombre del dueño"
              />
            </div>
          </>
        )}

        <div>
          <label className="form-label">Ciudad</label>
          <input 
            type="text" 
            className="form-input"
            value={formData.city} 
            onChange={e => setFormData({...formData, city: e.target.value})}
            placeholder="Ciudad"
          />
        </div>

        <div>
          <label className="form-label">Teléfono</label>
          <input 
            type="text" 
            className="form-input"
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
            placeholder="Teléfono"
          />
        </div>

        <div>
          <label className="form-label">Correo Electrónico</label>
          <input 
            type="email" 
            className="form-input"
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="form-label">Dirección</label>
          <input 
            type="text" 
            className="form-input"
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})}
            placeholder="Dirección física"
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Estado Inicial</label>
          <select 
            className="form-input"
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="Activo">Activo</option>
            <option value="Prospecto">Prospecto / Lead</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Observaciones Adicionales</label>
          <textarea 
            rows={3} 
            value={formData.observations} 
            onChange={e => setFormData({...formData, observations: e.target.value})}
            placeholder="Detalles importantes sobre el cliente o el caso inicial..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
          ></textarea>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || !!clientId}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}
          >
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </div>
      </form>

      {clientId && (
        <div className="card" style={{ marginTop: '2rem', border: '1px solid var(--primary-color)', backgroundColor: '#f0f7ff' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Acciones Siguientes</h3>
          <p style={{ fontSize: '0.9rem', color: '#475569' }}>El cliente ha sido registrado. ¿Qué deseas hacer ahora?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn-primary" onClick={() => navigate(`/clients/${clientId}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', gridColumn: 'span 2' }}>
              Ver Ficha del Cliente y Crear Asunto
            </button>
            <button className="btn-secondary" onClick={() => navigate('/documents')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Upload size={18} /> Cargar Documentos
            </button>
            <button className="btn-secondary" onClick={() => navigate('/invoices')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Receipt size={18} /> Generar Factura
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewClient;
