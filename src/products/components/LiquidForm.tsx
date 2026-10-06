import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { liquidsApi, type NewLiquid } from '../api/liquidsApi';
import { pesosToCents } from '../model/frame';
import { EMPTY_LIQUID, validateLiquid, type LiquidDraft } from '../model/validation';

function toRequest(draft: LiquidDraft): NewLiquid {
  return {
    sku: draft.sku.trim(),
    brand: draft.brand.trim(),
    volumeMl: Number(draft.volumeMl),
    costCents: pesosToCents(draft.costPesos),
    salePriceCents: pesosToCents(draft.salePricePesos),
    stock: Number(draft.stock),
    minStock: Number(draft.minStock),
  };
}

/** Registers a liquid (lens cleaner, contact lens solution...), sold by container size (HU-25). */
export function LiquidForm({ shell, onCreated }: { shell: ShellContext; onCreated: (id: string) => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => liquidsApi(shell.api), [shell.api]);
  const [draft, setDraft] = useState<LiquidDraft>(EMPTY_LIQUID);
  const [attempted, setAttempted] = useState(false);
  const clientErrors = validateLiquid(draft);
  const { submit, pending, error, fieldErrors } = ui.useSubmit((key) => api.create(toRequest(draft), key), JSON.stringify(draft));
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  const set = (key: keyof LiquidDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

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
    shell.notify('Líquido registrado', 'success');
    onCreated(created.id);
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate aria-label="Nuevo líquido">
      {error && Object.keys(fieldErrors).length === 0 ? (
        <ui.Banner kind="error" title="No se pudo registrar el líquido">{error.userMessage}</ui.Banner>
      ) : null}
      <div className="grid-2">
        <ui.TextField id="liquid-sku" label="SKU" required value={draft.sku} onChange={set('sku')} error={errors.sku}
          maxLength={60} autoComplete="off" hint="Único, por ejemplo LIQ-CLEAN-120" />
        <ui.TextField id="liquid-brand" label="Marca" required value={draft.brand} onChange={set('brand')} error={errors.brand} maxLength={80} />
        <ui.TextField id="liquid-volume" label="Volumen (ml)" required inputMode="numeric" value={draft.volumeMl}
          onChange={set('volumeMl')} error={errors.volumeMl} maxLength={5} hint="Entre 1 y 5000 ml" />
        <ui.TextField id="liquid-cost" label="Costo (pesos)" required inputMode="numeric" value={draft.costPesos}
          onChange={set('costPesos')} error={errors.costPesos} maxLength={12} hint="Solo números, sin puntos ni signo" />
        <ui.TextField id="liquid-sale-price" label="Precio de venta (pesos)" required inputMode="numeric"
          value={draft.salePricePesos} onChange={set('salePricePesos')} error={errors.salePricePesos} maxLength={12}
          hint="Debe ser mayor o igual al costo" />
        <ui.TextField id="liquid-stock" label="Stock inicial" required inputMode="numeric" value={draft.stock}
          onChange={set('stock')} error={errors.stock} maxLength={7} />
        <ui.TextField id="liquid-min-stock" label="Stock mínimo" required inputMode="numeric" value={draft.minStock}
          onChange={set('minStock')} error={errors.minStock} maxLength={7} />
      </div>
      <div className="actions">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? 'Guardando…' : 'Registrar líquido'}
        </button>
      </div>
    </form>
  );
}
