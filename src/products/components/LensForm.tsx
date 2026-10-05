import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { lensesApi, type NewLens } from '../api/lensesApi';
import { pesosToCents } from '../model/frame';
import { LENS_TYPE_LABEL } from '../model/lens';
import { EMPTY_LENS, validateLens, type LensDraft } from '../model/validation';

function toRequest(draft: LensDraft): NewLens {
  return {
    sku: draft.sku.trim(),
    brand: draft.brand.trim(),
    lensType: draft.lensType,
    material: draft.material.trim() || null,
    coating: draft.coating.trim() || null,
    refractiveIndexX100: draft.refractiveIndex.trim() ? Math.round(Number(draft.refractiveIndex.trim()) * 100) : null,
    costCents: pesosToCents(draft.costPesos),
    salePriceCents: pesosToCents(draft.salePricePesos),
    stock: Number(draft.stock),
    minStock: Number(draft.minStock),
  };
}

/** Registers a lens. Same money-in-pesos convention as {@link FrameForm}. */
export function LensForm({ shell, onCreated }: { shell: ShellContext; onCreated: (id: string) => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => lensesApi(shell.api), [shell.api]);
  const [draft, setDraft] = useState<LensDraft>(EMPTY_LENS);
  const [attempted, setAttempted] = useState(false);
  const clientErrors = validateLens(draft);
  const { submit, pending, error, fieldErrors } = ui.useSubmit((key) => api.create(toRequest(draft), key), JSON.stringify(draft));
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  const set = (key: keyof LensDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    const created = await submit();
    if (!created) {
      return;
    }
    shell.notify('Lente registrado', 'success');
    onCreated(created.id);
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate aria-label="Nuevo lente">
      {error && Object.keys(fieldErrors).length === 0 ? (
        <ui.Banner kind="error" title="No se pudo registrar el lente">{error.userMessage}</ui.Banner>
      ) : null}
      <div className="grid-2">
        <ui.TextField id="lens-sku" label="SKU" required value={draft.sku} onChange={set('sku')} error={errors.sku}
          maxLength={60} autoComplete="off" hint="Único, por ejemplo LNS-MONO-150" />
        <ui.TextField id="lens-brand" label="Marca" required value={draft.brand} onChange={set('brand')} error={errors.brand} maxLength={80} />
        <ui.SelectField id="lens-type" label="Tipo de lente" required value={draft.lensType} placeholder="Selecciona"
          onChange={set('lensType')} error={errors.lensType}
          options={Object.entries(LENS_TYPE_LABEL).map(([value, label]) => ({ value, label }))} />
        <ui.TextField id="lens-material" label="Material" value={draft.material} onChange={set('material')} maxLength={60} />
        <ui.TextField id="lens-coating" label="Recubrimiento" value={draft.coating} onChange={set('coating')} maxLength={80} />
        <ui.TextField id="lens-refractive-index" label="Índice de refracción" value={draft.refractiveIndex}
          onChange={set('refractiveIndex')} error={errors.refractiveIndex} maxLength={4} hint="Opcional, entre 1.00 y 2.00" />
        <ui.TextField id="lens-cost" label="Costo (pesos)" required inputMode="numeric" value={draft.costPesos}
          onChange={set('costPesos')} error={errors.costPesos} maxLength={12} hint="Solo números, sin puntos ni signo" />
        <ui.TextField id="lens-sale-price" label="Precio de venta (pesos)" required inputMode="numeric"
          value={draft.salePricePesos} onChange={set('salePricePesos')} error={errors.salePricePesos} maxLength={12}
          hint="Debe ser mayor o igual al costo" />
        <ui.TextField id="lens-stock" label="Stock inicial" required inputMode="numeric" value={draft.stock}
          onChange={set('stock')} error={errors.stock} maxLength={7} />
        <ui.TextField id="lens-min-stock" label="Stock mínimo" required inputMode="numeric" value={draft.minStock}
          onChange={set('minStock')} error={errors.minStock} maxLength={7} />
      </div>
      <div className="actions">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Guardando…' : 'Registrar lente'}
        </button>
      </div>
    </form>
  );
}
