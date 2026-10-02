import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { ShellContext } from '../../shell-contract';
import { productsApi } from '../api/productsApi';
import { validateStockEntry } from '../model/validation';

/** Registers a supplier entry against a frame; the same idempotency key never adds the units twice. */
export function StockEntryForm({ shell, frameId, onSaved }: { shell: ShellContext; frameId: string; onSaved: () => void }): ReactNode {
  const { ui } = shell;
  const api = useMemo(() => productsApi(shell.api), [shell.api]);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [attempted, setAttempted] = useState(false);
  const clientErrors = validateStockEntry(quantity);
  const { submit, pending, error, fieldErrors } = ui.useSubmit(
    (key) => api.addStock(frameId, Number(quantity), reason.trim() || null, key),
    `${frameId}:${quantity}:${reason}`,
  );
  const errors = { ...(attempted ? clientErrors : {}), ...fieldErrors };

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAttempted(true);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    if (await submit()) {
      shell.notify('Entrada de stock registrada', 'success');
      setQuantity('');
      setReason('');
      setAttempted(false);
      onSaved();
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="toolbar" aria-label="Registrar entrada de stock">
      {error && Object.keys(fieldErrors).length === 0 ? <ui.Banner kind="error">{error.userMessage}</ui.Banner> : null}
      <ui.TextField id="entry-quantity" label="Unidades a ingresar" required inputMode="numeric" value={quantity}
        onChange={setQuantity} error={errors.quantity} maxLength={7} />
      <ui.TextField id="entry-reason" label="Motivo (opcional)" value={reason} onChange={setReason} maxLength={255} />
      <button type="submit" className="btn" disabled={pending}>
        {pending ? 'Guardando…' : 'Registrar entrada'}
      </button>
    </form>
  );
}
