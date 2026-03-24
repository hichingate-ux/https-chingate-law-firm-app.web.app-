import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, MapPin, ChevronLeft, Save, Edit3, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersDAO } from '../services/db';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    description: '',
    location: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || '',
        email: user.email || '',
        phone: user.phone || '',
        description: user.description || '',
        location: user.location || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    try {
      await usersDAO.update(user.id, formData);
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Perfil Profesional</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gestiona tu información personal y profesional</p>
          </div>
        </div>
        {!isEditing && (
          <button className="btn-primary" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={16} /> Editar Perfil
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
        {/* Left Column: Avatar & Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem' }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                background: 'var(--primary-color)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '4rem', fontWeight: 'bold', overflow: 'hidden',
                border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {formData.avatar ? <img src={formData.avatar} alt={formData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : formData.name.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <button style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <ImageIcon size={18} color="var(--primary-color)" />
                </button>
              )}
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{formData.name}</h2>
            <div style={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '1rem' }}>{formData.role}</div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Información de Contacto</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <Mail size={16} color="var(--text-muted)" /> {formData.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <Phone size={16} color="var(--text-muted)" /> {formData.phone || 'No registrado'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
              <MapPin size={16} color="var(--text-muted)" /> {formData.location || 'No registrado'}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info & Editing */}
        <div className="card">
          {isEditing ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Editar Información</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Cargo / Título</label>
                  <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Correo Electrónico</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Teléfono</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ubicación</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ciudad, País" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Descripción Profesional / Bio</label>
                <textarea 
                  rows={6} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe tu trayectoria, especialidades y logros..."
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '0.75rem', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={20} color="var(--primary-color)" /> Acerca de mí / Trayectoria
                </h3>
                <p style={{ lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                  {formData.description || 'Aún no has agregado una descripción profesional.'}
                </p>
              </section>

              <section>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} color="var(--primary-color)" /> Competencias y Especialidades
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>Derecho Civil</span>
                  <span style={{ background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>Litigios</span>
                  <span style={{ background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>Asesoría Corporativa</span>
                  <span style={{ background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>Gestión de Proyectos</span>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
