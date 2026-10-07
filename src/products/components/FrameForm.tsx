import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { productsApi, type NewFrame } from '../api/productsApi';
import { pesosToCents } from '../model/frame';
import { EMPTY_FRAME, validateFrame, type FrameDraft } from '../model/validation';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

function toRequest(draft: FrameDraft): NewFrame {
  return {
    sku: draft.sku.trim(),
    brand: draft.brand.trim(),
    model: draft.model.trim(),
    color: draft.color.trim() || null,
    material: draft.material.trim() || null,
    gender: draft.gender.trim() || null,
    costCents: pesosToCents(draft.costPesos),
    salePriceCents: pesosToCents(draft.salePricePesos),
    stock: Number(draft.stock),
    minStock: Number(draft.minStock),
    location: draft.location.trim() || null,
    supplier: draft.supplier.trim() || null,
  };
}

/** Registers a frame (HU-05). Money is typed in pesos and converted to cents from the text, never from a float. */
export function FrameForm({ shell, onCreated }: { shell: ShellContext; onCreated: (id: string) => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
  const [draft, setDraft] = useState<FrameDraft>(EMPTY_FRAME);
  const saving = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const clientErrors = validateFrame(draft);
  const { submit, pending, error, fieldErrors } = ui.useSubmit((key) => api.create(toRequest(draft), key), JSON.stringify(draft));
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  const set = (key: keyof FrameDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPhoto(null);
      setPhotoError(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setPhoto(null);
      setPhotoError('Debe ser una imagen JPG o PNG.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPhoto(null);
      setPhotoError('La imagen no debe superar 2 MB.');
      return;
    }
    setPhotoError(null);
    setPhoto(file);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAttempted(true);
    if (saving.current || photoError || Object.keys(clientErrors).length > 0) {
      return;
    }
    saving.current = true;
    setUploading(true);
    try {
    const created = await submit();
    if (!created) {
      return;
    }
    // The frame must exist before it can receive a photo, so the upload happens right after
    // creation; if it fails, the frame stays created and the person sees a separate notice.
    if (photo) {
      try {
        await api.uploadImage(created.id, photo);
      } catch {
        shell.notify('La montura se registró, pero no se pudo subir la foto', 'error');
        onCreated(created.id);
        return;
      }
    }
    shell.notify('Montura registrada', 'success');
    onCreated(created.id);
    } finally {
      saving.current = false;
      setUploading(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate aria-label="Nueva montura">
      {error && Object.keys(fieldErrors).length === 0 ? (
        <ui.Banner kind="error" title="No se pudo registrar la montura">{error.userMessage}</ui.Banner>
      ) : null}
      <ui.SectionHeading tone="primary" title="Información básica" description="Datos principales de identificación de la montura."
        icon={<><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M6 8h8M6 12h5" /></>} />
      <div className="grid-3">
        <ui.TextField id="sku" label="SKU" required value={draft.sku} onChange={set('sku')} error={errors.sku}
          maxLength={60} autoComplete="off" hint="Único, por ejemplo RB5228-2000" />
        <ui.TextField id="brand" label="Marca" required value={draft.brand} onChange={set('brand')} error={errors.brand} maxLength={80} />
        <ui.TextField id="model" label="Modelo" required value={draft.model} onChange={set('model')} error={errors.model} maxLength={80} />
      </div>
      <ui.SectionHeading tone="purple" title="Características" description="Clasificación y apariencia de la montura."
        icon={<><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3" /></>} />
      <div className="grid-3">
        <ui.TextField id="color" label="Color" value={draft.color} onChange={set('color')} maxLength={60} />
        <ui.TextField id="material" label="Material" value={draft.material} onChange={set('material')} maxLength={60} />
        <ui.TextField id="gender" label="Género" value={draft.gender} onChange={set('gender')} maxLength={30} />
      </div>
      <ui.SectionHeading tone="success" title="Precios y stock" description="Valores, niveles de inventario y datos de reposición."
        icon={<path d="M10 2v16M14 5H8a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H5" />} />
      <div className="grid-3">
        <ui.TextField id="costPesos" label="Costo (pesos)" required inputMode="numeric" value={draft.costPesos}
          onChange={set('costPesos')} error={errors.costPesos} maxLength={12} hint="Solo números, sin puntos ni signo" />
        <ui.TextField id="salePricePesos" label="Precio de venta (pesos)" required inputMode="numeric"
          value={draft.salePricePesos} onChange={set('salePricePesos')} error={errors.salePricePesos} maxLength={12}
          hint="Debe ser mayor o igual al costo" />
        <ui.TextField id="stock" label="Stock inicial" required inputMode="numeric" value={draft.stock}
          onChange={set('stock')} error={errors.stock} maxLength={7} />
        <ui.TextField id="minStock" label="Stock mínimo" required inputMode="numeric" value={draft.minStock}
          onChange={set('minStock')} error={errors.minStock} maxLength={7} />
        <ui.TextField id="location" label="Ubicación" value={draft.location} onChange={set('location')} maxLength={80} />
        <ui.TextField id="supplier" label="Proveedor" value={draft.supplier} onChange={set('supplier')} maxLength={120} />
      </div>
      <ui.Field id="frame-photo" label="Foto de la montura" hint="Opcional. JPG o PNG, máximo 2 MB." error={photoError ?? undefined}>
        {(aria) => (
          <>
            <input id="frame-photo" type="file" accept="image/jpeg,image/png" onChange={onPhotoChange} {...aria} />
            {photoPreview ? (
              <img src={photoPreview} alt="Vista previa de la montura"
                style={{ maxWidth: '160px', maxHeight: '120px', display: 'block', marginTop: '0.5rem' }} />
            ) : null}
          </>
        )}
      </ui.Field>
      <div className="actions">
        <button type="submit" className="btn" disabled={pending || uploading}>
          {pending || uploading ? 'Guardando…' : 'Registrar montura'}
        </button>
      </div>
    </form>
  );
}
