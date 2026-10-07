import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { ShellContext } from '../../shell-contract';
import { productsApi } from '../api/productsApi';

export function FramePhoto({ url, label, large = false, version = 0 }: { url: string | null; label: string; large?: boolean; version?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url, version]);
  const src = url?.startsWith('blob:') ? url : url ? `${url}${url.includes('?') ? '&' : '?'}v=${version}` : null;
  return src && !failed ? <img src={src} alt={label} onError={() => setFailed(true)}
    style={{ width: large ? '100%' : 40, maxWidth: large ? 400 : 40, height: large ? 240 : 40, objectFit: 'contain', borderRadius: 8 }} /> :
    <span aria-label={failed ? 'No se pudo cargar la foto' : 'Sin foto'}>{large ? (failed ? 'No se pudo cargar la foto.' : 'Esta montura todavía no tiene foto.') : '👓'}</span>;
}

export function FramePhotoEditor({ shell, frameId, onSaved }: { shell: ShellContext; frameId: string; onSaved: () => void }) {
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function select(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    if (next && (!['image/jpeg', 'image/png'].includes(next.type) || next.size > 2 * 1024 * 1024)) {
      setFile(null); setFailure('Selecciona una imagen JPG o PNG de hasta 2 MB.'); return;
    }
    setFile(next); setFailure(null);
  }
  async function save() {
    if (!file || pending) return;
    setPending(true); setFailure(null);
    try {
      await api.uploadImage(frameId, file);
      setFile(null); shell.notify('Foto actualizada', 'success'); onSaved();
    } catch (error) {
      setFailure((error as { info?: { userMessage: string } }).info?.userMessage ?? 'No se pudo guardar la foto.');
    } finally { setPending(false); }
  }
  return <div className="field">
    <label htmlFor="frame-photo-edit">Cambiar foto de la montura</label>
    <input id="frame-photo-edit" type="file" accept="image/jpeg,image/png" disabled={pending} onChange={select} />
    <p className="hint">JPG o PNG, máximo 2 MB. Selecciona la imagen y guarda el cambio.</p>
    {preview ? <FramePhoto url={preview} label="Vista previa de la nueva foto" large /> : null}
    {failure ? <shell.ui.Banner kind="error">{failure}</shell.ui.Banner> : null}
    <button type="button" className="btn" disabled={!file || pending} onClick={() => void save()}>{pending ? 'Guardando foto…' : 'Guardar foto'}</button>
  </div>;
}
