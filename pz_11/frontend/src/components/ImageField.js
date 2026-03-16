import { useState, useRef } from 'react';

export default function ImageField({ value, onChange }) {
  const [mode, setMode] = useState('url');
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-group">
      <label className="form-label">фото товара</label>
      <div className="img-tabs">
        <button type="button" className={`img-tab ${mode === 'url' ? 'active' : ''}`} onClick={() => setMode('url')}>
          по ссылке
        </button>
        <button type="button" className={`img-tab ${mode === 'file' ? 'active' : ''}`} onClick={() => setMode('file')}>
          загрузить файл
        </button>
      </div>
      {mode === 'url' && (
        <input
          className="form-input"
          type="text"
          placeholder="https://..."
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {mode === 'file' && (
        <>
          <div className="img-drop-area" onClick={() => fileRef.current.click()}>
            нажмите чтобы выбрать файл
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </>
      )}
      {value && (
        <img src={value} alt="preview" className="img-preview" onError={(e) => { e.target.style.display = 'none'; }} />
      )}
    </div>
  );
}
