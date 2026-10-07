import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { accessoriesApi, type NewAccessory } from '../api/accessoriesApi';
import { pesosToCents } from '../model/frame';
import { EMPTY_ACCESSORY, validateAccessory, type AccessoryDraft } from '../model/validation';

function toRequest(draft: AccessoryDraft): NewAccessory {
  return {
    sku: draft.sku.trim(),
    brand: draft.brand.trim() || null,
    category: draft.category.trim(),
    costCents: pesosToCents(draft.costPesos),
    salePriceCents: pesosToCents(draft.salePricePesos),
    stock: Number(draft.stock),
    minStock: Number(draft.minStock),
  };
}

/** Registers an accessory. Brand is optional; category is free text (HU-25). */
export function AccessoryForm({ shell, onCreated }: { shell: ShellContext; onCreated: (id: string) => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => accessoriesApi(shell.api), [shell.api]);
  const [draft, setDraft] = useState<AccessoryDraft>(EMPTY_ACCESSORY);
  const [attempted, setAttempted] = useState(false);
  const clientErrors = validateAccessory(draft);
  const { submit, pending, error, fieldErrors } = ui.useSubmit((key) => api.create(toRequest(draft), key), JSON.stringify(draft));
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  const set = (key: keyof AccessoryDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

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
    shell.notify('Accesorio registrado', 'success');
    onCreated(created.id);
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate aria-label="Nuevo accesorio">
      {error && Object.keys(fieldErrors).length === 0 ? (
        <ui.Banner kind="error" title="No se pudo registrar el accesorio">{error.userMessage}</ui.Banner>
      ) : null}
      <ui.SectionHeading tone="primary" title="Información del producto" description="Identificación y características del catálogo." icon={<><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M6 8h8M6 12h5" /></>} />
      <div className="grid-3">
        <ui.TextField id="accessory-sku" label="SKU" required value={draft.sku} onChange={set('sku')} error={errors.sku}
          maxLength={60} autoComplete="off" hint="Único, por ejemplo ACC-CASE-001" />
        <ui.TextField id="accessory-brand" label="Marca (opcional)" value={draft.brand} onChange={set('brand')} maxLength={80} />
        <ui.TextField id="accessory-category" label="Categoría" required value={draft.category} onChange={set('category')}
          error={errors.category} maxLength={60} hint="Por ejemplo Estuche, Paño de limpieza, Cordón" />
      </div>
      <ui.SectionHeading tone="success" title="Precios y stock" description="Valores de venta y niveles de inventario." icon={<path d="M10 2v16M14 5H8a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H5" />} />
      <div className="grid-2">
        <ui.TextField id="accessory-cost" label="Costo (pesos)" required inputMode="numeric" value={draft.costPesos}
          onChange={set('costPesos')} error={errors.costPesos} maxLength={12} hint="Solo números, sin puntos ni signo" />
        <ui.TextField id="accessory-sale-price" label="Precio de venta (pesos)" required inputMode="numeric"
          value={draft.salePricePesos} onChange={set('salePricePesos')} error={errors.salePricePesos} maxLength={12}
          hint="Debe ser mayor o igual al costo" />
        <ui.TextField id="accessory-stock" label="Stock inicial" required inputMode="numeric" value={draft.stock}
          onChange={set('stock')} error={errors.stock} maxLength={7} />
        <ui.TextField id="accessory-min-stock" label="Stock mínimo" required inputMode="numeric" value={draft.minStock}
          onChange={set('minStock')} error={errors.minStock} maxLength={7} />
      </div>
      <div className="actions">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Guardando…' : 'Registrar accesorio'}
        </button>
      </div>
    </form>
  );
}
