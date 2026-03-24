import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ocrService } from '../services/ocrService';
import { pdfExtractService } from '../services/pdfExtractService';
import { wordExportService } from '../services/wordExportService';
import {
  Upload, FileText, FileImage, Trash2, ScanText,
  Download, FileDown, Copy, Check, AlertCircle, X
} from 'lucide-react';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Vimana360 = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [editedText, setEditedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      alert('Tipo de archivo no soportado. Use JPG, PNG o PDF.');
      return;
    }
    setFile(f);
    const isPDF = f.type === 'application/pdf';
    setFileType(isPDF ? 'pdf' : 'image');
    setEditedText('');
    setStatus('idle');
    setProgress(0);
    setPreviewUrl(!isPDF ? URL.createObjectURL(f) : null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, []);

  const handleExtract = async () => {
    if (!file || !fileType) return;
    setStatus('processing');
    setProgress(0);
    try {
      let text = '';
      if (fileType === 'image') {
        setProgressMsg('Reconociendo texto con OCR...');
        text = await ocrService.extractFromImage(file, (p) => {
          setProgress(p);
          setProgressMsg(`Procesando imagen... ${p}%`);
        });
      } else {
        setProgressMsg('Extrayendo texto del PDF...');
        text = await pdfExtractService.extractFromPDF(file, (p) => {
          setProgress(p);
          setProgressMsg(`Procesando páginas PDF... ${p}%`);
        });
      }
      setEditedText(text);
      setStatus('done');
      setProgress(100);
      setProgressMsg('¡Texto extraído correctamente!');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setProgressMsg('Error durante la extracción. Intente con otro archivo.');
    }
  };

  const reset = () => {
    setFile(null);
    setFileType(null);
    setPreviewUrl(null);
    setEditedText('');
    setStatus('idle');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleCopy = async () => {
    await wordExportService.toClipboard(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = async () => {
    setExportingWord(true);
    await wordExportService.toWord(editedText, file?.name || 'documento');
    setExportingWord(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ScanText size={24} color="var(--primary-color)" /> Vimana 360
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Extrae texto de imágenes y PDFs · Edita · Exporta a Word o TXT
          </p>
        </div>
        {file && (
          <button className="btn-secondary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <X size={16} /> Nuevo Archivo
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: status === 'done' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* LEFT: upload + extraction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Drop zone */}
          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '4rem 2rem',
                textAlign: 'center',
                background: isDragging ? 'rgba(30,58,95,0.04)' : '#fafbfd',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Upload size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                Arrastra tu archivo aquí
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                o haz clic para seleccionar desde tu computador
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['JPG', 'JPEG', 'PNG', 'PDF'].map(ext => (
                  <span key={ext} style={{ background: '#dbeafe', color: '#1e40af', padding: '0.15rem 0.6rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>{ext}</span>
                ))}
              </div>
              <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            </div>
          ) : (
            <div className="card">
              {/* File info bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 44, height: 44, borderRadius: '8px', background: fileType === 'pdf' ? '#fef3c7' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {fileType === 'pdf' ? <FileText size={22} color="#d97706" /> : <FileImage size={22} color="#0284c7" />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fileType?.toUpperCase()} · {formatSize(file.size)}</div>
                </div>
                <button onClick={reset} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.25rem' }}>
                  <Trash2 size={18} color="#ef4444" />
                </button>
              </div>

              {/* Image preview */}
              {previewUrl && (
                <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                  <img src={previewUrl} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain' }} />
                </div>
              )}

              {/* PDF info block */}
              {fileType === 'pdf' && (
                <div style={{ marginBottom: '1rem', padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', textAlign: 'center', color: '#92400e' }}>
                  <FileText size={36} style={{ marginBottom: '0.5rem', opacity: 0.7 }} />
                  <div style={{ fontWeight: 600 }}>PDF cargado y listo para procesar</div>
                </div>
              )}

              {/* Progress bar */}
              {(status === 'processing' || status === 'done') && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: status === 'error' ? '#ef4444' : 'inherit' }}>{progressMsg}</span>
                    <span style={{ fontWeight: 600 }}>{progress}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: '50px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: status === 'error' ? '#ef4444' : 'var(--primary-color)', borderRadius: '50px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              {/* Error message */}
              {status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} /> {progressMsg}
                </div>
              )}

              {/* Extract button */}
              {status !== 'done' && (
                <button
                  className="btn-primary"
                  onClick={handleExtract}
                  disabled={status === 'processing'}
                  style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {status === 'processing'
                    ? <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>◌</span> Procesando...</>
                    : <><ScanText size={20} /> Extraer Texto</>
                  }
                </button>
              )}

              {status === 'done' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600, padding: '0.5rem', justifyContent: 'center' }}>
                  <Check size={20} /> Extracción completada — edita y exporta en el panel derecho
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: text editor + export */}
        {status === 'done' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ScanText size={18} /> Texto Reconocido
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }} onClick={() => setEditedText('')}>Limpiar</button>
              </div>
            </div>

            <textarea
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              placeholder="El texto extraído aparecerá aquí. Puedes editarlo antes de exportar..."
              style={{
                flex: 1,
                minHeight: '380px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                lineHeight: 1.8,
                padding: '1rem',
                border: '1.5px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                background: '#fffef9',
                color: 'var(--text-main)',
              }}
            />

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {editedText.length.toLocaleString()} caracteres · {editedText.split(/\s+/).filter(Boolean).length.toLocaleString()} palabras
            </div>

            {/* Export buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <button
                className="btn-primary"
                onClick={handleExportWord}
                disabled={exportingWord || !editedText.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}
              >
                <Download size={16} />
                {exportingWord ? 'Generando...' : 'Word (.docx)'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => wordExportService.toTxt(editedText, file?.name || 'texto')}
                disabled={!editedText.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}
              >
                <FileDown size={16} /> TXT
              </button>
              <button
                className="btn-secondary"
                onClick={handleCopy}
                disabled={!editedText.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}
              >
                {copied ? <><Check size={16} /> ¡Copiado!</> : <><Copy size={16} /> Copiar</>}
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
              Generado por <strong>Vimana 360</strong> · Usuario: {user?.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vimana360;
