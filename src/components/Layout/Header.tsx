import { useState, useRef, useEffect } from 'react';
import { Search, Bell, UserCircle, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      superadmin: 'Super Admin',
      abogado_a: 'Abogado (a)',
      directivo_a: 'Directivo (a)',
      asistente: 'Asistente',
    };
    return map[role] || role;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    // For now, redirect to a search results page or just clients/matters with filter
    // Simple implementation: if starts with CLI, go to clients, if MAT go to matters
    const query = searchQuery.toUpperCase();
    if (query.startsWith('CLI-')) {
      navigate('/clients');
    } else if (query.startsWith('MAT-')) {
      navigate('/matters');
    } else {
      // General search could go to a search results page
      navigate(`/clients?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="main-header">
      <form onSubmit={handleSearch} className="header-search" style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por radicado, nombre o docto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%', border: '1px solid var(--border-color)', borderRadius: '6px', height: '38px', outline: 'none' }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          Buscar
        </button>
      </form>
      
      <div className="header-actions">
        <button className="icon-btn" title="Notificaciones">
          <Bell size={20} />
        </button>
        <div 
          className="user-profile" 
          onClick={() => setShowDropdown(!showDropdown)} 
          style={{ cursor: 'pointer', position: 'relative' }}
          ref={dropdownRef}
        >
          <UserCircle size={24} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {user?.name || 'Usuario'} 
              <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '10px' }}>CLOUD</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{getRoleLabel(user?.role)}</span>
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
              background: 'white', borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              width: '200px', zIndex: 50, overflow: 'hidden', border: '1px solid var(--border-color)',
              color: 'var(--text-main)', textAlign: 'left'
            }}>
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mi Cuenta</div>
                <button 
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  style={{ width: '100%', padding: '0.5rem 1rem', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserCircle size={16} /> Ver Perfil
                </button>
                <button style={{ width: '100%', padding: '0.5rem 1rem', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-main)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <SettingsIcon size={16} /> Ajustes
                </button>
              </div>
              <div style={{ padding: '0.5rem' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); }}
                  style={{ width: '100%', padding: '0.5rem 1rem', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--status-danger)', fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
