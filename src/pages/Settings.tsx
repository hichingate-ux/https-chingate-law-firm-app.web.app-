import { useEffect, useState } from 'react';
import { configurationsDAO, usersDAO } from '../services/db';
import { Plus, Edit2, Trash2, X, Building2, Users as UsersIcon, Save, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, refreshBranding } = useAuth();
  const [activeTab, setActiveTab] = useState<'branding' | 'users' | 'security'>('branding');
  const [config, setConfig] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '', email: '', role: 'abogado_a', status: 'Activo', cargo: '', password: '',
    phone: '', identification: '', address: ''
  });

  useEffect(() => {
    configurationsDAO.getAll().then(res => {
      if (res.length > 0) setConfig(res[0]);
      else setConfig({ firmName: 'Chingaté Abogados', primaryColor: '#1e3a8a', accentColor: '#f59e0b' });
    });
    loadUsers();
  }, []);

  const loadUsers = () => usersDAO.getAll().then(setUsers);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (config.id) {
      await configurationsDAO.update(config.id, config);
    } else {
      await configurationsDAO.create(config);
    }
    await refreshBranding();
    alert('Configuración guardada exitosamente.');
  };

  const handleOpenUserModal = (u?: any) => {
    if (u) {
      setEditingUserId(u.id);
      setUserFormData(u);
    } else {
      setEditingUserId(null);
      setUserFormData({ name: '', email: '', role: 'abogado_a', status: 'Activo', cargo: '', password: '', phone: '', identification: '', address: '' });
    }
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('¿Eliminar este usuario del sistema?')) {
      await usersDAO.delete(id);
      loadUsers();
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      await usersDAO.update(editingUserId, userFormData);
    } else {
      await usersDAO.create(userFormData);
    }
    setIsUserModalOpen(false);
    loadUsers();
  };

  if (!config) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando configuración...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configuración y Administración</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveTab('branding')}
          className={activeTab === 'branding' ? 'btn-primary' : 'btn-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Building2 size={18} /> Firma y Branding
        </button>
        {user?.role === 'superadmin' && (
          <>
            <button 
              onClick={() => setActiveTab('users')}
              className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UsersIcon size={18} /> Usuarios Internos
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> Seguridad y Acceso
            </button>
          </>
        )}
      </div>

      {activeTab === 'branding' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Branding de la Firma</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Personaliza la identidad visual de Chingaté Abogados en el sistema.</p>
          
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '100%', maxWidth: '300px', height: '100px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {config.logo ? (
                  <img src={config.logo} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: '0.8rem' }}>Sin Logo Cargado</span>
                  </div>
                )}
              </div>
              <label className="btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={16} /> {config.logo ? 'Cambiar Logo' : 'Subir Logo Oficial'}
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setConfig({ ...config, logo: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Sube el archivo que adjuntaste para que el sistema sea idéntico a tu marca.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Nombre de la Firma</label>
                <input type="text" required value={config.firmName || ''} onChange={e => setConfig({...config, firmName: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="form-label">Nit / Identificación</label>
                <input type="text" value={config.nit || ''} onChange={e => setConfig({...config, nit: e.target.value})} style={{ width: '100%' }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Color Principal (Barra Lateral y Botones)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="color" value={config.primaryColor || '#1e3a8a'} onChange={e => setConfig({...config, primaryColor: e.target.value})} style={{ width: '60px', height: '40px', padding: '0', border: '1px solid #ddd', borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{config.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="form-label">Color de Acento</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="color" value={config.accentColor || '#f59e0b'} onChange={e => setConfig({...config, accentColor: e.target.value})} style={{ width: '60px', height: '40px', padding: '0', border: '1px solid #ddd', borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{config.accentColor}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      )}
      {activeTab === 'security' && user?.role === 'superadmin' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>Control de Acceso</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.0rem' }}>Administra cómo se autoriza el ingreso de los nuevos funcionarios al sistema.</p>
          
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Autorización Automática</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Temporalmente, todos los usuarios creados podrán ingresar sin validación manual.</div>
              </div>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input 
                  type="checkbox" 
                  checked={config.autoAuthorizeNewUsers || false}
                  onChange={async (e) => {
                    const newValue = e.target.checked;
                    const updatedConfig = { ...config, autoAuthorizeNewUsers: newValue };
                    setConfig(updatedConfig);
                    if (config.id) {
                      await configurationsDAO.update(config.id, { autoAuthorizeNewUsers: newValue });
                    }
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: config.autoAuthorizeNewUsers ? 'var(--primary-color)' : '#ccc', transition: '.4s', borderRadius: '34px' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: config.autoAuthorizeNewUsers ? 'translateX(26px)' : 'translateX(0)' }}></span>
                </span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', display: 'flex', gap: '1rem' }}>
            <AlertCircle size={20} color="#b45309" />
            <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
              <strong>Nota de Seguridad:</strong> Esta opción está diseñada para estabilizar el acceso durante la fase inicial de implementación. Se recomienda desactivarla una vez el personal esté debidamente registrado.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && user?.role === 'superadmin' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Gestión de Usuarios</h2>
            <button className="btn-primary" onClick={() => handleOpenUserModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Agregar Usuario
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <th style={{ padding: '1rem' }}>Funcionario</th>
                <th style={{ padding: '1rem' }}>Correo</th>
                <th style={{ padding: '1rem' }}>Cargo</th>
                <th style={{ padding: '1rem' }}>Rol</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>{u.cargo || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    {u.role === 'superadmin' ? 'SuperAdmin' : 
                     u.role === 'abogado_a' ? 'Abogado (a)' : 
                     u.role === 'directivo_a' ? 'Directivo (a)' : 
                     u.role === 'asistente' ? 'Asistente' : u.role}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: u.status === 'Activo' ? '#dcfce7' : '#fee2e2', 
                      color: u.status === 'Activo' ? '#166534' : '#991b1b', 
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' 
                    }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleOpenUserModal(u)} style={{ background: 'transparent', color: 'var(--primary-color)', marginRight: '0.5rem' }}><Edit2 size={16}/></button>
                    <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'transparent', color: 'var(--status-danger)' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isUserModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingUserId ? 'Editar Funcionario' : 'Nuevo Funcionario'}</h3>
              <button onClick={() => setIsUserModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Nombre Completo</label>
                <input type="text" required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="form-label">Correo Corporativo</label>
                <input type="email" required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Cargo / Posición</label>
                  <input type="text" value={userFormData.cargo} onChange={e => setUserFormData({...userFormData, cargo: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label className="form-label">Contraseña Inicial</label>
                  <input type="password" placeholder="••••••••" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Identificación (CC/CE)</label>
                  <input type="text" value={userFormData.identification || ''} onChange={e => setUserFormData({...userFormData, identification: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div>
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input type="text" value={userFormData.phone || ''} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label className="form-label">Dirección de Residencia</label>
                <input type="text" value={userFormData.address || ''} onChange={e => setUserFormData({...userFormData, address: e.target.value})} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Rol del Sistema</label>
                  <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} style={{ width: '100%' }}>
                    <option value="superadmin">SuperAdmin</option>
                    <option value="abogado_a">Abogado (a)</option>
                    <option value="directivo_a">Directivo (a)</option>
                    <option value="asistente">Asistente</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Estado de Acceso</label>
                  <select value={userFormData.status} onChange={e => setUserFormData({...userFormData, status: e.target.value})} style={{ width: '100%' }}>
                    <option value="Activo">🟢 Activo</option>
                    <option value="Inactivo">🔴 Inactivo</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsUserModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Funcionario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
