import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { productsApi, type NewFrame } from '../api/productsApi';
import { pesosToCents } from '../model/frame';
import { EMPTY_FRAME, validateFrame, type FrameDraft } from '../model/validation';

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
  const [attempted, setAttempted] = useState(false);
  const clientErrors = validateFrame(draft);
  const { submit, pending, error, fieldErrors } = ui.useSubmit((key) => api.create(toRequest(draft), key), JSON.stringify(draft));
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  const set = (key: keyof FrameDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    const created = await submit();
    if (created) {
      shell.notify('Montura registrada', 'success');
      onCreated(created.id);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate aria-label="Nueva montura">
      {error && Object.keys(fieldErrors).length === 0 ? (
        <ui.Banner kind="error" title="No se pudo registrar la montura">{error.userMessage}</ui.Banner>
      ) : null}
      <div className="grid-2">
        <ui.TextField id="sku" label="SKU" required value={draft.sku} onChange={set('sku')} error={errors.sku}
          maxLength={60} autoComplete="off" hint="Único, por ejemplo RB5228-2000" />
        <ui.TextField id="brand" label="Marca" required value={draft.brand} onChange={set('brand')} error={errors.brand} maxLength={80} />
        <ui.TextField id="model" label="Modelo" required value={draft.model} onChange={set('model')} error={errors.model} maxLength={80} />
        <ui.TextField id="color" label="Color" value={draft.color} onChange={set('color')} maxLength={60} />
        <ui.TextField id="material" label="Material" value={draft.material} onChange={set('material')} maxLength={60} />
        <ui.TextField id="gender" label="Género" value={draft.gender} onChange={set('gender')} maxLength={30} />
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
      <div className="actions">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Guardando…' : 'Registrar montura'}
        </button>
      </div>
    </form>
  );
}
