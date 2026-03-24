import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ChevronLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { usersDAO } from '../services/db';

const Recovery = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'password';
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const users = await usersDAO.getAll();
      const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() || (phone && u.phone === phone)) as any;
      
      if (!found) {
        setError('No se encontró ninguna cuenta con esta información.');
      } else {
        if (mode === 'user') {
          setMessage(`Tu nombre de usuario (correo) es: ${found.email}`);
        } else {
          setMessage(`Se ha enviado un enlace de restablecimiento a ${found.email} (Simulado).`);
        }
        setSuccess(true);
      }
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <button 
          onClick={() => navigate('/login')} 
          style={{ background: 'transparent', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', padding: 0 }}
        >
          <ChevronLeft size={18} /> Volver al inicio
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
          {mode === 'user' ? 'Recuperar Usuario' : 'Restablecer Contraseña'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {mode === 'user' 
            ? 'Ingresa tu teléfono registrado para recordarte tu correo de acceso.' 
            : 'Ingresa tu correo electrónico para recibir instrucciones.'}
        </p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--status-success)', marginBottom: '1rem' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <p style={{ fontWeight: 500, marginBottom: '2rem' }}>{message}</p>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
              Ir al Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {mode === 'password' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="email" 
                    required 
                    className="form-input" 
                    placeholder="Tu correo registrado"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  />
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Teléfono Celular</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="tel" 
                    required 
                    className="form-input" 
                    placeholder="Tu número registrado"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%' }} 
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? 'Procesando...' : <><Send size={18} /> {mode === 'user' ? 'Enviar Usuario' : 'Enviar Instrucciones'}</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Recovery;
